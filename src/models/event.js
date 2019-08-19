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

export default class Event {

	/**
	 * Creates an instance of Event, selects the correct event
	 * inside the VObject via the provided recurrenceId and sets
	 * the fake date based on the provided clickDTStart
	 *
	 * @param {String} iCalendar Calendar-data of corresponding VObject
	 * @param {Object} calendar Object from Calendar Vuex store
	 * @param {ICAL.Property} recurrenceID foo
	 * @param {ICAL.Time} clickDtStart bar
	 */
	constructor(iCalendar, calendar, recurrenceID, clickDtStart) {
		this.dav = null
		this.calendar = null
		this.jCal = null
		this.vEvent = null

		this.conflict = false

	}

}
