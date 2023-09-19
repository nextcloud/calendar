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

use OCA\Calendar\Service\Appointments\BookingService;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\BackgroundJob\TimedJob;
use Psr\Log\LoggerInterface;
use function method_exists;

class CleanUpOutdatedBookingsJob extends TimedJob {
	/** @var LoggerInterface */
	private LoggerInterface $logger;

	/** @var BookingService */
	private $service;

	public function __construct(ITimeFactory $time,
		BookingService $service,
		LoggerInterface $logger) {
		parent::__construct($time);
		$this->service = $service;
		$this->logger = $logger;

		$this->setInterval(24 * 60 * 60);
		/**
		 * @todo remove check with 24+
		 */
		if (method_exists($this, 'setTimeSensitivity')) {
			$this->setTimeSensitivity(self::TIME_INSENSITIVE);
		}
	}


	protected function run($argument): void {
		$outdated = $this->service->deleteOutdated();
		$this->logger->info('Found and deleted ' . $outdated . ' outdated booking confirmations.');
	}
}
