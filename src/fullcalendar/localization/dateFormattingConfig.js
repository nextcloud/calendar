/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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
	return {
		// Date formatting:
		eventTimeFormat: {
			hour: '2-digit',
			minute: '2-digit',
		},
		views: {
			dayGridMonth: {
				dayHeaderFormat: { weekday: 'short' },
				titleFormat: { day: 'numeric' },
			},
			timeGridDay: {
				dayHeaderFormat: {
					weekday: 'short',
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					omitCommas: true,
				},
			},
			timeGridWeek: {
				dayHeaderFormat: {
					weekday: 'short',
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					omitCommas: true,
				},
			},
		},
	}
}

export { getDateFormattingConfig }
