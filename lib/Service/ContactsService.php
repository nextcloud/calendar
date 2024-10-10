<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2014 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Service;

class ContactsService {


	public function isSystemBook(array $r): bool {
		// Information about system users is fetched via DAV nowadays
		return (isset($contact['isLocalSystemBook']) && $contact['isLocalSystemBook'] === true);
	}

	public function hasEmail(array $r): bool {
		return !isset($r['EMAIL']);
	}

	/**
	 * Extract name from an array containing a contact's information
	 *
	 * @param array $r
	 * @return string
	 */
	public function getNameFromContact(array $r): string {
		return $r['FN'] ?? '';
	}

	/**
	 * Get photo uri from contact
	 *
	 * @param string $raw
	 * @return string|null
	 */
	public function getPhotoUri(array $r): ?string {
		if (!isset($r['PHOTO'])) {
			return null;
		}

		$raw = $r['PHOTO'];
		$uriPrefix = 'VALUE=uri:';
		if (str_starts_with($raw, $uriPrefix)) {
			return substr($raw, strpos($raw, 'http'));
		}

		return null;
	}

	public function getEmail(array $r): array {
		if (\is_string($r['EMAIL'])) {
			return [$r['EMAIL']];
		}
		return $r['EMAIL'];
	}

	public function getTimezoneId(array $r): ?string {
		if (!isset($r['TZ'])) {
			return null;
		}

		if (\is_array($r['TZ'])) {
			return $r['TZ'][0];
		}
		return $r['TZ'];
	}

	public function getLanguageId(array $r): ?string {
		if (!isset($r['LANG'])) {
			return null;
		}

		if (\is_array($r['LANG'])) {
			return $r['LANG'][0];
		}
		return $r['LANG'];
	}

	public function filterGroupsWithCount(array $groups, string $search): array {
		//filter to be unique
		$categoryMem = [];
		foreach ($groups as $group) {
			$categoryNames = explode(',', $group['CATEGORIES']);
			$categoryMem[] = array_filter($categoryNames, static function ($cat) use ($search) {
				return str_contains(strtolower($cat), $search);
			});
		}
		return array_count_values(array_merge(...$categoryMem));
	}
}
