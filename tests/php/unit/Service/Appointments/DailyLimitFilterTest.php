<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\DailyLimitFilter;
use OCA\Calendar\Service\Appointments\Interval;
use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

/**
 * @requires OCP\Calendar\ICalendarQuery::newQuery
 */
class DailyLimitFilterTest extends TestCase {
	private IManager|MockObject $manager;
	private MockObject|LoggerInterface $logger;
	private DailyLimitFilter $filter;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->manager = $this->createMock(IManager::class);
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->filter = new DailyLimitFilter(
			$this->manager,
			$this->logger,
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
