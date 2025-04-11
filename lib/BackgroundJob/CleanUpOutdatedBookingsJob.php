<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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


	#[\Override]
	protected function run($argument): void {
		$outdated = $this->service->deleteOutdated();
		$this->logger->info('Found and deleted ' . $outdated . ' outdated booking confirmations.');
	}
}
