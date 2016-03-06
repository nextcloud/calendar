<?php
/**
 * ownCloud - Calendar App
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
	$dir = substr(__DIR__, 0, -strlen('tests/unit/controller')) . 'controller/../timezones/';
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

	public function testIndex() {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->config->expects($this->once())
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(1))
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->returnValue('someView'));

		$this->config->expects($this->at(2))
			->method('getUserValue')
			->with('user123', 'settings', 'email')
			->will($this->returnValue('test@bla.com'));

		$actual = $this->controller->index();

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'defaultView' => 'someView',
			'emailAddress' => 'test@bla.com',
		], $actual->getParams());
		$this->assertEquals('main', $actual->getTemplateName());
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
