<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IL10N;
use OCP\IUserManager;
use OCP\Talk\IBroker;
use Psr\Log\LoggerInterface;

class AppointmentBookedListener implements IEventListener {

	public function __construct(
		private IBroker $broker,
		private IUserManager $userManager,
		private IL10N $l10n,
		private ITimeFactory $timeFactory,
		private LoggerInterface $logger,
	) {
	}

	#[\Override]
	public function handle(Event $event): void {
		if (!($event instanceof BeforeAppointmentBookedEvent)) {
			// Don't care
			return;
		}

		if (!$event->getConfig()->getCreateTalkRoom()) {
			$this->logger->debug('Booked appointment of config {config} does not need a Talk room', [
				'config' => $event->getConfig()->getId(),
			]);
			return;
		}

		if (!$this->broker->hasBackend()) {
			$this->logger->warning('Can not create Talk room for config {config} because there is no backend', [
				'config' => $event->getConfig()->getId(),
			]);
			return;
		}

		$organizer = $this->userManager->get($event->getConfig()->getUserId());
		if ($organizer === null) {
			$this->logger->error('Could not find appointment owner {uid}', [
				'uid' => $event->getConfig()->getUserId(),
			]);
			return;
		}
		// TRANSLATORS Title for the Talk conversation name that will be created for the appointment. First placeholder is the appointment name, second one is the person who booked the appointement's display name
		$conversationName = $this->l10n->t('%1$s with %2$s', [
			$event->getConfig()->getName(),
			$event->getBooking()->getDisplayName(),
		]);

		$options = $this->broker->newConversationOptions();
		$options->setPublic();
		if (method_exists($options, 'setMeetingDate')) {
			$options->setMeetingDate(
				$this->timeFactory->getDateTime('@' . $event->getBooking()->getStart()),
				$this->timeFactory->getDateTime('@' . $event->getBooking()->getEnd()),
			);
		}

		$conversation = $this->broker->createConversation(
			$conversationName,
			[$organizer],
			$options,
		);
		$event->getBooking()->setTalkUrl(
			$conversation->getAbsoluteUrl(),
		);
	}

}
