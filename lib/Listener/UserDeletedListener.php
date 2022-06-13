<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCA\Calendar\Service\Appointments\BookingService;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\User\Events\UserDeletedEvent;
use Psr\Log\LoggerInterface;

/**
 * @template-implements IEventListener<Event|UserDeletedEvent>
 */
class UserDeletedListener implements IEventListener {
	public function __construct(private AppointmentConfigService $appointmentConfigService,
		private BookingService $bookingService,
		private LoggerInterface $logger) {
		$this->appointmentConfigService = $appointmentConfigService;
		$this->bookingService = $bookingService;
		$this->logger = $logger;
	}

	public function handle(Event $event): void {
		if (!($event instanceof UserDeletedEvent)) {
			return;
		}

		$this->bookingService->deleteByUser($event->getUser());
		$this->appointmentConfigService->deleteByUser($event->getUser());

		$this->logger->info("Calendar appointments cleaned up for deleted user " . $event->getUser()->getUID());
	}
}
