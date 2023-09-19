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

/**
 * Returns the date-formatting config for FullCalendar
 *
 * @return {object}
 */
const getDateFormattingConfig = () => {
	const defaultConfig = {
		dayHeaderFormat: 'ddd l',
		titleFormat: 'll',
		slotLabelFormat: 'LT',
	}

	return {
		// Date formatting:
		eventTimeFormat: 'LT',
		views: {
			dayGridMonth: {
				...defaultConfig,
				dayHeaderFormat: 'ddd',
			},
			multiMonthYear: {
				...defaultConfig,
				dayHeaderFormat: 'ddd',
				multiMonthMaxColumns: 4,
			},
			timeGridDay: defaultConfig,
			timeGridWeek: defaultConfig,
			listMonth: {
				// Changes for the List View
				listDayFormat: 'LL, dddd',
				listDaySideFormat: false,
			},
		},
	}
}

export { getDateFormattingConfig }
