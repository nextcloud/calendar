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
import { parseICS } from './iCalendarService'
import { hasTimezone, getTimezone } from './timezoneDataProviderService'
import ICAL from 'ical.js'

/**
 *
 * @param {Object} calendar calendar object from Vuex store
 * @param {Function} userNotificationCallBack display a notification to the user
 * @returns {Function}
 */
export default function(calendar, userNotificationCallBack) {
	return ({ start, startStr, end, endStr, timeZone }, callback) => {
		const iCalStart = ICAL.Time.fromJSDate(start)
		const iCalEnd = ICAL.Time.fromJSDate(end)
		const vTimezone = getTimezone(timeZone)

		calendar.dav.findByTypeInTimeRange('VEVENT', start, end).then((calendarObjects) => {
			const fcEvents = []

			calendarObjects.forEach((calendarObject) => {
				const jCal = parseICS(calendarObject.data)
				const comp = new ICAL.Component(jCal)

				if (!comp || !comp.jCal || comp.jCal.length === 0) { // TODO is there a better way to validate the comp?
					console.debug('The given calendar data does not seem to be a valid calendar')
					console.debug(calendarObject, comp)
					return
				}

				const unknownTimezones = registerTimezones(comp)
				if (unknownTimezones.length) {
					// TODO add proper error message
					userNotificationCallBack(t('calendar', 'Missing timezones ...'), unknownTimezones)
				}

				const { rootEvent, recurrenceExceptions } = getRootAndExceptions(comp)

				// If there is neither a root event nor exceptions, just break
				if (!rootEvent && recurrenceExceptions.length === 0) {
					return
				}

				// If there is a root event, we gotta check whether it's recurring or not
				if (rootEvent) {
					const event = new ICAL.Event(rootEvent, { exceptions: recurrenceExceptions })

					if (!event.isRecurring()) {
						fcEvents.push(getFCEventForOccurrence(calendarObject, event, event.startDate, event.endDate, vTimezone))
					} else {
						const iterator = event.iterator()

						let next
						while ((next = iterator.next())) {
							const occurrence = event.getOccurrenceDetails(next)

							if (occurrence.endDate.compare(iCalStart) < 0) {
								continue
							}
							if (occurrence.startDate.compare(iCalEnd) > 0) {
								break
							}

							fcEvents.push(getFCEventForOccurrence(calendarObject, occurrence.item, occurrence.startDate, occurrence.endDate, vTimezone))
						}
					}
				} else {
					// If this is the case, there are only recurrence exceptions but no root event
					// just treat them as a bunch of individual events in that case
					recurrenceExceptions.forEach((recurrenceException) => {
						const event = new ICAL.Event(recurrenceException)
						fcEvents.push(getFCEventForOccurrence(calendarObject, event, event.startDate, event.endDate, vTimezone))
					})
				}
			})

			console.debug(fcEvents)
			callback(fcEvents)
		})
	}
}

/**
 * registers all timezones of a component
 *
 * @param {ICAL.Component} comp Component to analyse for missing timezones
 * @returns {Array} Array of missing timezones that are unknown
 */
function registerTimezones(comp) {
	// read all timezones in the comp and register them
	const vEvents = comp.getAllSubcomponents('vevent')
	const vTimezones = comp.getAllSubcomponents('vtimezone')
	const vTimezoneIds = []
	const requiredTimezoneIds = []
	const unknownTimezones = []

	vTimezones.forEach((vTimezone) => {
		const timezone = new ICAL.Timezone(vTimezone)
		vTimezoneIds.push(timezone.id)

		if (!ICAL.TimezoneService.has(timezone.tzid)) {
			ICAL.TimezoneService.register(timezone.tzid, timezone)
		}
	})

	vEvents.forEach((vEvent) => {
		requiredTimezoneIds.push(...getAllTimezoneIdsFromComponent(vEvent))
	})

	requiredTimezoneIds.forEach((requiredTimezoneId) => {
		if (vTimezoneIds.indexOf(requiredTimezoneId) !== -1) {
			return
		}

		if (hasTimezone(requiredTimezoneId)) {
			// No need to store it locally, just make sure
			// it's registered in the ICAL.TimezoneService
			getTimezone(requiredTimezoneId, true)
			return
		}

		unknownTimezones.push(requiredTimezoneId)
	})

	return unknownTimezones
}

function getAllTimezoneIdsFromComponent(comp) {
	const subcomponents = comp.getAllSubcomponents()
	const properties = comp.getAllProperties()

	const tzIds = []
	properties.forEach((property) => {
		const tzId = property.getParameter('tzid')
		if (tzId) {
			tzIds.push(tzId)
		}
	})

	return tzIds.concat(...subcomponents.map(getAllTimezoneIdsFromComponent))
}

/**
 * Split up event into "root" and recurrence exceptions
 *
 * @param {ICAL.Component} comp The calendar component to split up
 * @returns {{recurrenceExceptions: ICAL.Component[], rootEvent: ICAL.Component}}
 */
function getRootAndExceptions(comp) {
	const vEvents = comp.getAllSubcomponents('vevent')

	return {
		recurrenceExceptions: vEvents.filter((vEvent) => vEvent.hasProperty('recurrence-id')),
		rootEvent: vEvents.find((vEvent) => !vEvent.hasProperty('recurrence-id'))
	}
}

/**
 * returns the fc event for an occurrence
 *
 * @param {VObject} calendarObject The calendar object provided by cdav
 * @param {ICAL.Event} event The single VEvent-block
 * @param {ICAL.Time} occurrenceStart Start of that particular occurrence
 * @param {ICAL.Time} occurrenceEnd End of that particular occurrence
 * @param {ICAL.Timezone} vTimezone Timezone to convert data to
 * @returns {Object}
 */
function getFCEventForOccurrence(calendarObject, event, occurrenceStart, occurrenceEnd, vTimezone) {

	console.debug(occurrenceStart)

	const classNames = []
	if (event.component.hasProperty('STATUS')) {
		const status = event.component.getFirstPropertyValue('STATUS')

		if (status === 'TENTATIVE') {
			classNames.push('fc-event-status-tentative') // TODO: {'opacity': 0.5}
		}
		if (status === 'CANCELLED') {
			classNames.push('fc-event-status-cancelled') // TODO: {'text-decoration': 'line-through', 'opacity': 0.5}
		}
	}

	return {
		id: 'id:' + calendarObject.url + '::' + occurrenceStart.toICALString(),
		groupId: event.recurrenceId
			? 'groupId:' + calendarObject.url + '::' + event.recurrenceId
			: 'groupId:' + calendarObject.url,
		title: event.summary,
		start: convertTz(occurrenceStart, vTimezone).toJSDate(),
		end: convertTz(occurrenceEnd, vTimezone).toJSDate(),
		allDay: (occurrenceStart.icaltype === 'date' && occurrenceEnd.icaltype === 'date'),
		classNames: classNames,
		extendedProps: {
			categories: [],
			description: event.description,
			location: event.location,
			routerParams: {
				object: btoa(calendarObject.url),
				recurrenceId: occurrenceStart.toUnixTime()
			},
			participationStatus: 'ACCEPTED'
		}
	}
}

/**
 * convert a dt's timezone if necessary
 *
 * @param {ICAL.Time} dt The time object to convert
 * @param {ICAL.Timezone} timezone The timezone to convert it to
 * @returns {ICAL.Time}
 */
function convertTz(dt, timezone) {
	if (!needsTzConversion(dt) || !timezone) {
		return dt
	}

	return dt.convertToZone(timezone)
}

/**
 * check if we need to convert the timezone of either dtstart or dtend
 *
 * @param {ICAL.Time} dt The time object to convert
 * @returns {boolean}
 */
function needsTzConversion(dt) {
	return dt.icaltype !== 'date'
		&& dt.zone !== ICAL.Timezone.localTimezone
		&& dt.zone !== ICAL.Timezone.UTC
}
