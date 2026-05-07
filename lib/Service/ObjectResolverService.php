<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

use OCP\Calendar\IManager;

class ObjectResolverService {

	public function __construct(
		private IManager $calendarManager,
	) {
	}

	/**
	 * Locate a calendar object by UID across all calendars of the given user.
	 *
	 * @return array{calendarUri: string, objectUri: string}|null
	 */
	public function findByUid(string $userId, string $uid): ?array {
		$principalUri = "principals/users/$userId";
		$calendars = $this->calendarManager->getCalendarsForPrincipal($principalUri);

		foreach ($calendars as $calendar) {
			if ($calendar->isDeleted()) {
				continue;
			}

			$results = $calendar->search('', [], ['uid' => $uid], 1);
			if (!empty($results)) {
				return [
					'calendarUri' => $calendar->getUri(),
					'objectUri' => $results[0]['uri'],
				];
			}
		}

		return null;
	}
}
