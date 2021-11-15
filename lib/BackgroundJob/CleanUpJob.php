<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2021 Anna Larch <anna.larch@gmx.net>
 *
 * @author Anna Larch <anna.larch@gmx.net>
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

namespace OCA\Calendar\BackgroundJob;

use OCA\Calendar\Db\BookingMapper;
use OCA\Mail\Service\CleanupService;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\BackgroundJob\TimedJob;
use OCP\ILogger;

class CleanUpJob extends TimedJob {

	/** @var CleanupService */
	private $cleanupService;

	/** @var BookingMapper */
	private $mapper;
	/** @var ILogger */
	private $logger;

	public function __construct(ITimeFactory $time,
								BookingMapper $mapper,
	ILogger $logger) {
		parent::__construct($time);
		$this->setInterval(24);
		$this->mapper = $mapper;
		$this->logger = $logger;
	}

	protected function run($argument): void {
		$timeStampLimit = $this->time->getTime(); // from the appointment config?
		$bookings = $this->mapper->deleteOutdated( $timeStampLimit);
		$this->logger->info('Found and deleted' . $bookings . ' outdated booking confirmations.', ['app' => 'calendar']);

	}
}
