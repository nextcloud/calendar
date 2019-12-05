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
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { getYYYYMMDDFromDate } from '../utils/date.js'

/**
 * Handles a click on a day-number in the calendar-grid
 *
 * @param {Object} router The Vue router
 * @param {Object} route The current Vue route
 * @returns {function(Date): void}
 */
export default function(router, route) {
	return function(date) {
		const name = route.name
		const params = Object.assign({}, route.params, {
			firstDay: getYYYYMMDDFromDate(date),
			view: 'timeGridDay',
		})

		// Don't push new route when day and view didn't change
		if (route.params.firstDay === params.firstDay && route.params.view === params.view) {
			return
		}

		router.push({ name, params })
	}
}
