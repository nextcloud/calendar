<?php

declare(strict_types=1);

/*
 * @copyright 2022 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2022 Christoph Wurst <christoph@winzerhof-wurst.at>
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
