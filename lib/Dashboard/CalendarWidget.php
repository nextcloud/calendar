<?php

declare(strict_types=1);
/**
 * @copyright Copyright (c) 2020 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Dashboard;

use OCA\Calendar\AppInfo\Application;
use OCA\Calendar\Service\JSDataService;
use OCP\Dashboard\IWidget;
use OCP\IInitialStateService;
use OCP\IL10N;

class CalendarWidget implements IWidget {

	/**
	 * @var IL10N
	 */
	private $l10n;

	/**
	 * @var IInitialStateService
	 */
	private $initialStateService;

	/**
	 * @var JSDataService
	 */
	private $dataService;

	/**
	 * CalendarWidget constructor.
	 * @param IL10N $l10n
	 * @param IInitialStateService $initialStateService
	 * @param JSDataService $dataService
	 */
	public function __construct(IL10N $l10n,
								IInitialStateService $initialStateService,
								JSDataService $dataService) {
		$this->l10n = $l10n;
		$this->initialStateService = $initialStateService;
		$this->dataService = $dataService;
	}

	/**
	 * @inheritDoc
	 */
	public function getId(): string {
		return Application::APP_ID;
	}

	/**
	 * @inheritDoc
	 */
	public function getTitle(): string {
		return $this->l10n->t('Upcoming events');
	}

	/**
	 * @inheritDoc
	 */
	public function getOrder(): int {
		return 2;
	}

	/**
	 * @inheritDoc
	 */
	public function getIconClass(): string {
		return 'icon-calendar-dark';
	}

	/**
	 * @inheritDoc
	 */
	public function getUrl(): ?string {
		return null;
	}

	/**
	 * @inheritDoc
	 */
	public function load(): void {
		\OCP\Util::addScript('calendar', 'calendar-dashboard');

		$this->initialStateService->provideLazyInitialState(Application::APP_ID, 'dashboard_data', function () {
			return $this->dataService;
		});
	}
}
