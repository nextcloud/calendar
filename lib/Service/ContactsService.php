<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2014 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

class ContactsService {


	/**
	 * @param array $contact
	 * @return bool
	 */
	public function isSystemBook(array $contact): bool {
		// Information about system users is fetched via DAV nowadays
		return (isset($contact['isLocalSystemBook']) && $contact['isLocalSystemBook'] === true);
	}

	/**
	 * @param array $contact
	 * @return bool
	 */
	public function hasEmail(array $contact): bool {
		if (!isset($contact['EMAIL'])) {
			return false;
		}

		if (!is_array($contact['EMAIL']) && !empty($contact['EMAIL'])) {
			return true;
		}

		if (!empty($contact['EMAIL'][0])) {
			return true;
		}

		return false;
	}

	/**
	 * Extract name from an array containing a contact's information
	 *
	 * @param array $contact
	 * @return string
	 */
	public function getNameFromContact(array $contact): string {
		return $contact['FN'] ?? '';
	}

	/**
	 * Get photo uri from contact
	 *
	 * @param array $contact
	 * @return string|null
	 */
	public function getPhotoUri(array $contact): ?string {
		if (!isset($contact['PHOTO'])) {
			return null;
		}

		$raw = $contact['PHOTO'];
		$uriPrefix = 'VALUE=uri:';
		if (str_starts_with($raw, $uriPrefix)) {
			$strpos = strpos($raw, 'http');
			return $strpos !== false ? substr($raw, $strpos) : null;
		}

		return null;
	}

	/**
	 * @param array $contact
	 * @return string[]
	 */
	public function getEmail(array $contact): array {
		if (\is_string($contact['EMAIL'])) {
			return [$contact['EMAIL']];
		}
		return $contact['EMAIL'];
	}

	/**
	 * @param array $contact
	 * @return string|null
	 */
	public function getTimezoneId(array $contact): ?string {
		if (!isset($contact['TZ'])) {
			return null;
		}

		if (\is_array($contact['TZ'])) {
			return $contact['TZ'][0];
		}
		return $contact['TZ'];
	}

	/**
	 * @param array $contact
	 * @return string|null
	 */
	public function getLanguageId(array $contact): ?string {
		if (!isset($contact['LANG'])) {
			return null;
		}

		if (\is_array($contact['LANG'])) {
			return $contact['LANG'][0];
		}
		return $contact['LANG'];
	}

	/**
	 * @param array $groups
	 * @param string $search
	 * @return array
	 */
	public function filterGroupsWithCount(array $groups, string $search): array {
		//filter to be unique
		$categories = [];
		foreach ($groups as $group) {
			// CATEGORIES is sometimes missing (despite being searched for via the backend)
			if (!isset($group['CATEGORIES'])) {
				continue;
			}

			$categories[] = array_filter(explode(',', $group['CATEGORIES']), static function ($cat) use ($search) {
				return str_contains(strtolower($cat), strtolower($search));
			});
		}
		return array_count_values(array_merge(...$categories));
	}

	/**
	 * @param array $contact
	 * @return array
	 */
	public function getAddress(array $contact): array {
		if (\is_string($contact['ADR'])) {
			$contact['ADR'] = [$contact['ADR']];
		}
		$addresses = [];
		foreach ($contact['ADR'] as $address) {
			$addresses[] = trim(preg_replace("/\n+/", "\n", str_replace(';', "\n", $address)));
		}
		return $addresses;
	}
}
