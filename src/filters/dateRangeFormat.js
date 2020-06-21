/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import moment from '@nextcloud/moment'
import { translate as t } from '@nextcloud/l10n'

/**
 * Formats a date-range depending on the user's current view
 *
 * @param {String|Date} value The date to format
 * @param {String} view The current view of the user
 * @param {String} locale Which locale to format it in
 * @returns {string}
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

	case 'dayGridMonth':
	default:
		return moment(value).locale(locale).format('MMMM YYYY')
	}
}
