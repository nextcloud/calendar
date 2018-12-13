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

export default class Event {

	/**
	 * Creates an instance of Event, selects the correct event
	 * inside the VObject via the provided recurrenceId and sets
	 * the fake date based on the provided clickDTStart
	 *
	 * @param {String} iCalendar Calendar-data of corresponding VObject
	 * @param {Object} calendar Object from Calendar Vuex store
	 * @param {ICAL.Property} recurrenceID
	 * @param {ICAL.Time} clickDtStart
	 */
	constructor(iCalendar, calendar, recurrenceID, clickDtStart) {
		this.dav = null
		this.calendar = null
		this.jCal = null
		this.vEvent = null

		this.conflict = false

	}

	/**
	 * This is not needed at the moment, but might be later on
	 * if we limited the number of requested properties
	 *
	 * @param jCal
	 */
	updateEvent(jCal) {

	}

	/**
	 * Update linked calendar of this event
	 *
	 * @param {Object} calendar The calendar
	 */
	updateCalendar(calendar) {
		this.calendar = calendar
	}

	/**
	 * Return the url
	 *
	 * @readonly
	 */
	get url() {
		if (this.dav) {
			return this.dav.url
		}
		return ''
	}

	/**
	 * Return the uid
	 *
	 * @readonly
	 */
	get uid() {
		return this.vCard.getFirstPropertyValue('uid')
	}

	/**
	 * Return the key
	 *
	 * @readonly
	 */
	get key() {
		return this.uid + '~' + this.calendar.id
	}

	get clickDtStart() {

	}

	set clickDtStart(value) {

	}

	get clickDtStartTimezone() {

	}

	set clickDtStartTimezone(value) {

	}

	get clickDtEnd() {

	}

	set clickDtEnd(value) {

	}

	get clickDtEndTimezone() {

	}

	set clickDtEndTimezone(value) {

	}

	get allDay() {

	}

	set allDay(value) {

	}

	/**
	 * Return all the properties as Property objects
	 *
	 * @readonly
	 * @returns {ICAL.Property[]} http://mozilla-comm.github.io/ical.js/api/ICAL.Property.html
	 */
	get properties() {
		return this.event.getAllProperties
	}

}
