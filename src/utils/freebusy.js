/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createFreeBusyRequest, getParserManager } from '@nextcloud/calendar-js'
import { findSchedulingOutbox } from '../services/caldavService.js'

/**
 * Gets the corresponding color for a given Free/Busy type
 *
 * @param {string} type The type of the FreeBusy property
 * @return {string}
 */
export function getColorForFBType(type = 'BUSY') {
	switch (type) {
	case 'FREE':
		return 'rgba(255,255,255,0)'

	case 'BUSY-TENTATIVE':
		return 'rgba(184,129,0,0.3)'

	case 'BUSY':
		return 'rgba(217,24,18,0.3)'

	case 'BUSY-UNAVAILABLE':
		return 'rgba(219,219,219)'

	default:
		return 'rgba(0,113,173,0.3)'
	}
}

// TODO: Tuple types (mixed array) will be added in jsdoc 4
/* eslint-disable jsdoc/valid-types */
/**
 * Generator that yields tuples of an attendee property and the corresponding free busy property
 * Only yields tuples where the attendee is actually blocked
 *
 * @generator
 * @param {DateTimeValue} start Start date
 * @param {DateTimeValue} end End date
 * @param {AttendeeProperty} organizer The organizer whose scheduling outbox to use
 * @param {AttendeeProperty[]} attendees Attendees to request the free busy times from
 * @yields {[AttendeeProperty, FreeBusyProperty]} Tuples of attendee property and free busy property where the attendee is blocked
 * @return {AsyncGenerator<[AttendeeProperty, FreeBusyProperty], void, void>} Generator that yields tuples of attendee property and free busy property where the attendee is blocked
 */
export async function * doFreeBusyRequest(start, end, organizer, attendees) {
	const freeBusyComponent = createFreeBusyRequest(start, end, organizer, attendees)
	const freeBusyICS = freeBusyComponent.toICS()

	const outbox = await findSchedulingOutbox()
	const freeBusyData = await outbox.freeBusyRequest(freeBusyICS)

	for (const [, data] of Object.entries(freeBusyData)) {
		if (!data.success) {
			continue
		}

		const parserManager = getParserManager()
		const parser = parserManager.getParserForFileType('text/calendar')
		parser.parse(data.calendarData)

		// TODO: fix me upstream, parser only exports VEVENT, VJOURNAL and VTODO at the moment
		const calendarComponent = parser._calendarComponent
		const freeBusyComponent = calendarComponent.getFirstComponent('VFREEBUSY')
		if (!freeBusyComponent) {
			continue
		}

		for (const attendeeProperty of freeBusyComponent.getPropertyIterator('ATTENDEE')) {
			for (const freeBusyProperty of freeBusyComponent.getPropertyIterator('FREEBUSY')) {
				if (freeBusyProperty.type === 'FREE') {
					// We care about anything BUT free slots
					continue
				}

				yield [attendeeProperty, freeBusyProperty]
			}
		}
	}
}
/* eslint-disable jsdoc/valid-types */
