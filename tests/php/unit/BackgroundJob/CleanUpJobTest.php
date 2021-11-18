<?php
declare(strict_types=1);

use OC\BackgroundJob\JobList;
use OCA\Calendar\BackgroundJob\CleanUpJob;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\ILogger;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;
use Test\TestCase;

/**
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */
class CleanUpJobTest extends TestCase {

	/** @var CleanUpJob */
	private $job;

	/** @var mixed|BookingService|MockObject */
	private $service;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	/** @var mixed|ITimeFactory|MockObject */
	private $time;

	protected function setUp(): void {
		parent::setUp();

		$this->time = $this->createMock(ITimeFactory::class);
		$this->service = $this->createMock(BookingService::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->job = new CleanUpJob(
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
