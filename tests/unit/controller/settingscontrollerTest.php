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

class SettingsControllerTest extends \PHPUnit_Framework_TestCase {

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

		$this->controller = new SettingsController($this->appName,
			$this->request, $this->userSession, $this->config);
	}

	/**
	 * @dataProvider setViewWithAllowedViewDataProvider
	 */
	public function testSetViewWithAllowedView($view) {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'currentView', $view);

		$actual = $this->controller->setView($view);

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
		$actual = $this->controller->setView('someForbiddenView');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(422, $actual->getStatus());
	}

	public function testSetViewWithConfigException() {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->setView('month');

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testGetView() {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->returnValue('agendaWeek'));

		$actual = $this->controller->getView();

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals(['value' => 'agendaWeek'], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testGetViewWithConfigException() {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->config->expects($this->once())
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', 'month')
			->will($this->throwException(new \Exception));

		$actual = $this->controller->getView();

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}
}
