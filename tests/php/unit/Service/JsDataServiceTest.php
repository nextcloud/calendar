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
use OCP\IConfig;
use OCP\IUser;
use OCP\IUserSession;

class JsDataServiceTest extends TestCase {

	/** @var IConfig|\PHPUnit\Framework\MockObject\MockObject */
	private $config;

	/** @var IUserSession|\PHPUnit\Framework\MockObject\MockObject */
	private $userSession;

	/** @var JSDataService */
	private $service;

	protected function setUp(): void {
		parent::setUp();

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

		$this->config->expects($this->at(0))
			->method('getAppValue')
			->with('calendar', 'timezone', 'automatic')
			->willReturn('default-app-value-timezone');
		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with('calendar', 'showTasks', 'yes')
			->willReturn('default-app-value-showTasks');
		$this->config->expects($this->at(2))
			->method('getUserValue')
			->with('john.doe', 'calendar', 'timezone', 'default-app-value-timezone')
			->willReturn('timezone-config-value');
		$this->config->expects($this->at(3))
			->method('getUserValue')
			->with('john.doe', 'calendar', 'showTasks', 'default-app-value-showTasks')
			->willReturn('yes');

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
