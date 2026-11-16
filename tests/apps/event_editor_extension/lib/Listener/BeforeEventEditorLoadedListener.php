<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\EventEditorExtension\Listener;

use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCA\EventEditorExtension\AppInfo\Application;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IRequest;
use OCP\Util;

class BeforeEventEditorLoadedListener implements IEventListener {
	/**
	 * HTTP header the E2E tests of this app send to load its extension.
	 * Other E2E tests register their own extensions and must not see the one of this app.
	 */
	public const TESTS_HEADER = 'X-Running-Event-Editor-Extension-App-Tests';

	public function __construct(
		private IRequest $request,
	) {
	}

	#[\Override]
	public function handle(Event $event): void {
		if (!$event instanceof BeforeEventEditorLoadedEvent) {
			return;
		}

		if ($this->request->getHeader(self::TESTS_HEADER) !== '1') {
			return;
		}

		Util::addScript(Application::APP_ID, 'editor-extension');
	}
}
