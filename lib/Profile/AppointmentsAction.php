<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

	#[\Override]
	public function preload(IUser $targetUser): void {
		$this->targetUser = $targetUser;

		$this->configs = $this->configService->getAllAppointmentConfigurations(
			$targetUser->getUID(),
			AppointmentConfig::VISIBILITY_PUBLIC
		);
	}

	#[\Override]
	public function getAppId(): string {
		return Application::APP_ID;
	}

	#[\Override]
	public function getId(): string {
		return 'appointments';
	}

	#[\Override]
	public function getDisplayId(): string {
		return $this->l10n->t('Appointments');
	}

	#[\Override]
	public function getTitle(): string {
		if (count($this->configs) === 1) {
			return $this->l10n->t('Schedule appointment "%s"', [
				'name' => $this->configs[0]->getName(),
			]);
		}

		return $this->l10n->t('Schedule an appointment');
	}

	#[\Override]
	public function getPriority(): int {
		return 50;
	}

	#[\Override]
	public function getIcon(): string {
		return $this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('core', 'places/calendar.svg'));
	}

	#[\Override]
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
