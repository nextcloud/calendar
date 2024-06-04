<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\BackgroundJob\JobList;
use OCA\Calendar\BackgroundJob\CleanUpOutdatedBookingsJob;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICalendarQuery;
use OCP\ILogger;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class CleanupOutdatedBookingJobTest extends TestCase {
	/** @var CleanUpOutdatedBookingsJob */
	private $job;

	/** @var mixed|BookingService|MockObject */
	private $service;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	/** @var mixed|ITimeFactory|MockObject */
	private $time;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->time = $this->createMock(ITimeFactory::class);
		$this->service = $this->createMock(BookingService::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->job = new CleanUpOutdatedBookingsJob(
			$this->time,
			$this->service,
			$this->logger
		);
		// Make sure the job is actually run
		$this->time->method('getTime')
			->willReturn(500000);
		// Set a fake ID
		$this->job->setId(99);
	}

	public function testRun(): void {
		$this->service->expects(self::once())
			->method('deleteOutdated');
		$this->logger->expects(self::once())
			->method('info');
		$this->job->setLastRun(0);
		$this->job->execute(
			$this->createMock(JobList::class),
			$this->createMock(ILogger::class)
		);
	}
}
