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

use PHPUnit\Framework\TestCase;

class SettingsControllerTest extends TestCase {

	private $appName;
	private $request;
	private $userSession;
	private $config;

	private $dummyUser;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->userSession = $this->getMockBuilder('OCP\IUserSession')
			->disableOriginalConstructor()
			->getMock();
		$this->config = $this->getMockBuilder('OCP\IConfig')
			->disableOriginalConstructor()
			->getMock();

		$this->dummyUser = $this->getMockBuilder('OCP\IUser')
			->disableOriginalConstructor()
			->getMock();

		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->controller = new SettingsController($this->appName,
			$this->request, $this->userSession, $this->config);
	}

	/**
	 * @dataProvider setViewWithAllowedViewDataProvider
	 */
	public function testSetViewWithAllowedView($view) {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'currentView', $view);

		$actual = $this->controller->setConfig('view', $view);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function setViewWithAllowedViewDataProvider() {
		return [
			['agendaDay'],
			['agendaWeek'],
			['month'],
		];
	}

	public function testSetViewWithForbiddenView() {
		$actual = $this->controller->setConfig('view','someForbiddenView');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(422, $actual->getStatus());
	}

	public function testSetViewWithConfigException() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->setConfig('view', 'month');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetView() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->returnValue('agendaWeek'));

		$actual = $this->controller->getConfig('view');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals(['value' => 'agendaWeek'], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testGetViewWithConfigException() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->getConfig('view');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @dataProvider setPopoverWithAllowedValueDataProvider
	 */
	public function testSetPopoverWithAllowedValue($value) {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'skipPopover', $value);

		$actual = $this->controller->setConfig('skipPopover', $value);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function setPopoverWithAllowedValueDataProvider() {
		return [
			['yes'],
			['no']
		];
	}

	public function testSetPopoverWithForbiddenValue() {
		$actual = $this->controller->setConfig('skipPopover','someForbiddenValue');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(422, $actual->getStatus());
	}

	public function testSetPopoverWithConfigException() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->setConfig('skipPopover', 'no');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetPopover() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->returnValue('agendaWeek'));

		$actual = $this->controller->getConfig('skipPopover');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals(['value' => 'agendaWeek'], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testGetPopoverWithConfigException() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->getConfig('skipPopover');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testSetFirstRun() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'firstRun', 'no');

		$actual = $this->controller->setConfig('firstRun', 'some_random_ignored_value');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testSetFirstRunWithException() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'firstRun', 'no')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->setConfig('firstRun', 'some_random_ignored_value');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetFirstRun() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'firstRun', 'yes')
			->will($this->returnValue('no'));

		$actual = $this->controller->getConfig('firstRun');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals(['value' => 'no'], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testGetFirstRunWithException() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'firstRun', 'yes')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->getConfig('firstRun');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testSetTimezone() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'timezone', 'Europe/Berlin');

		$actual = $this->controller->setConfig('timezone', 'Europe/Berlin');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testSetTimezoneWithException() {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'timezone', 'Europe/Berlin')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->setConfig('timezone', 'Europe/Berlin');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetTimezone() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'timezone', 'automatic')
			->will($this->returnValue('Europe/Berlin'));

		$actual = $this->controller->getConfig('timezone');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals(['value' => 'Europe/Berlin'], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testGetTimezoneWithException() {
		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'timezone', 'automatic')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->getConfig('timezone');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetNotExistingConfig() {
		$actual = $this->controller->getConfig('foo');
		
		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(400, $actual->getStatus());
	}

	public function testSetNotExistingConfig() {
		$actual = $this->controller->setConfig('foo', 'bar');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(400, $actual->getStatus());
	}
}
