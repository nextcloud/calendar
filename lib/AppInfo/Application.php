<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\AppInfo;

use OCA\Calendar\Dashboard\CalendarWidget;
use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCA\Calendar\Listener\AppointmentBookedListener;
use OCA\Calendar\Listener\CalendarReferenceListener;
use OCA\Calendar\Listener\NotifyPushListener;
use OCA\Calendar\Listener\UserDeletedListener;
use OCA\Calendar\Notification\Notifier;
use OCA\Calendar\Profile\AppointmentsAction;
use OCA\Calendar\Reference\ReferenceProvider;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Calendar\Events\CalendarObjectCreatedEvent;
use OCP\Calendar\Events\CalendarObjectDeletedEvent;
use OCP\Calendar\Events\CalendarObjectUpdatedEvent;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\IUserSession;
use OCP\User\Events\UserDeletedEvent;
use OCP\Util;
use Psr\Container\ContainerInterface;
use function method_exists;

class Application extends App implements IBootstrap {
	/** @var string */
	public const APP_ID = 'calendar';

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
		$context->registerDashboardWidget(CalendarWidget::class);

		// TODO: drop conditional code when the app is 23+
		if (method_exists($context, 'registerProfileLinkAction')) {
			$context->registerProfileLinkAction(AppointmentsAction::class);
		}
		$context->registerReferenceProvider(ReferenceProvider::class);

		$context->registerEventListener(BeforeAppointmentBookedEvent::class, AppointmentBookedListener::class);
		$context->registerEventListener(UserDeletedEvent::class, UserDeletedListener::class);
		$context->registerEventListener(RenderReferenceEvent::class, CalendarReferenceListener::class);

		$context->registerEventListener(CalendarObjectCreatedEvent::class, NotifyPushListener::class);
		$context->registerEventListener(CalendarObjectUpdatedEvent::class, NotifyPushListener::class);
		$context->registerEventListener(CalendarObjectDeletedEvent::class, NotifyPushListener::class);

		$context->registerNotifierService(Notifier::class);
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
	}
}
