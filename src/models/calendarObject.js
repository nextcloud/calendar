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

import { getParserManager } from 'calendar-js'
import DateTimeValue from 'calendar-js/src/values/dateTimeValue'
import CalendarComponent from 'calendar-js/src/components/calendarComponent'

/**
 * This model represents exactly
 *
 * TODO: this should not be a class, but a simple object
 * TODO: all methods should be converted to vuex commits
 */
export default class CalendarObject {

	/**
	 * Constructor of calendar-object
	 *
	 * @param {String|CalendarComponent} calendarData The raw unparsed calendar-data
	 * @param {String} calendarId Id of the calendar this calendar-object belongs to
	 * @param {VObject} dav The dav object
	 */
	constructor(calendarData, calendarId, dav = null) {
		/**
		 * Id of the calendar this calendar-object is part of
		 *
		 * @type {String}
		 */
		this.calendarId = calendarId

		/**
		 * Whether or not there has been a conflict with the server version
		 *
		 * @type {boolean}
		 */
		this.conflict = false

		/**
		 * The dav-object associated with this calendar-object
		 *
		 * @type {Object}|null
		 */
		this.dav = dav

		/**
		 * parsed calendar-js object
		 * @type {CalendarComponent}
		 */
		this.vcalendar = null
		this.resetToDav(calendarData)
	}

	/**
	 * ID of the calendar-object
	 *
	 * @returns {string}
	 */
	get id() {
		if (this.dav) {
			return btoa(this.dav.url)
		}

		return 'new'
	}

	/**
	 * @returns {string}
	 */
	getId() {
		if (this.dav) {
			return btoa(this.dav.url)
		}

		return 'new'
	}

	/**
	 * UID of the calendar-object
	 *
	 * @returns {null|String}
	 */
	get uid() {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next().value
		if (firstVObject) {
			return firstVObject.uid
		}

		return null
	}

	/**
	 * Type of the calendar-object
	 *
	 * @returns {null|String}
	 */
	get objectType() {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next().value
		if (firstVObject) {
			return firstVObject.name
		}

		return null
	}

	/**
	 * Whether or not this calendar-object is an event
	 *
	 * @returns {boolean}
	 */
	isEvent() {
		return this.objectType === 'vevent'
	}

	/**
	 * Whether or not this calendar-object is a task
	 *
	 * @returns {boolean}
	 */
	isTodo() {
		return this.objectType === 'vtodo'
	}

	/**
	 * Get all recurrence-items in given range
	 *
	 * @param {Date} start Begin of time-range
	 * @param {Date} end End of time-range
	 * @returns {Array}
	 */
	getAllObjectsInTimeRange(start, end) {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next().value
		if (!firstVObject) {
			return []
		}

		const s = DateTimeValue.fromJSDate(start, true)
		const e = DateTimeValue.fromJSDate(end, true)
		return firstVObject.recurrenceManager.getAllOccurrencesBetween(s, e)
	}

	/**
	 * Get recurrence-item closest to the given recurrence-Id
	 * This is either the one next in the future or if none exist,
	 * the one closest in the past
	 *
	 * @param {Date} closeTo The time to get the
	 * @returns {AbstractRecurringComponent|null}
	 */
	getClosestRecurrence(closeTo) {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next().value
		if (!firstVObject) {
			return null
		}

		const d = DateTimeValue.fromJSDate(closeTo, true)
		return firstVObject.recurrenceManager.getClosestOccurrence(d)
	}

	/**
	 * Get recurrence-item at exactly a given recurrence-Id
	 *
	 * @param {Date} recurrenceId RecurrenceId to retrieve
	 * @returns {AbstractRecurringComponent|null}
	 */
	getObjectAtRecurrenceId(recurrenceId) {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next().value
		if (!firstVObject) {
			return null
		}

		const d = DateTimeValue.fromJSDate(recurrenceId, true)
		return firstVObject.recurrenceManager.getOccurrenceAtExactly(d)
	}

	/**
	 * resets the inter vcalendar to the dav data
	 *
	 * @param {CalendarComponent|String} data Data to reset to
	 */
	resetToDav(data = null) {
		if (data instanceof CalendarComponent) {
			this.vcalendar = data
			return
		}

		if (data === null && this.dav === null) {
			return
		}

		const parserManager = getParserManager()
		const parser = parserManager.getParserForFileType('text/calendar')

		const calendarData = data || this.dav.data
		parser.parse(calendarData)

		const itemIterator = parser.getItemIterator()
		const firstVCalendar = itemIterator.next().value
		if (firstVCalendar) {
			this.vcalendar = firstVCalendar
		}
	}

	/**
	 * Whether or not this objects exists on the server
	 *
	 * @returns {boolean}
	 */
	existsOnServer() {
		return !!this.dav
	}

}
