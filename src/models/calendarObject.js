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

import PQueue from 'p-queue'
import { getParserManager } from 'calendar-js/src'

export default class CalendarObject {

	/**
	 * Constructor of calendar-object
	 *
	 * @param {String} calendarData The raw unparsed calendar-data
	 * @param {String} calendarId Id of the calendar this calendar-object belongs to
	 * @param {String} fileType The type of calendar-data, defaults to text/calendar
	 */
	constructor(calendarData, calendarId, fileType = 'text/calendar') {
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
		this.dav = null

		/**
		 * Type of the calendar-object
		 *
		 * @type {String}|null
		 */
		this.objectType = null

		/**
		 * A queue for sending updates to the server
		 * aiming to prevent race-conditions
		 *
		 * @type {Object}
		 */
		this.updateQueue = new PQueue({ concurrency: 1 })

		/**
		 * parsed calendar-js object
		 * @type {null}
		 */
		this.vcalendar = null

		const parserManager = getParserManager()
		const parser = parserManager.getParserForFileType(fileType)
		parser.parse(calendarData)

		const itemIterator = parser.getItemIterator()
		const firstVCalendar = itemIterator.next()
		if (firstVCalendar) {
			this.vcalendar = firstVCalendar
		}
	}

	/**
	 * UID of the calendar-object
	 *
	 * @returns {null|String}
	 */
	get uid() {
		const iterator = this.vcalendar.getVObjectIterator()
		const firstVObject = iterator.next()
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
		const firstVObject = iterator.next()
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

}
