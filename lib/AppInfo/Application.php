<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\AppInfo;

use OCA\Calendar\Dashboard\CalendarWidget;
use OCA\Calendar\Dashboard\CalendarWidgetV2;
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
use OCP\Dashboard\IAPIWidgetV2;
use OCP\User\Events\UserDeletedEvent;
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
	public function register(IRegistrationContext $context): void {
		// TODO: drop conditional code when the app is 27.1+
		if (interface_exists(IAPIWidgetV2::class)) {
			$context->registerDashboardWidget(CalendarWidgetV2::class);
		} else {
			$context->registerDashboardWidget(CalendarWidget::class);
		}

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
	public function boot(IBootContext $context): void {
	}
}
