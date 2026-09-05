<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Listener;

use OCA\Calendar\AppInfo\Application;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IL10N;
use OCP\INavigationManager;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\Navigation\Events\LoadAdditionalEntriesEvent;
use OCP\ServerVersion;
use OCP\Util;

/**
 * Add the app menu action to create a new event from within any app.
 *
 * @template-implements IEventListener<Event|LoadAdditionalEntriesEvent>
 */
class AppMenuActionListener implements IEventListener {
	/**
	 * Actions in the app menu, and with it the new event dialog,
	 * are only supported since Nextcloud 35.
	 */
	private const APP_MENU_ACTION_VERSION = 35;

	public function __construct(
		private IL10N $l10n,
		private INavigationManager $navigationManager,
		private IURLGenerator $urlGenerator,
		private IUserSession $userSession,
	) {
	}

	/**
	 * Whether the server supports actions in the app menu.
	 */
	public static function hasAppMenuActions(): bool {
		return (new ServerVersion())->getMajorVersion() >= self::APP_MENU_ACTION_VERSION;
	}

	#[\Override]
	public function handle(Event $event): void {
		if (!$event instanceof LoadAdditionalEntriesEvent) {
			return;
		}

		if (!self::hasAppMenuActions()) {
			return;
		}

		// Events can only be created for a user
		if (!$this->userSession->isLoggedIn()) {
			return;
		}

		$this->navigationManager->add([
			'id' => 'calendar:new-event',
			'order' => 4,
			'icon' => $this->urlGenerator->imagePath(Application::APP_ID, 'calendar.svg'),
			'name' => $this->l10n->t('Event'), // TRANSLATORS: This is the label of the action in the app menu to create a new calendar event
			'type' => INavigationManager::TYPE_ACTION,
		]);

		// Handles clicks on the action and spawns the editor
		Util::addScript(Application::APP_ID, 'calendar-appMenu');
	}
}
