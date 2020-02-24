/**
 * @copyright Copyright (c) 2020 Georg Ehrke
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
import { getLocale } from '@nextcloud/l10n'
import { getWeekendDaysForLocale } from './localeWeekendProvider.js'

/**
 * Adds weekend classes to the day cell
 *
 * @param {Object} data The destructuring object
 * @param {Element} el The DOM element of the day cell
 */
export default function({ el }) {
	const locale = getLocale()
	const fcClasses = getWeekendDaysForLocale(locale)
		.map((dayOfWeekend) => 'fc-' + dayOfWeekend)

	for (const fcClass of fcClasses) {
		if (el.classList.contains(fcClass)) {
			el.classList.add('nc-calendar-fc-day-of-weekend')
			return
		}
	}

	el.classList.add('nc-calendar-fc-day-of-workweek')
}
