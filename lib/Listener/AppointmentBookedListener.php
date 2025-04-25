<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IL10N;
use OCP\IUserManager;
use OCP\Talk\IBroker;
use Psr\Log\LoggerInterface;

class AppointmentBookedListener implements IEventListener {

	/** @var IBroker */
	private $broker;

	/** @var IUserManager */
	private $userManager;

	private IL10N $l10n;

	/** @var LoggerInterface */
	private $logger;

	public function __construct(IBroker $broker,
		IUserManager $userManager,
		IL10N $l10n,
		LoggerInterface $logger) {
		$this->broker = $broker;
		$this->userManager = $userManager;
		$this->l10n = $l10n;
		$this->logger = $logger;
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
		$conversation = $this->broker->createConversation(
			$conversationName,
			[$organizer],
			$this->broker->newConversationOptions()->setPublic(),
		);
		$event->getBooking()->setTalkUrl(
			$conversation->getAbsoluteUrl(),
		);
	}

}
