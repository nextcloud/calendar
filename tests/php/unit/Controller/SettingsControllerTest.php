<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Thomas Citharel <nextcloud@tcit.fr>
 *
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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

use ChristophWurst\Nextcloud\Testing\TestCase;
use Exception;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;
use PHPUnit\Framework\MockObject\MockObject;

class SettingsControllerTest extends TestCase {
	private string $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IConfig|MockObject */
	private $config;

	private SettingsController $controller;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$userId = 'user123';

		$this->controller = new SettingsController($this->appName,
			$this->request, $this->config, $userId);
	}

	/**
	 * @param string $view
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setViewWithAllowedViewDataProvider
	 */
	public function testSetViewWithAllowedView(string $view,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'currentView', $view);
		}

		$actual = $this->controller->setConfig('view', $view);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	/**
	 * @return array
	 */
	public function setViewWithAllowedViewDataProvider():array {
		return [
			['agendaDay', 422],
			['agendaWeek', 422],
			['month', 422],
			['timeGridDay', 200],
			['timeGridWeek', 200],
			['dayGridMonth', 200],
		];
	}

	public function testSetViewWithConfigException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'currentView', 'dayGridMonth')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('view', 'dayGridMonth');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setPopoverWithAllowedValueDataProvider
	 */
	public function testSetPopoverWithAllowedValue(string $value,
		int $expectedStatusCode) {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'skipPopover', $value);
		}

		$actual = $this->controller->setConfig('skipPopover', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setPopoverWithAllowedValueDataProvider():array {
		return [
			['yes', 200],
			['no', 200],
			['maybe', 422]
		];
	}

	public function testSetPopoverWithConfigException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('skipPopover', 'no');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testSetFirstRun():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'firstRun', 'no');

		$actual = $this->controller->setConfig('firstRun', 'some_random_ignored_value');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testSetFirstRunWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'firstRun', 'no')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('firstRun', 'some_random_ignored_value');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testSetTimezone():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'timezone', 'Europe/Berlin');

		$actual = $this->controller->setConfig('timezone', 'Europe/Berlin');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(200, $actual->getStatus());
	}

	public function testSetTimezoneWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'timezone', 'Europe/Berlin')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('timezone', 'Europe/Berlin');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setShowWeekendsWithAllowedValueDataProvider
	 */
	public function testSetShowWeekendsWithAllowedValue(string $value,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'showWeekends', $value);
		}

		$actual = $this->controller->setConfig('showWeekends', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setShowWeekendsWithAllowedValueDataProvider():array {
		return [
			['yes', 200],
			['no', 200],
			['maybe', 422]
		];
	}

	public function testSetShowWeekendsWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'showWeekends', 'no')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('showWeekends', 'no');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setShowWeekNumbersWithAllowedValueDataProvider
	 */
	public function testSetShowWeekNumbersWithAllowedValue(string $value,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'showWeekNr', $value);
		}

		$actual = $this->controller->setConfig('showWeekNr', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setShowWeekNumbersWithAllowedValueDataProvider():array {
		return [
			['yes', 200],
			['no', 200],
			['maybe', 422]
		];
	}

	public function testSetShowWeekNumbersWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'showWeekNr', 'no')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('showWeekNr', 'no');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setEventLimitWithAllowedValueDataProvider
	 */
	public function testSetEventLimitWithAllowedValue(string $value,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'eventLimit', $value);
		}

		$actual = $this->controller->setConfig('eventLimit', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setEventLimitWithAllowedValueDataProvider():array {
		return [
			['yes', 200],
			['no', 200],
			['maybe', 422]
		];
	}

	public function testSetEventLimitWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'eventLimit', 'no')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('eventLimit', 'no');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setSlotDurationWithAllowedValueDataProvider
	 */
	public function testSetSlotDurationWithAllowedValue(string $value,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'slotDuration', $value);
		}

		$actual = $this->controller->setConfig('slotDuration', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setSlotDurationWithAllowedValueDataProvider():array {
		return [
			['00:05:00', 200],
			['00:10:00', 200],
			['00:15:00', 200],
			['00:20:00', 200],
			['00:30:00', 200],
			['01:00:00', 200],
			['00:13:00', 422],
			['01:13:00', 422]
		];
	}

	public function testSetSlotDurationWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'slotDuration', '00:30:00')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('slotDuration', '00:30:00');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	/**
	 * @param string $value
	 * @param int $expectedStatusCode
	 *
	 * @dataProvider setDefaultReminderWithAllowedValueDataProvider
	 */
	public function testSetDefaultReminderWithAllowedValue(string $value,
		int $expectedStatusCode):void {
		if ($expectedStatusCode === 200) {
			$this->config->expects($this->once())
				->method('setUserValue')
				->with('user123', $this->appName, 'defaultReminder', $value);
		}

		$actual = $this->controller->setConfig('defaultReminder', $value);

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals($expectedStatusCode, $actual->getStatus());
	}

	public function setDefaultReminderWithAllowedValueDataProvider():array {
		return [
			['none', 200],
			['-0', 200],
			['0', 200],
			['-300', 200],
			['-600', 200],
			['-900', 200],
			['-1200', 200],
			['-2400', 200],
			['-2400', 200],
			['not-none', 422],
			['NaN', 422],
			['0.1', 422],
			['1', 422],
			['300', 422],
		];
	}

	public function testSetDefaultReminderWithException():void {
		$this->config->expects($this->once())
			->method('setUserValue')
			->with('user123', $this->appName, 'defaultReminder', 'none')
			->will($this->throwException(new Exception));

		$actual = $this->controller->setConfig('defaultReminder', 'none');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(500, $actual->getStatus());
	}

	public function testSetNotExistingConfig():void {
		$actual = $this->controller->setConfig('foo', 'bar');

		$this->assertInstanceOf(JSONResponse::class, $actual);
		$this->assertEquals([], $actual->getData());
		$this->assertEquals(400, $actual->getStatus());
	}
}
