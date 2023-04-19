<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Profile;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\AppointmentConfigService;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserSession;
use OCP\Profile\ILinkAction;
use function count;

class AppointmentsAction implements ILinkAction {
	/** @var IL10N */
	private $l10n;

	/** @var IUserSession */
	private $userSession;

	/** @var AppointmentConfigService */
	private $configService;

	/** @var IURLGenerator */
	private $urlGenerator;

	/** @var IUser|null */
	private $targetUser;

	/** @var AppointmentConfig[] */
	private $configs = [];

	public function __construct(IL10N $l10n,
		IUserSession $userSession,
		AppointmentConfigService $configService,
		IURLGenerator $urlGenerator) {
		$this->l10n = $l10n;
		$this->userSession = $userSession;
		$this->configService = $configService;
		$this->urlGenerator = $urlGenerator;
	}

	public function preload(IUser $targetUser): void {
		$this->targetUser = $targetUser;

		$this->configs = $this->configService->getAllAppointmentConfigurations(
			$targetUser->getUID(),
			AppointmentConfig::VISIBILITY_PUBLIC
		);
	}

	public function getAppId(): string {
		return Application::APP_ID;
	}

	public function getId(): string {
		return 'appointments';
	}

	public function getDisplayId(): string {
		return $this->l10n->t('Appointments');
	}

	public function getTitle(): string {
		if (count($this->configs) === 1) {
			return $this->l10n->t('Schedule appointment "%s"', [
				'name' => $this->configs[0]->getName(),
			]);
		}

		return $this->l10n->t('Schedule an appointment');
	}

	public function getPriority(): int {
		return 50;
	}

	public function getIcon(): string {
		return $this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('core', 'places/calendar.svg'));
	}

	public function getTarget(): ?string {
		if ($this->configs === []) {
			return null;
		}

		// Directly link to this one appointment
		if (count($this->configs) === 1) {
			return $this->urlGenerator->linkToRouteAbsolute(
				'calendar.appointment.show',
				['token' => $this->configs[0]->getToken()]
			);
		}

		// Link to the overview page
		return $this->urlGenerator->linkToRouteAbsolute(
			'calendar.appointment.index',
			['userId' => $this->targetUser->getUID()]
		);
	}
}
