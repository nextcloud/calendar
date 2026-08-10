/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translate as t } from '@nextcloud/l10n'
import { getDefaultCategories } from '../defaults/defaultCategories.js'

/**
 * Gets all supported RFC properties
 *
 * @return {{
 *   accessClass: {readableName: string, icon: string, options: {value: string, label: string}[], multiple: boolean, info: string, defaultValue: string},
 *   location: {readableName: string, placeholder: string, icon: string},
 *   description: {readableName: string, placeholder: string, icon: string, defaultNumberOfRows: number},
 *   status: {readableName: string, icon: string, options: {value: string, label: string}[], multiple: boolean, info: string, defaultValue: string},
 *   timeTransparency: {readableName: string, icon: string, multiple: boolean, info: string, options: {value: string, label: string}[], defaultValue: string},
 *   categories: {readableName: string, icon: string, multiple: boolean, info: string, placeholder: string, tagPlaceholder: string, options: {value: string, label: string}[]},
 *   color: {readableName: string, icon: string, multiple: boolean, info: string},
 * }}
 */
function getRFCProperties() {
	return {
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.1.3
		 */
		accessClass: {
			readableName: t('calendar', 'When shared show'),
			icon: 'Eye',
			options: [
				{ value: 'PUBLIC', label: t('calendar', 'When shared show full event') },
				{ value: 'CONFIDENTIAL', label: t('calendar', 'When shared show only busy') },
				{ value: 'PRIVATE', label: t('calendar', 'When shared hide this event') },
			],
			multiple: false,
			info: t('calendar', 'The visibility of this event in read-only shared calendars.'),
			defaultValue: 'PUBLIC',
		},
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.1.7
		 */
		location: {
			readableName: t('calendar', 'Location'),
			placeholder: t('calendar', 'Add a location'),
			icon: 'MapMarker',
		},
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.1.5
		 */
		description: {
			readableName: t('calendar', 'Description'),
			placeholder: t('calendar', 'Add a description\n'
			+ '\n'
			+ '- What is this meeting about\n'
			+ '- Agenda items\n'
			+ '- Anything participants need to prepare'),
			icon: 'TextBoxOutline',
			defaultNumberOfRows: 2,
		},
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.1.11
		 */
		status: {
			readableName: t('calendar', 'Status'),
			icon: 'Check',
			options: [
				{ value: 'CONFIRMED', label: t('calendar', 'Confirmed') },
				{ value: 'TENTATIVE', label: t('calendar', 'Tentative') },
				{ value: 'CANCELLED', label: t('calendar', 'Canceled') },
			],
			multiple: false,
			info: t('calendar', 'Confirmation about the overall status of the event.'),
			defaultValue: 'CONFIRMED',
		},
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.2.7
		 */
		timeTransparency: {
			readableName: t('calendar', 'Show as'),
			icon: 'Briefcase',
			multiple: false,
			info: t('calendar', 'Take this event into account when calculating free-busy information.'),
			options: [
				{ value: 'TRANSPARENT', label: t('calendar', 'Free') },
				{ value: 'OPAQUE', label: t('calendar', 'Busy') },
			],
			defaultValue: 'TRANSPARENT',
		},
		/**
		 * https://tools.ietf.org/html/rfc5545#section-3.8.1.2
		 */
		categories: {
			readableName: t('calendar', 'Categories'),
			icon: 'Tag',
			multiple: true,
			info: t('calendar', 'Categories help you to structure and organize your events.'),
			placeholder: t('calendar', 'Search or add categories'),
			tagPlaceholder: t('calendar', 'Add this as a new category'),
			options: getDefaultCategories(),
		},
		/**
		 * https://tools.ietf.org/html/rfc7986#section-5.9
		 */
		color: {
			readableName: t('calendar', 'Custom color'),
			icon: 'EyedropperVariant',
			multiple: false,
			info: t('calendar', 'Special color of this event. Overrides the calendar-color.'),
		},
	}
}

export {
	getRFCProperties,
}
