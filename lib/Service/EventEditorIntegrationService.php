<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Service;

use OCA\Calendar\Events\BeforeEventEditorLoadedEvent;
use OCP\EventDispatcher\IEventDispatcher;

/**
 * Dispatches BeforeEventEditorLoadedEvent at most once per request,
 * even if several places (e.g. calendar page, app menu dialog) load the editor.
 */
class EventEditorIntegrationService {
	private bool $dispatched = false;

	public function __construct(
		private IEventDispatcher $eventDispatcher,
	) {
	}

	public function dispatchBeforeLoadedEvent(): void {
		if ($this->dispatched) {
			return;
		}
		$this->dispatched = true;

		$this->eventDispatcher->dispatchTyped(new BeforeEventEditorLoadedEvent());
	}
}
