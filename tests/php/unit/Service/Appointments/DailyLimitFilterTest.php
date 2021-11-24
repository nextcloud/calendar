<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\DailyLimitFilter;
use OCA\Calendar\Service\Appointments\Interval;
use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager;
use PHPUnit\Framework\MockObject\MockObject;

/**
 * @requires OCP\Calendar\ICalendarQuery::newQuery
 */
class DailyLimitFilterTest extends TestCase {

	/** @var IManager|MockObject */
	private $manager;

	/** @var DailyLimitFilter */
	private $filter;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->manager = $this->createMock(IManager::class);

		$this->filter = new DailyLimitFilter(
			$this->manager,
		);
	}

	public function testNoFilteringRequired(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(null);
		$slots = [
			new Interval(0, 100),
		];

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testOneOtherEventButUnrelated(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(1);
		$config->setUserId('user1');
		$config->setTargetCalendarUri('personal');
		$config->setToken('abc123');
		$slots = [
			new Interval(0, 100),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->manager->expects(self::once())
			->method('newQuery')
			->with('principals/users/user1')
			->willReturn($query);
		$this->manager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				[
					'UID' => 'abc',
					'objects' => [
						0 => [
							'X-NC-APPOINTMENT' => [
								0 => [
									0 => 'somethingelse',
								],
							],
						],
					],
				]
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testOneOtherEventButCancelled(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(1);
		$config->setUserId('user1');
		$config->setTargetCalendarUri('personal');
		$config->setToken('abc123');
		$slots = [
			new Interval(0, 100),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->manager->expects(self::once())
			->method('newQuery')
			->with('principals/users/user1')
			->willReturn($query);
		$this->manager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				[
					'UID' => 'abc',
					'objects' => [
						0 => [
							'X-NC-APPOINTMENT' => [
								0 => [
									0 => 'abc123',
								],
							],
							'STATUS' => [
								0 => 'CANCELLED',
							],
						],
					],
				]
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testOneOtherEventButFree(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(1);
		$config->setUserId('user1');
		$config->setTargetCalendarUri('personal');
		$config->setToken('abc123');
		$slots = [
			new Interval(0, 100),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->manager->expects(self::once())
			->method('newQuery')
			->with('principals/users/user1')
			->willReturn($query);
		$this->manager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				[
					'UID' => 'abc',
					'objects' => [
						0 => [
							'X-NC-APPOINTMENT' => [
								0 => [
									0 => 'abc123',
								],
							],
							'STATUS' => [
								0 => 'CANCELLED',
							],
						],
					],
				]
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testOneNotAvailable(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(1);
		$config->setUserId('user1');
		$config->setTargetCalendarUri('personal');
		$config->setToken('abc123');
		$slots = [
			new Interval(0, 100),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->manager->expects(self::once())
			->method('newQuery')
			->with('principals/users/user1')
			->willReturn($query);
		$this->manager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				[
					'UID' => 'abc',
					'objects' => [
						0 => [
							'X-NC-APPOINTMENT' => [
								0 => [
									0 => 'abc123',
								],
							],
						],
					],
				]
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertEmpty($filtered);
	}

	public function testOneAvailableOneNot(): void {
		$config = new AppointmentConfig();
		$config->setDailyMax(1);
		$config->setUserId('user1');
		$config->setTargetCalendarUri('personal');
		$config->setToken('abc123');
		$slot1 = new Interval(0, 100);
		$slot2 = new Interval(60 * 60 * 24, 60 * 60 * 24 + 100);
		$slots = [
			$slot1,
			$slot2,
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->manager->expects(self::once())
			->method('newQuery')
			->with('principals/users/user1')
			->willReturn($query);
		$this->manager->expects(self::exactly(2))
			->method('searchForPrincipal')
			->with($query)
			->willReturnOnConsecutiveCalls(
				[
					[
						'UID' => 'abc',
						'objects' => [
							0 => [
								'X-NC-APPOINTMENT' => [
									0 => [
										0 => 'abc123',
									],
								],
							],
						],
					],
				],
				[],
			);

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame([$slot2], $filtered);
	}
}
