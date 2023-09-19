<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2023 Claus-Justus Heine <himself@claus-justus-heine.de>
 *
 * @author Claus-Justus Heine <himself@claus-justus-heine.de>
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

use OCP\Calendar\ICalendarQuery;
use OCP\Calendar\IManager as ICalendarManager;
use OCP\IL10N;
use OCP\SystemTag\ISystemTag;
use OCP\SystemTag\ISystemTagManager;

/**
 * @psalm-type Category = array{label: string, value: string}
 * @psalm-type CategoryGroup = array{group: string, options: array<int, Category>}
 */
class CategoriesService {
	/** @var ICalendarManager */
	private $calendarManager;

	/** @var ISystemTagManager */
	private $systemTagManager;

	/** @var IL10N */
	private $l;

	public function __construct(ICalendarManager $calendarManager,
		ISystemTagManager $systemTagManager,
		IL10N $l10n) {
		$this->calendarManager = $calendarManager;
		$this->systemTagManager = $systemTagManager;
		$this->l = $l10n;
	}

	/**
	 * This is a simplistic brute-force extraction of all already used
	 * categories from all events accessible to the given user.
	 *
	 * @return array
	 */
	private function getUsedCategories(string $userId): array {
		$categories = [];
		$principalUri = 'principals/users/' . $userId;
		$query = $this->calendarManager->newQuery($principalUri);
		$query->addSearchProperty(ICalendarQuery::SEARCH_PROPERTY_CATEGORIES);
		$calendarObjects = $this->calendarManager->searchForPrincipal($query);
		foreach ($calendarObjects as $objectInfo) {
			foreach ($objectInfo['objects'] as $calendarObject) {
				if (isset($calendarObject['CATEGORIES'])) {
					$categories[] = explode(',', $calendarObject['CATEGORIES'][0][0]);
				}
			}
		}

		// Avoid injecting "broken" categories into the UI (avoid empty
		// categories and categories surrounded by spaces)
		$categories = array_filter(array_map(fn ($label) => trim($label), array_unique(array_merge(...$categories))));

		return $categories;
	}

	/**
	 * Return a grouped array with all previously used categories, all system
	 * tags and all categories found in the iCalendar RFC.
	 *
	 * @return CategoryGroup[]
	 */
	public function getCategories(string $userId): array {
		$systemTags = $this->systemTagManager->getAllTags(true);

		$systemTagCategoryLabels = [];
		/** @var ISystemTag $systemTag */
		foreach ($systemTags as $systemTag) {
			if (!$systemTag->isUserAssignable() || !$systemTag->isUserVisible()) {
				continue;
			}
			$systemTagCategoryLabels[] = $systemTag->getName();
		}
		sort($systemTagCategoryLabels);
		$systemTagCategoryLabels = array_values(array_filter(array_unique($systemTagCategoryLabels)));

		$rfcCategoryLabels = [
			$this->l->t('Anniversary'),
			$this->l->t('Appointment'),
			$this->l->t('Business'),
			$this->l->t('Education'),
			$this->l->t('Holiday'),
			$this->l->t('Meeting'),
			$this->l->t('Miscellaneous'),
			$this->l->t('Non-working hours'),
			$this->l->t('Not in office'),
			$this->l->t('Personal'),
			$this->l->t('Phone call'),
			$this->l->t('Sick day'),
			$this->l->t('Special occasion'),
			$this->l->t('Travel'),
			$this->l->t('Vacation'),
		];
		sort($rfcCategoryLabels);
		$rfcCategoryLabels = array_values(array_filter(array_unique($rfcCategoryLabels)));

		$standardCategories = array_merge($systemTagCategoryLabels, $rfcCategoryLabels);
		$customCategoryLabels = array_values(array_filter($this->getUsedCategories($userId), fn ($label) => !in_array($label, $standardCategories)));

		$categories = [
			[
				'group' => $this->l->t('Custom Categories'),
				'options' => array_map(fn (string $label) => [ 'label' => $label, 'value' => $label ], $customCategoryLabels),
			],
			[
				'group' => $this->l->t('Collaborative Tags'),
				'options' => array_map(fn (string $label) => [ 'label' => $label, 'value' => $label ], $systemTagCategoryLabels),
			],
			[
				'group' => $this->l->t('Standard Categories'),
				'options' => array_map(fn (string $label) => [ 'label' => $label, 'value' => $label ], $rfcCategoryLabels),
			],
		];

		return $categories;
	}
}
