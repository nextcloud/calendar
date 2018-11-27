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
import ICAL from 'ical.js'
import uuid from 'uuid'
import { dateFactory } from './date'
import { getAppVersion, getHostname, getServerVersion } from './productInformationProvider'

const calendarColorIdentifier = 'x-apple-calendar-color'
const calendarNameIdentifier = 'x-wr-calname'
const componentNames = ['vevent', 'vjournal', 'vtodo']

/**
 * parses calendar data
 *
 * @param {String} ics The calendar data to parse
 * @param {Boolean} autoSanitize whether or not to sanitize the data
 * @returns {ICAL.Component}
 */
export function parseICS(ics, autoSanitize = true) {
	if (autoSanitize) {
		ics = sanitizeICS(ics)
	}

	return ICAL.parse(ics)
}

/**
 * fix broken calendar data
 *
 * @param {String} ics The calendar data to sanitize
 * @returns {String}
 */
export function sanitizeICS(ics) {
	if (ics.search('T::') > 0) { // no time
		ics = sanitizeICSDateWithoutTime(ics)
	}

	if (ics.search('TRIGGER:P') > 0) {
		ics = sanitizeICSTrigger(ics)
	}

	ics = sanitizeICSMissingValueDate(ics)

	// TODO combine multiple BEGIN:VCALENDAR ... END:VCALENDAR blocks into one

	return ics
}

/**
 * create all-day event from malformed input
 * @todo document example of broken ics data
 *
 * @param {String} ics The calendar data to sanitize
 * @returns {String}
 */
function sanitizeICSDateWithoutTime(ics) {
	ics.split('\n').forEach((el) => {
		const findTypes = ['DTSTART', 'DTEND']
		const dateType = /[^:]*/.exec(el)[0]

		if (findTypes.indexOf(dateType) >= 0 && el.trim().substr(-3) === 'T::') { // is date without time
			const icsDate = el.replace(/[^0-9]/g, '')
			ics = ics.replace(el, dateType + 'VALUE=DATE:' + icsDate)
		}
	})

	return ics
}

/**
 * create all-day event from malformed input
 * @todo document example of broken ics data
 *
 * @param {String} ics The calendar data to sanitize
 * @returns {String}
 */
function sanitizeICSMissingValueDate(ics) {
	ics.split('\n').forEach((el) => {
		if (el.indexOf('VALUE=DATE') !== -1) {
			return
		}

		const findTypes = ['DTSTART', 'DTEND']
		const [dateTypePara, dateValue] = el.split(':')
		const [dateType, ...dateParameters] = dateTypePara.split('')

		if (findTypes.indexOf(dateType) >= 0 && dateParameters.indexOf('VALUE=DATE') === -1 && dateValue.length === 8) { // is date without time
			ics = ics.replace(el, dateTypePara + 'VALUE=DATE:' + dateValue)
		}
	})

	return ics
}

/**
 * fix incorrectly populated trigger
 * @todo document example of broken ics data
 *
 * @param {String} ics The calendar data to sanitize
 * @returns {String}
 */
function sanitizeICSTrigger(ics) {
	const regex = /^TRIGGER:P$/gm
	if (ics.match(regex)) {
		ics = ics.replace(regex, 'TRIGGER:P0D')
	}

	return ics
}

/**
 *
 * @param {String} ics The calendar data to parse and split up
 * @param {Boolean} autoSanitize whether or not to sanitize the data
 * @returns {*}
 */
export function splitter(ics, autoSanitize = true) {
	const jcal = parseICS(ics, autoSanitize)
	const components = new ICAL.Component(jcal)

	const objects = {}
	const timezones = components.getAllSubcomponents('vtimezone')

	componentNames.forEach((componentName) => {
		const vobjects = components.getAllSubcomponents(componentName)
		objects[componentName] = {}

		vobjects.forEach((vobject) => {
			if (!vobject.hasProperty('uid')) {
				vobject.addPropertyWithValue('uid', generateUID())
			}
			const uid = vobject.getFirstPropertyValue('uid')

			objects[componentName][uid] = objects[componentName][uid] || []
			objects[componentName][uid].push(vobject)
		})
	})

	const result = {
		name: components.getFirstPropertyValue(calendarNameIdentifier),
		color: components.getFirstPropertyValue(calendarColorIdentifier),
		vevent: [],
		vjournal: [],
		vtodo: []
	}

	componentNames.forEach((componentName) => {
		Object.keys(objects[componentName]).forEach((key) => {
			const component = newVCalendar()
			timezones.forEach((timezone) => {
				component.addSubcomponent(timezone)
			})
			objects[componentName][key].forEach((object) => {
				component.addSubcomponent(object)
			})

			const cleaned = ICAL.helpers.updateTimezones(component)
			result[componentName].push(cleaned.toString())
		})
	})

	return result
}

/**
 * creates a new empty VCalendar component
 *
 * @returns {ICAL.Component}
 */
export function newVCalendar() {
	const root = new ICAL.Component(['vcalendar', [], []])

	root.updatePropertyWithValue('prodid', `-//IDN nextcloud.com//Nextcloud v${getServerVersion()} Calendar app v${getAppVersion()}//EN`)
	root.updatePropertyWithValue('version', '2.0')
	root.updatePropertyWithValue('calscale', 'GREGORIAN')

	return root
}

/**
 * creates a new VEvent inside a VCalendar
 *
 * @param {String} uid UID of new event
 * @param {Date} dtstart start of new event
 * @param {Date} dtend end of new event
 * @returns {ICAL.Component}
 */
export function newVEvent(uid, dtstart, dtend) {
	const comp = newVCalendar()

	const event = new ICAL.Component('vevent')
	comp.addSubcomponent(event)

	event.updatePropertyWithValue('created', ICAL.Time.fromJSDate(dateFactory(), true))
	event.updatePropertyWithValue('dtstamp', ICAL.Time.fromJSDate(dateFactory(), true))
	event.updatePropertyWithValue('last-modified', ICAL.Time.fromJSDate(dateFactory(), true))
	event.updatePropertyWithValue('sequence', 0)
	event.updatePropertyWithValue('uid', uid)

	// TODO - use dtstart parameter
	// add a dummy dtstart, so it's a valid ics
	event.updatePropertyWithValue('dtstart', ICAL.Time.now())

	return comp
}

/**
 * generates a UID for an event
 *
 * @returns {String}
 */
export function generateUID() {
	return uuid() + '@' + getHostname()
}
