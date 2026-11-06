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
use OCP\Util;

class BeforeEventEditorLoadedListener implements IEventListener {
	#[\Override]
	public function handle(Event $event): void {
		if (!$event instanceof BeforeEventEditorLoadedEvent) {
			return;
		}

		Util::addScript(Application::APP_ID, 'editor-extension');
	}
}
