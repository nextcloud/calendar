/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
