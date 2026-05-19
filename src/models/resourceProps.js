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
		{ value: 'board-room', label: t('calendar', 'Board room') },
		{ value: 'conference-room', label: t('calendar', 'Conference room') },
		{ value: 'lecture-hall', label: t('calendar', 'Lecture hall') },
		{ value: 'rehearsal-room', label: t('calendar', 'Rehearsal room') },
		{ value: 'studio', label: t('calendar', 'Studio') },
		{ value: 'outdoor-area', label: t('calendar', 'Outdoor area') },
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
	const option = getAllRoomTypes().find((option) => option.value === value)
	return option?.label ?? null
}

/**
 * Short labels for known facility types.
 * Evaluated lazily (inside a function) so that t() is not called at module-import
 * time, which would break test mocks.
 *
 * @return {object}
 */
function getFacilityLabels() {
	return {
		projector: t('calendar', 'Projector'),
		beamer: t('calendar', 'Projector'),
		whiteboard: t('calendar', 'Whiteboard'),
		video_conference: t('calendar', 'Video'),
		videoconference: t('calendar', 'Video'),
		wheelchair_accessible: t('calendar', 'Wheelchair accessible'),
		'wheelchair-accessible': t('calendar', 'Wheelchair accessible'),
		audio: t('calendar', 'Audio'),
		display: t('calendar', 'Display'),
	}
}

/**
 * Get a human-readable label for a facility
 *
 * @param {string} facility The facility identifier
 * @return {string}
 */
export function formatFacility(facility) {
	const lower = facility.toLowerCase().trim()
	return getFacilityLabels()[lower] || facility.charAt(0).toUpperCase() + facility.slice(1)
}
