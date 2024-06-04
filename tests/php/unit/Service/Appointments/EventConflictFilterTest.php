<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\EventConflictFilter;
use OCA\Calendar\Service\Appointments\Interval;
use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class EventConflictFilterTest extends TestCase {
	/** @var IManager|MockObject */
	private $calendarManager;

	/** @var EventConflictFilter */
	private $filter;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->calendarManager = $this->createMock(IManager::class);
		$this->logger = $this->createMock(LoggerInterface::class);

		$this->filter = new EventConflictFilter(
			$this->calendarManager,
			$this->logger
		);
	}

	public function testNoConflict(): void {
		$config = new AppointmentConfig();
		$config->setUserId('user1');
		$config->setCalendarFreebusyUris('[]');
		$config->setTargetCalendarUri('personal');
		$config->setPreparationDuration(0);
		$config->setFollowupDuration(0);
		$slots = [
			new Interval(0, 100 * 60),
		];

		$filtered = $this->filter->filter($config, $slots);

		self::assertSame($slots, $filtered);
	}

	public function testConflicts(): void {
		$config = new AppointmentConfig();
		$config->setUserId('user1');
		$config->setCalendarFreebusyUris('[]');
		$config->setTargetCalendarUri('personal');
		$config->setPreparationDuration(0);
		$config->setFollowupDuration(0);
		$slots = [
			new Interval(0, 100 * 60),
		];
		$query = $this->createMock(ICalendarQuery::class);
		$this->calendarManager->expects(self::once())
			->method('newQuery')
			->willReturn($query);
		$this->calendarManager->expects(self::once())
			->method('searchForPrincipal')
			->with($query)
			->willReturn([
				['uid' => 'abc'],
			]);

		$filtered = $this->filter->filter($config, $slots);

		self::assertEmpty($filtered);
	}
}
