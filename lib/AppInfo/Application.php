<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\AppInfo;

use OCA\Calendar\Dashboard\CalendarWidget;
use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCA\Calendar\Listener\AppMenuActionListener;
use OCA\Calendar\Listener\AppointmentBookedListener;
use OCA\Calendar\Listener\CalendarReferenceListener;
use OCA\Calendar\Listener\EditorInitialStateListener;
use OCA\Calendar\Listener\NotifyPushListener;
use OCA\Calendar\Listener\UserDeletedListener;
use OCA\Calendar\Notification\Notifier;
use OCA\Calendar\Profile\AppointmentsAction;
use OCA\Calendar\Reference\ReferenceProvider;
use OCA\Calendar\UserMigration\Migrator;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\Calendar\Events\CalendarObjectCreatedEvent;
use OCP\Calendar\Events\CalendarObjectDeletedEvent;
use OCP\Calendar\Events\CalendarObjectUpdatedEvent;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\INavigationManager;
use OCP\IURLGenerator;
use OCP\IUserSession;
use OCP\L10N\IFactory;
use OCP\Navigation\Events\LoadAdditionalEntriesEvent;
use OCP\ServerVersion;
use OCP\User\Events\UserDeletedEvent;
use OCP\Util;
use Psr\Container\ContainerInterface;

class Application extends App implements IBootstrap {
	/** @var string */
	public const APP_ID = 'calendar';

	/**
	 * Actions in the app menu, and with it the new event dialog,
	 * are only supported since Nextcloud 35.
	 */
	private const APP_MENU_ACTION_VERSION = 35;

	/**
	 * @param array $params
	 */
	public function __construct(array $params = []) {
		parent::__construct(self::APP_ID, $params);
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function register(IRegistrationContext $context): void {
		$context->registerCapability(Capabilities::class);

		$context->registerDashboardWidget(CalendarWidget::class);

		$context->registerProfileLinkAction(AppointmentsAction::class);

		$context->registerReferenceProvider(ReferenceProvider::class);

		$context->registerEventListener(BeforeAppointmentBookedEvent::class, AppointmentBookedListener::class);
		$context->registerEventListener(UserDeletedEvent::class, UserDeletedListener::class);
		$context->registerEventListener(RenderReferenceEvent::class, CalendarReferenceListener::class);
		if ($this->hasAppMenuActions()) {
			// The editor of the new event dialog can be opened on any page
			$context->registerEventListener(BeforeTemplateRenderedEvent::class, EditorInitialStateListener::class);
			// The app navigation action
			$context->registerEventListener(LoadAdditionalEntriesEvent::class, AppMenuActionListener::class);
		}

		$context->registerEventListener(CalendarObjectCreatedEvent::class, NotifyPushListener::class);
		$context->registerEventListener(CalendarObjectUpdatedEvent::class, NotifyPushListener::class);
		$context->registerEventListener(CalendarObjectDeletedEvent::class, NotifyPushListener::class);

		$context->registerNotifierService(Notifier::class);

		$context->registerUserMigrator(Migrator::class);
	}

	/**
	 * @inheritDoc
	 */
	#[\Override]
	public function boot(IBootContext $context): void {
		$this->addContactsMenuScript($context->getServerContainer());
	}

	private function addContactsMenuScript(ContainerInterface $container): void {
		// User needs to be logged in to fetch availability -> disable the feature otherwise
		/** @var IUserSession $userSession */
		$userSession = $container->get(IUserSession::class);
		if (!$userSession->isLoggedIn()) {
			return;
		}

		// The contacts menu/avatar is potentially shown everywhere so an event based loading
		// mechanism doesn't make sense here
		Util::addScript(self::APP_ID, 'calendar-contacts-menu');
		Util::addStyle(self::APP_ID, 'calendar-contacts-menu');
	}

	/**
	 * Whether the server supports actions in the app menu.
	 */
	private function hasAppMenuActions(): bool {
		return (new ServerVersion())->getMajorVersion() >= self::APP_MENU_ACTION_VERSION;
	}
}
