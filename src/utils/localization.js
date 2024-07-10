/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import moment from '@nextcloud/moment'
import {
	getDayNames,
	getDayNamesMin,
	getDayNamesShort,
	getFirstDay,
	getMonthNames,
	getMonthNamesShort,
} from '@nextcloud/l10n'

/**
 * Maps a moment locale to a vue2-datepicker locale
 *
 * See https://github.com/mengxiong10/vue2-datepicker/blob/master/locale.md
 *
 * @param {string} momentLocale Name of the moment locale
 * @return {object} The vue2-datepicker lang object
 */
const getLangConfigForVue2DatePicker = (momentLocale) => {
	const dateFormat = moment.localeData(momentLocale)
		.longDateFormat('L')
		.toUpperCase()

	return {
		formatLocale: {
			months: getMonthNames(),
			monthsShort: getMonthNamesShort(),
			weekdays: getDayNames(),
			weekdaysShort: getDayNamesShort(),
			weekdaysMin: getDayNamesMin(),
			firstDayOfWeek: getFirstDay(),
			firstWeekContainsDate: moment.localeData(momentLocale).firstDayOfYear(),
			meridiem: moment.localeData(momentLocale).meridiem,
			meridiemParse: moment.localeData(momentLocale).meridiemParse,
			isPM: moment.localeData(momentLocale).isPM,
		},
		yearFormat: 'YYYY',
		monthFormat: 'MMM',
		monthBeforeYear: dateFormat.indexOf('M') < dateFormat.indexOf('Y'),
	}
}

export {
	getLangConfigForVue2DatePicker,
}
