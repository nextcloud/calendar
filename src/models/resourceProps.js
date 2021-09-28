/**
 * @copyright Copyright (c) 2021 Richard Steinmetz
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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
