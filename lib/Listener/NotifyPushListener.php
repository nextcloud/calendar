<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\DAV\Events\CalendarObjectCreatedEvent;
use OCA\DAV\Events\CalendarObjectDeletedEvent;
use OCA\DAV\Events\CalendarObjectUpdatedEvent;
use OCA\NotifyPush\Queue\IQueue;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IURLGenerator;
use OCP\IUserSession;

/**
 * @template-implements IEventListener<Event|>
 */
class NotifyPushListener implements IEventListener {
	public function __construct(
		private readonly IUserSession $userSession,
		private readonly IURLGenerator $urlGenerator,
		private readonly ?IQueue $queue,
	) {
	}

	/**
	 * @param CalendarObjectCreatedEvent|CalendarObjectUpdatedEvent|CalendarObjectDeletedEvent> $event
	 */
	public function handle(Event $event): void {
		if ($this->queue === null) {
			return;
		}

		$user = $this->userSession->getUser();
		if ($user === null) {
			return;
		}

		// TODO: How to generate this in a more safe way?
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
