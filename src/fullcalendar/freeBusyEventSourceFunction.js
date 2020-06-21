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

import { getColorForFBType } from '../utils/freebusy.js'
import { getParserManager } from 'calendar-js'

/**
 * Converts the response
 *
 * @param {String} uri URI of the resource
 * @param {String} calendarData Calendar-data containing free-busy data
 * @param {boolean} success Whether or not the free-busy request was successful
 * @param {DateTimeValue} start The start of the fetched time-range
 * @param {DateTimeValue} end The end of the fetched time-range
 * @param {Timezone} timezone Timezone of user viewing data
 * @returns {Object[]}
 */
export default function(uri, calendarData, success, start, end, timezone) {
	if (!success) {
		return [{
			id: Math.random().toString(36).substring(7),
			start: start.getInTimezone(timezone).jsDate.toISOString(),
			end: end.getInTimezone(timezone).jsDate.toISOString(),
			resourceId: uri,
			rendering: 'background',
			allDay: false,
			backgroundColor: getColorForFBType('UNKNOWN'),
			borderColor: getColorForFBType('UNKNOWN'),
		}]
	}

	const parserManager = getParserManager()
	const parser = parserManager.getParserForFileType('text/calendar')
	parser.parse(calendarData)

	// TODO: fix me upstream, parser only exports VEVENT, VJOURNAL and VTODO at the moment
	const calendarComponent = parser._calendarComponent
	const freeBusyComponent = calendarComponent.getFirstComponent('VFREEBUSY')
	if (!freeBusyComponent) {
		return []
	}

	const events = []
	for (const freeBusyProperty of freeBusyComponent.getPropertyIterator('FREEBUSY')) {
		/** @var {FreeBusyProperty} freeBusyProperty */
		events.push({
			id: Math.random().toString(36).substring(7),
			start: freeBusyProperty.getFirstValue().start.getInTimezone(timezone).jsDate.toISOString(),
			end: freeBusyProperty.getFirstValue().end.getInTimezone(timezone).jsDate.toISOString(),
			resourceId: uri,
			rendering: 'background',
			backgroundColor: getColorForFBType(freeBusyProperty.type),
		})
	}

	return events
}
