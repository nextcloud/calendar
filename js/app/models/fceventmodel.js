/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

app.factory('FcEvent', function(SimpleEvent) {
	'use strict';

	/**
	 * check if dtstart and dtend are both of type date
	 * @param dtstart
	 * @param dtend
	 * @returns {boolean}
	 */
	function isEventAllDay (dtstart, dtend) {
		return (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
	}

	/**
	 * get recurrence id from event
	 * @param {Component} event
	 * @returns {string}
	 */
	function getRecurrenceIdFromEvent (event) {
		return event.hasProperty('recurrence-id') ?
			event.getFirstPropertyValue('recurrence-id').toICALString() :
			null;
	}

	/**
	 * get calendar related information about event
	 * @param vevent
	 * @returns {{calendar: *, editable: *, backgroundColor: *, borderColor: *, textColor: *, className: *[]}}
	 */
	function getCalendarRelatedProps (vevent) {
		return {
			calendar: vevent.calendar,
			editable: vevent.calendar.isWritable(),
			className: ['fcCalendar-id-' + vevent.calendar.tmpId]
		};
	}

	/**
	 * get event related information about event
	 * @param {Component} event
	 * @returns {{title: string}}
	 */
	function getEventRelatedProps (event) {
		return {
			title: event.getFirstPropertyValue('summary')
		};
	}

	/**
	 * get unique id for fullcalendar
	 * @param {VEvent} vevent
	 * @param {Component} event
	 * @returns {string}
	 */
	function getFcEventId (vevent, event) {
		var id = vevent.uri;
		var recurrenceId = getRecurrenceIdFromEvent(event);
		if (recurrenceId) {
			id += recurrenceId;
		}

		return id;
	}

	/**
	 * @constructor
	 * @param {VEvent} vevent
	 * @param {Component} event
	 * @param {icaltime} start
	 * @param {icaltime} end
	 */
	function FcEvent (vevent, event, start, end) {
		var iCalEvent = new ICAL.Event(event);

		angular.extend(this, {
			vevent: vevent,
			event: event,
			id: getFcEventId(vevent, event),
			allDay: isEventAllDay(start, end),
			start: start.toJSDate(),
			end: end.toJSDate(),
			repeating: iCalEvent.isRecurring()
		}, getCalendarRelatedProps(vevent), getEventRelatedProps(event));
	}

	FcEvent.prototype = {
		get backgroundColor() {
			return this.vevent.calendar.color;
		},
		get borderColor() {
			return this.vevent.calendar.color;

		},
		get textColor() {
			return this.vevent.calendar.textColor;
		},
		/**
		 * get SimpleEvent for current fcEvent
		 * @returns {SimpleEvent}
		 */
		getSimpleEvent: function () {
			return new SimpleEvent(this.event);
		},
		/**
		 * moves the event to a different position
		 * @param {Duration} delta
		 */
		drop: function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (this.event.hasProperty('dtstart')) {
				var dtstart = this.event.getFirstPropertyValue('dtstart');
				dtstart.addDuration(delta);
				this.event.updatePropertyWithValue('dtstart', dtstart);
			}

			if (this.event.hasProperty('dtend')) {
				var dtend = this.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				this.event.updatePropertyWithValue('dtend', dtend);
			}
		},
		/**
		 * resizes the event
		 * @param {moment.duration} delta
		 */
		resize: function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (this.event.hasProperty('duration')) {
				var duration = this.event.getFirstPropertyValue('duration');
				duration.fromSeconds((delta.toSeconds() + duration.toSeconds()));
				this.event.updatePropertyWithValue('duration', duration);
			} else if (this.event.hasProperty('dtend')) {
				var dtend = this.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				this.event.updatePropertyWithValue('dtend', dtend);
			} else if (this.event.hasProperty('dtstart')) {
				var dtstart = event.getFirstPropertyValue('dtstart').clone();
				dtstart.addDuration(delta);
				this.event.addPropertyWithValue('dtend', dtstart);
			}
		}
	};

	return FcEvent;
});
