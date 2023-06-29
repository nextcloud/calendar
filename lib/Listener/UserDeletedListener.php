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
	/** @var AppointmentConfigService */
	private $appointmentConfigService;

	/** @var BookingService */
	private $bookingService;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(AppointmentConfigService $appointmentConfigService,
		BookingService $bookingService,
		LoggerInterface $logger) {
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
