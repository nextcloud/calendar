<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\NotifyPush\Queue\IQueue;
use OCP\Calendar\Events\CalendarObjectCreatedEvent;
use OCP\Calendar\Events\CalendarObjectDeletedEvent;
use OCP\Calendar\Events\CalendarObjectUpdatedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IURLGenerator;
use OCP\IUserSession;

/**
 * @template-implements IEventListener<CalendarObjectCreatedEvent|CalendarObjectUpdatedEvent|CalendarObjectDeletedEvent>
 */
class NotifyPushListener implements IEventListener {
	public function __construct(
		private readonly IUserSession $userSession,
		private readonly IURLGenerator $urlGenerator,
		private readonly ?IQueue $queue,
	) {
	}

	#[\Override]
	public function handle(Event $event): void {
		if (!($event instanceof CalendarObjectCreatedEvent)
			&& !($event instanceof CalendarObjectUpdatedEvent)
			&& !($event instanceof CalendarObjectDeletedEvent)
		) {
			return;
		}

		if ($this->queue === null) {
			return;
		}

		$user = $this->userSession->getUser();
		if ($user === null) {
			return;
		}

		$webroot = $this->urlGenerator->getWebroot();
		$uid = $user->getUID();
		$uri = $event->getCalendarData()['uri'];
		$this->queue->push('notify_custom', [
			'user' => $user->getUID(),
			'message' => 'calendar_sync',
			'body' => [
				'calendarUrl' => "$webroot/remote.php/dav/calendars/$uid/$uri/",
			],
		]);
	}
}
