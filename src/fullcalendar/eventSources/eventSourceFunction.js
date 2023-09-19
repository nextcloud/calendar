/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
import { translate as t } from '@nextcloud/l10n'
import {
	hexToRGB,
	isLight,
	generateTextColorForHex,
	getHexForColorName,
} from '../../utils/color.js'
import logger from '../../utils/logger.js'
import { getAllObjectsInTimeRange } from '../../utils/calendarObject.js'

/**
 * convert an array of calendar-objects to events
 *
 * @param {CalendarObject[]} calendarObjects Array of calendar-objects to turn into fc events
 * @param {object} calendar The calendar object
 * @param {Date} start Start of time-range
 * @param {Date} end End of time-range
 * @param {Timezone} timezone Desired time-zone
 * @return {object}[]
 */
export function eventSourceFunction(calendarObjects, calendar, start, end, timezone) {
	const fcEvents = []
	for (const calendarObject of calendarObjects) {
		let allObjectsInTimeRange
		try {
			allObjectsInTimeRange = getAllObjectsInTimeRange(calendarObject, start, end)
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

			// For now, we only display
			if (object.name === 'VTODO' && object.endDate === null) {
				continue
			}

			let jsStart, jsEnd
			if (object.name === 'VEVENT') {
				jsStart = object.startDate.getInTimezone(timezone).jsDate
				jsEnd = object.endDate.getInTimezone(timezone).jsDate
			} else if (object.name === 'VTODO') {
				// For tasks, we only want to display when it is due,
				// not for how long it has been in progress already
				jsStart = object.endDate.getInTimezone(timezone).jsDate
				jsEnd = object.endDate.getInTimezone(timezone).jsDate
			} else {
				// We do not want to display anything that's neither
				// an event nor a task
				continue
			}

			// Technically, an event's end is not allowed to be equal to it's start,
			// because the event's end is exclusive. Most calendar applications
			// (including all big ones) allow creating such events anyway (we do too).
			// If the event's start is equal to it's end, fullcalendar is giving
			// the event a default length of one hour. We are preventing that by
			// adding one second to the end in that case.
			if (jsStart.getTime() === jsEnd.getTime()) {
				jsEnd.setSeconds(jsEnd.getSeconds() + 1)
			}

			if (object.name === 'VTODO') {
				classNames.push('fc-event-nc-task')
				if (object.percent === 100 || object.status === 'COMPLETED') {
					classNames.push('fc-event-nc-task-completed')
				}
			}

			let title
			if (object.name === 'VEVENT') {
				if (object.title) {
					title = object.title.replace(/\n/g, ' ')
				} else {
					title = t('calendar', 'Untitled event')
				}
			} else {
				if (object.title) {
					title = object.title.replace(/\n/g, ' ')
				} else {
					title = t('calendar', 'Untitled task')
				}

				if (object.percent !== null) {
					title += ` (${object.percent}%)`
				}
			}

			const fcEvent = {
				id: [calendarObject.id, object.id].join('###'),
				title,
				allDay: object.isAllDay(),
				start: jsStart,
				end: jsEnd,
				// start: formatLocal(jsStart, object.isAllDay()),
				// end: formatLocal(jsEnd, object.isAllDay()),
				classNames,
				extendedProps: {
					objectId: calendarObject.id,
					recurrenceId: object.getReferenceRecurrenceId()
						? object.getReferenceRecurrenceId().unixTime
						: null,
					canModifyAllDay: object.canModifyAllDay(),
					calendarOrder: calendar.order,
					calendarName: calendar.displayName,
					calendarId: calendar.id,
					darkText: isLight(hexToRGB(calendar.color)),
					objectType: object.name,
					percent: object.percent || null,
					davUrl: calendarObject.dav.url,
					location: object.location,
					description: object.description,
				},
			}

			if (object.color) {
				const customColor = getHexForColorName(object.color)
				if (customColor) {
					fcEvent.backgroundColor = customColor
					fcEvent.borderColor = customColor
					fcEvent.textColor = generateTextColorForHex(customColor)
				}
			}

			fcEvents.push(fcEvent)
		}
	}

	return fcEvents
}
