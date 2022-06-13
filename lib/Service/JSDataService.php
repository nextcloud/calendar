<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

use JsonSerializable;
use OCA\Calendar\AppInfo\Application;
use OCP\IConfig;
use OCP\IUserSession;
use ReturnTypeWillChange;

class JSDataService implements JsonSerializable {
	public function __construct(private IConfig $config,
		private IUserSession $userSession) {
	}

	/**
	 * @inheritDoc
	 */
	#[ReturnTypeWillChange]
	public function jsonSerialize() {
		$user = $this->userSession->getUser();

		if ($user === null) {
			return [];
		}

		$defaultTimezone = $this->config->getAppValue(Application::APP_ID, 'timezone', 'automatic');
		$defaultShowTasks = $this->config->getAppValue(Application::APP_ID, 'showTasks', 'yes');
		$timezone = $this->config->getUserValue($user->getUID(), Application::APP_ID, 'timezone', $defaultTimezone);
		$showTasks = $this->config->getUserValue($user->getUID(), Application::APP_ID, 'showTasks', $defaultShowTasks) === 'yes';

		return [
			'timezone' => $timezone,
			'show_tasks' => $showTasks,
		];
	}
}
