<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\Dav\StripAlarmsPlugin;
use OCA\DAV\Events\SabrePluginAddEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;

/**
 * Registers the StripAlarmsPlugin with the SabreDAV server
 *
 * @template-implements IEventListener<SabrePluginAddEvent>
 */
class SabrePluginAddListener implements IEventListener {

	public function __construct(
		private readonly StripAlarmsPlugin $plugin,
	) {
	}

	/**
	 * Handle the SabrePluginAddEvent by registering the alarm stripping plugin
	 *
	 * @param Event $event The event to handle
	 */
	#[\Override]
	public function handle(Event $event): void {
		if (!($event instanceof SabrePluginAddEvent)) {
			return;
		}

		$event->getServer()->addPlugin($this->plugin);
	}
}
