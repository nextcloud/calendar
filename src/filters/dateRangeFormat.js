/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import moment from '@nextcloud/moment'
import { translate as t } from '@nextcloud/l10n'

/**
 * Formats a date-range depending on the user's current view
 *
 * @param {string | Date} value The date to format
 * @param {string} view The current view of the user
 * @param {string} locale Which locale to format it in
 * @return {string}
 */
export default (value, view, locale) => {
	switch (view) {
	case 'timeGridDay':
		return moment(value).locale(locale).format('ll')

	case 'timeGridWeek':
		return t('calendar', 'Week {number} of {year}', {
			number: moment(value).locale(locale).week(),
			year: moment(value).locale(locale).weekYear(),
		})

	case 'multiMonthYear':
		return moment(value).locale(locale).format('YYYY')

	case 'dayGridMonth':
	case 'listMonth':
	default:
		return moment(value).locale(locale).format('MMMM YYYY')
	}
}
