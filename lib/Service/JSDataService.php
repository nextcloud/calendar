<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2020 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Service;

use OCA\Calendar\AppInfo\Application;
use OCP\IConfig;
use OCP\IUserSession;
use ReturnTypeWillChange;

class JSDataService implements \JsonSerializable {

	/** @var IConfig */
	private $config;

	/** @var IUserSession */
	private $userSession;

	/**
	 * JSDataService constructor.
	 *
	 * @param IConfig $config
	 * @param IUserSession $userSession
	 */
	public function __construct(IConfig $config,
								IUserSession $userSession) {
		$this->config = $config;
		$this->userSession = $userSession;
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
