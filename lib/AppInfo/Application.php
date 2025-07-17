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
use OCA\Calendar\Listener\UserDeletedListener;
use OCA\Calendar\Notification\Notifier;
use OCA\Calendar\Profile\AppointmentsAction;
use OCA\Calendar\Reference\ReferenceProvider;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\Collaboration\Reference\RenderReferenceEvent;
use OCP\IUserSession;
use OCP\ServerVersion;
use OCP\User\Events\UserDeletedEvent;
use OCP\Util;
use Psr\Container\ContainerExceptionInterface;
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
		// ServerVersion was added in 31, but we don't care about older versions anyway
		try {
			/** @var ServerVersion $serverVersion */
			$serverVersion = $container->get(ServerVersion::class);
		} catch (ContainerExceptionInterface $e) {
			return;
		}

		// TODO: drop condition once we only support Nextcloud >= 31
		if ($serverVersion->getMajorVersion() >= 31) {
			// The contacts menu/avatar is potentially shown everywhere so an event based loading
			// mechanism doesn't make sense here - well, maybe not when not logged in yet :-)
			$userSession = $container->get(IUserSession::class);
			if (!$userSession->isLoggedIn()) {
				return;
			}
			Util::addScript(self::APP_ID, 'calendar-contacts-menu');
		}
	}
}
