<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Dashboard;

use OCP\Dashboard\IAPIWidgetV2;
use OCP\Dashboard\IReloadableWidget;
use OCP\Dashboard\Model\WidgetItems;

/**
 * Requires Nextcloud >= 27.1.0
 */
class CalendarWidgetV2 extends CalendarWidget implements IAPIWidgetV2, IReloadableWidget {

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

	/**
	 * @inheritDoc
	 */
	public function getReloadInterval(): int {
		return 600;
	}
}
