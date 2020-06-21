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

/**
 * This sorts events when they occur at the same time, have the same duration
 * and the same all-day property
 *
 * @param {EventApi} firstEvent The first full-calendar event
 * @param {EventApi} secondEvent The second full-calendar event
 * @returns {number}
 */
export default function(firstEvent, secondEvent) {
	if (firstEvent.extendedProps.calendarOrder !== secondEvent.extendedProps.calendarOrder) {
		return (firstEvent.extendedProps.calendarOrder - secondEvent.extendedProps.calendarOrder) < 0 ? -1 : 1
	}

	if (firstEvent.extendedProps.calendarName !== secondEvent.extendedProps.calendarName) {
		return (firstEvent.extendedProps.calendarName < secondEvent.extendedProps.calendarName) ? -1 : 1
	}

	if (firstEvent.extendedProps.calendarId !== secondEvent.extendedProps.calendarId) {
		return (firstEvent.extendedProps.calendarId < secondEvent.extendedProps.calendarId) ? -1 : 1
	}

	if (firstEvent.title !== secondEvent.title) {
		return (firstEvent.title < secondEvent.title) ? -1 : 1
	}

	return 0
}
