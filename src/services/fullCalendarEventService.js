/**
 * @copyright Copyright (c) 2018 Georg Ehrke
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
 * convert an array of calendar-objects to events
 *
 * @param {CalendarObject[]} calendarObjects Array of calendar-objects to turn into fc events
 * @param {Date} start Start of time-range
 * @param {Date} end End of time-range
 * @param {Timezone} timezone Desired time-zone
 * @returns {Object}[]
 */
export function getFCEventFromEventComponent(calendarObjects, start, end, timezone) {
	const fcEvents = []
	for (const calendarObject of calendarObjects) {
		const allObjectsInTimeRange = calendarObject.getAllObjectsInTimeRange(start, end)
		for (const object of allObjectsInTimeRange) {
			const classNames = []

			if (object.status === 'CANCELLED') {
				classNames.push('fc-event-nc-cancelled')
			} else if (object.status === 'TENTATIVE') {
				classNames.push('fc-event-nc-tentative')
			}

			console.debug(calendarObject)

			fcEvents.push({
				id: [calendarObject.id, object.id].join('###'),
				title: object.title,
				allDay: object.isAllDay(),
				start: object.startDate.getInTimezone(timezone).jsDate,
				end: object.endDate.getInTimezone(timezone).jsDate,
				classNames,
				extendedProps: {
					objectId: calendarObject.id,
					recurrenceId: object.getReferenceRecurrenceId().unixTime,
				}
			})
		}
	}

	return fcEvents
}
