<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Controller;

function scandir($directory) {
	$dir = substr(__DIR__, 0, -strlen('tests/php/controller')) . 'controller/../timezones/';
	return $dir === $directory ? [
		'..',
		'.',
		'TIMEZONE1.ics',
		'TIMEZONE2.ics',
		'REG-CIT.ics',
		'INFO.md',
	] : [];
}

function file_get_contents($file) {
	$file_parts = explode('/', $file);
	end($file_parts);
	$file = current($file_parts);
	switch($file) {
		case 'TIMEZONE1.ics':
			return 'TIMEZONE1-data';

		case 'TIMEZONE2.ics':
			return 'ANOTHER TIMEZONE DATA';

		case 'REG-CIT.ics':
			return 'TIMEZONE DATA WITH REGION AND CITY';

		default:
			return null;
	}
}

class ViewControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $config;
	private $userSession;

	private $dummyUser;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->config = $this->getMockBuilder('\OCP\IConfig')
			->disableOriginalConstructor()
			->getMock();
		$this->userSession = $this->getMockBuilder('\OCP\IUserSession')
			->disableOriginalConstructor()
			->getMock();

		$this->dummyUser = $this->getMockBuilder('OCP\IUser')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new ViewController($this->appName, $this->request,
			$this->userSession, $this->config);
	}

	/**
	 * @dataProvider indexDataProvider
	 */
	public function testIndex($isAssetPipelineEnabled, $showAssetPipelineError, $serverVersion, $expectsSupportsClass, $expectsWebcalWorkaround) {
		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue($serverVersion));

		$this->config->expects($this->at(1))
			->method('getSystemValue')
			->with('asset-pipeline.enabled', false)
			->will($this->returnValue($isAssetPipelineEnabled));

		if ($showAssetPipelineError) {
			$actual = $this->controller->index();

			$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
			$this->assertEquals([], $actual->getParams());
			$this->assertEquals('main-asset-pipeline-unsupported', $actual->getTemplateName());
		} else {
			$this->userSession->expects($this->once())
				->method('getUser')
				->will($this->returnValue($this->dummyUser));

			$this->dummyUser->expects($this->once())
				->method('getUID')
				->will($this->returnValue('user123'));

			$this->dummyUser->expects($this->once())
				->method('getEMailAddress')
				->will($this->returnValue('test@bla.com'));

			$this->config->expects($this->at(2))
				->method('getAppValue')
				->with($this->appName, 'installed_version')
				->will($this->returnValue('42.13.37'));

			$this->config->expects($this->at(3))
				->method('getUserValue')
				->with('user123', $this->appName, 'currentView', 'month')
				->will($this->returnValue('someView'));

			$this->config->expects($this->at(4))
				->method('getUserValue')
				->with('user123', $this->appName, 'skipPopover', 'no')
				->will($this->returnValue('someSkipPopoverValue'));

			$this->config->expects($this->at(5))
				->method('getUserValue')
				->with('user123', $this->appName, 'showWeekNr', 'no')
				->will($this->returnValue('someShowWeekNrValue'));

			$this->config->expects($this->at(6))
				->method('getAppValue')
				->with('theming', 'color', '#0082C9')
				->will($this->returnValue('#ff00ff'));

			$actual = $this->controller->index();

			$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
			$this->assertEquals([
				'appVersion' => '42.13.37',
				'defaultView' => 'someView',
				'emailAddress' => 'test@bla.com',
				'skipPopover' => 'someSkipPopoverValue',
				'weekNumbers' => 'someShowWeekNrValue',
				'supportsClass' => $expectsSupportsClass,
				'defaultColor' => '#ff00ff',
				'webCalWorkaround' => $expectsWebcalWorkaround
			], $actual->getParams());
			$this->assertEquals('main', $actual->getTemplateName());
		}

	}

	public function indexDataProvider() {
		return [
			[true, true, '9.0.5.2', false, 'yes'],
			[true, false, '9.1.0.0', true, 'no'],
			[false, false, '9.0.5.2', false, 'yes'],
			[false, false, '9.1.0.0', true, 'no']
		];
	}

	public function testGetTimezone() {
		$actual = $this->controller->getTimezone('TIMEZONE1.ics');

		$this->assertInstanceOf('OCP\AppFramework\Http\DataDisplayResponse', $actual);
		$this->assertEquals('TIMEZONE1-data', $actual->getData());
	}

	public function testGetTimezoneWithFakeTz() {
		$actual = $this->controller->getTimezone('TIMEZONE42.ics');

		$this->assertInstanceOf('OCP\AppFramework\Http\NotFoundResponse', $actual);
	}

	public function testGetTimezoneWithRegion() {
		$actual = $this->controller->getTimezoneWithRegion('REG', 'CIT.ics');

		$this->assertInstanceOf('OCP\AppFramework\Http\DataDisplayResponse', $actual);
		$this->assertEquals('TIMEZONE DATA WITH REGION AND CITY', $actual->getData());
	}

	public function testGetTimezoneWithRegionWithFakeTz() {
		$actual = $this->controller->getTimezoneWithRegion('EUROPE', 'BERLIN.ics');

		$this->assertInstanceOf('OCP\AppFramework\Http\NotFoundResponse', $actual);
	}
}
