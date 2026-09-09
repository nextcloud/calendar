<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Service\CalendarInitialStateService;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IUserSession;

/**
 * The new event dialog of the app menu can be opened on any page,
 * so the state the editor needs has to be available everywhere.
 *
 * @template-implements IEventListener<Event|BeforeTemplateRenderedEvent>
 */
class EditorInitialStateListener implements IEventListener {
	public function __construct(
		private IUserSession $userSession,
		private CalendarInitialStateService $calendarInitialStateService,
	) {
	}

	#[\Override]
	public function handle(Event $event): void {
		if (!$event instanceof BeforeTemplateRenderedEvent) {
			return;
		}

		if (!$this->userSession->isLoggedIn()) {
			return;
		}

		$this->calendarInitialStateService->runForEditor();
	}
}
