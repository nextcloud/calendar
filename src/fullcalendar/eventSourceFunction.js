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
import { translate as t } from '@nextcloud/l10n'
import {
	hexToRGB,
	isLight,
} from '../utils/color.js'
import logger from '../utils/logger.js'

/**
 * convert an array of calendar-objects to events
 *
 * @param {CalendarObject[]} calendarObjects Array of calendar-objects to turn into fc events
 * @param {Object} calendar The calendar object
 * @param {Date} start Start of time-range
 * @param {Date} end End of time-range
 * @param {Timezone} timezone Desired time-zone
 * @returns {Object}[]
 */
export function eventSourceFunction(calendarObjects, calendar, start, end, timezone) {
	const fcEvents = []
	for (const calendarObject of calendarObjects) {
		let allObjectsInTimeRange
		try {
			allObjectsInTimeRange = calendarObject.getAllObjectsInTimeRange(start, end)
		} catch (error) {
			logger.error(error.message)
			continue
		}

		for (const object of allObjectsInTimeRange) {
			const classNames = []

			if (object.status === 'CANCELLED') {
				classNames.push('fc-event-nc-cancelled')
			} else if (object.status === 'TENTATIVE') {
				classNames.push('fc-event-nc-tentative')
			}

			if (object.hasComponent('VALARM')) {
				classNames.push('fc-event-nc-alarms')
			}

			const jsStart = object.startDate.getInTimezone(timezone).jsDate
			const jsEnd = object.endDate.getInTimezone(timezone).jsDate
			// Technically, an event's end is not allowed to be equal to it's start,
			// because the event's end is exclusive. Most calendar applications
			// (including all big ones) allow creating such events anyway (we do too).
			// If the event's start is equal to it's end, fullcalendar is giving
			// the event a default length of one hour. We are preventing that by
			// adding one second to the end in that case.
			if (jsStart.getTime() === jsEnd.getTime()) {
				jsEnd.setSeconds(jsEnd.getSeconds() + 1)
			}

			const fcEvent = {
				id: [calendarObject.id, object.id].join('###'),
				title: object.title || t('calendar', 'Untitled event'),
				allDay: object.isAllDay(),
				start: jsStart,
				end: jsEnd,
				classNames,
				extendedProps: {
					objectId: calendarObject.id,
					recurrenceId: object.getReferenceRecurrenceId().unixTime,
					canModifyAllDay: object.canModifyAllDay(),
					calendarOrder: calendar.order,
					calendarName: calendar.displayName,
					calendarId: calendar.id,
					darkText: isLight(hexToRGB(calendar.color)),
				},
			}

			// if (object.color) {
			// fcEvent.backgroundColor = object.color
			// fcEvent.textColor = generateTextColorForRGBString(object.color)
			// }

			fcEvents.push(fcEvent)
		}
	}

	return fcEvents
}
