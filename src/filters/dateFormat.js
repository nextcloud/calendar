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

/**
 * Formats a date object
 *
 * @param {Date} value The date object to format
 * @param {Boolean} isAllDay Whether or not to display only the date part
 * @param {String} locale The locale to format it in
 * @returns {string}
 */
export default (value, isAllDay, locale) => {
	if (isAllDay) {
		return moment(value).locale(locale).format('ll')
	} else {
		return moment(value).locale(locale).format('lll')
	}
}
