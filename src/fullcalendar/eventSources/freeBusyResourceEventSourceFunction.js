/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getColorForFBType } from '../../utils/freebusy.js'
import { getParserManager } from '@nextcloud/calendar-js'

/**
 * Converts the response
 *
 * @param {string} uri URI of the resource
 * @param {string} calendarData Calendar-data containing free-busy data
 * @param {boolean} success Whether or not the free-busy request was successful
 * @param {DateTimeValue} start The start of the fetched time-range
 * @param {DateTimeValue} end The end of the fetched time-range
 * @param {Timezone} timezone Timezone of user viewing data
 * @return {object[]}
 */
export default function(uri, calendarData, success, start, end, timezone) {
	if (!success) {
		return [{
			id: Math.random().toString(36).substring(7),
			start: start.getInTimezone(timezone).jsDate.toISOString(),
			end: end.getInTimezone(timezone).jsDate.toISOString(),
			resourceId: uri,
			display: 'background',
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
		/** @member {FreeBusyProperty} freeBusyProperty */
		events.push({
			id: Math.random().toString(36).substring(7),
			start: freeBusyProperty.getFirstValue().start.getInTimezone(timezone).jsDate.toISOString(),
			end: freeBusyProperty.getFirstValue().end.getInTimezone(timezone).jsDate.toISOString(),
			resourceId: uri,
			display: 'background',
			classNames: [
				'free-busy-block',
				'free-busy-' + freeBusyProperty.type.toLowerCase(),
			],
			backgroundColor: getColorForFBType(freeBusyProperty.type),
		})
	}

	return events
}
