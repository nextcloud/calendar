<?php

declare(strict_types=1);

/**
 * @copyright Copyright (c) 2023 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

namespace OCA\Calendar\Dashboard;

use OCP\Dashboard\IAPIWidgetV2;
use OCP\Dashboard\Model\WidgetItems;

/**
 * Requires Nextcloud >= 27.1.0
 */
class CalendarWidgetV2 extends CalendarWidget implements IAPIWidgetV2 {

	/**
	 * @inheritDoc
	 */
	public function getItemsV2(string $userId, ?string $since = null, int $limit = 7): WidgetItems {
		$widgetItems = $this->getItems($userId, $since, $limit);

		$halfEmptyContentMessage = '';
		if (!empty($widgetItems)) {
			$startOfTomorrow = $this->timeFactory->getDateTime('tomorrow')->getTimestamp();
			if ($widgetItems[0]->getSinceId() >= $startOfTomorrow) {
				$halfEmptyContentMessage = $this->l10n->t('No more events today');
			}
		}

		return new WidgetItems(
			$widgetItems,
			empty($widgetItems) ? $this->l10n->t('No upcoming events') : '',
			$halfEmptyContentMessage,
		);
	}

	/**
	 * @inheritDoc
	 */
	public function load(): void {
		// No assets need to be loaded anymore as the widget is rendered from the API
	}

	/**
	 * @inheritDoc
	 */
	public function getIconClass(): string {
		return 'icon-calendar-dark';
	}
}
