<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
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
use OCA\Calendar\Listener\UserDeletedListener;
use OCA\Calendar\Profile\AppointmentsAction;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
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
		$context->registerDashboardWidget(CalendarWidget::class);

		// TODO: drop conditional code when the app is 23+
		if (method_exists($context, 'registerProfileLinkAction')) {
			$context->registerProfileLinkAction(AppointmentsAction::class);
		}

		$context->registerEventListener(UserDeletedEvent::class, UserDeletedListener::class);
	}

	/**
	 * @inheritDoc
	 */
	public function boot(IBootContext $context): void {
	}
}
