/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { translate as t } from '@nextcloud/l10n'

/**
 * Return all supported room types
 *
 * @return {{label: string, value: string}[]} List of supported room types
 */
export function getAllRoomTypes() {
	return [
		{ value: 'meeting-room', label: t('calendar', 'Meeting room') },
		{ value: 'lecture-hall', label: t('calendar', 'Lecture hall') },
		{ value: 'seminar-room', label: t('calendar', 'Seminar room') },
		{ value: 'other', label: t('calendar', 'Other') },
	]
}

/**
 * Format room type as a human readable and localized string
 *
 * @param {string} value Raw room type
 * @return {string|null} Human readable and localized room type or null if given raw value is invalid
 */
export function formatRoomType(value) {
	const option = getAllRoomTypes().find(option => option.value === value)
	return option?.label ?? null
}
