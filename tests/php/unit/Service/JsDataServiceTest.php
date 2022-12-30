<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2020 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Service;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\Calendar\ICalendarQuery;
use OCP\IConfig;
use OCP\IUser;
use OCP\IUserSession;
use PHPUnit\Framework\MockObject\MockObject;

class JsDataServiceTest extends TestCase {
	/** @var IConfig|MockObject */
	private $config;

	/** @var IUserSession|MockObject */
	private $userSession;

	/** @var JSDataService */
	private $service;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->config = $this->createMock(IConfig::class);
		$this->userSession = $this->createMock(IUserSession::class);

		$this->service = new JSDataService($this->config, $this->userSession);
	}

	public function testJsonSerialize(): void {
		$user = $this->createMock(IUser::class);
		$user->method('getUID')->willReturn('john.doe');
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn($user);

		$this->config
			->method('getAppValue')
			->willReturnMap([
				['calendar', 'timezone', 'automatic', 'default-app-value-timezone'],
				['calendar', 'showTasks', 'yes', 'default-app-value-showTasks']
			]);
		$this->config
			->method('getUserValue')
			->willReturnMap([
				['john.doe', 'calendar', 'timezone', 'default-app-value-timezone', 'timezone-config-value'],
				['john.doe', 'calendar', 'showTasks', 'default-app-value-showTasks', 'yes']
			]);

		$this->assertEquals([
			'timezone' => 'timezone-config-value',
			'show_tasks' => true,
		], $this->service->jsonSerialize());
	}

	public function testJsonSerializeNoUserSession(): void {
		$this->userSession->expects($this->once())
			->method('getUser')
			->willReturn(null);

		$this->config->expects($this->never())
			->method('getAppValue');
		$this->config->expects($this->never())
			->method('getUserValue');

		$this->assertEmpty($this->service->jsonSerialize());
	}
}
