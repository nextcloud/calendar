/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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
	 * @param {VEvent} vevent
	 * @param {ICAL.Component} event
	 * @param {ICAL.Time} start
	 * @param {ICAL.Time} end
	 */
	function FcEvent(vevent, event, start, end) {
		const context = {vevent, event, start, end};
		context.iCalEvent = new ICAL.Event(event);

		let id = context.vevent.uri;
		if (event.hasProperty('recurrence-id')) {
			id += context.event.getFirstPropertyValue('recurrence-id').toICALString();
		}

		const allDay = (start.icaltype === 'date' && end.icaltype === 'date');

		const iface = {
			_isAFcEventObject: true,
			id: id,
			allDay: allDay,
			start: start.toJSDate(),
			end: end.toJSDate(),
			repeating: context.iCalEvent.isRecurring(),
			className: ['fcCalendar-id-' + vevent.calendar.tmpId],
			editable: vevent.calendar.isWritable(),
			backgroundColor: vevent.calendar.color,
			borderColor: vevent.calendar.color,
			textColor: vevent.calendar.textColor,
			title: event.getFirstPropertyValue('summary')
		};

		Object.defineProperties(iface, {
			vevent: {
				get: function() {
					return context.vevent;
				},
				enumerable: true
			},
			event: {
				get: function() {
					return context.event;
				},
				enumerable: true
			},
			calendar: {
				get: () => context.vevent.calendar,
				enumerable: true
			}
		});

		/**
		 * get SimpleEvent for current fcEvent
		 * @returns {SimpleEvent}
		 */
		iface.getSimpleEvent = function () {
			return SimpleEvent(context.event);
		};

		/**
		 * moves the event to a different position
		 * @param {Duration} delta
		 */
		iface.drop = function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			const dtstart = context.event.getFirstPropertyValue('dtstart');
			dtstart.addDuration(delta);
			context.event.updatePropertyWithValue('dtstart', dtstart);

			if (context.event.hasProperty('dtend')) {
				const dtend = context.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				context.event.updatePropertyWithValue('dtend', dtend);
			}

			context.vevent.touch();
		};

		/**
		 * resizes the event
		 * @param {moment.duration} delta
		 */
		iface.resize = function (delta) {
			delta = new ICAL.Duration().fromSeconds(delta.asSeconds());

			if (context.event.hasProperty('duration')) {
				const duration = context.event.getFirstPropertyValue('duration');
				duration.fromSeconds((delta.toSeconds() + duration.toSeconds()));
				context.event.updatePropertyWithValue('duration', duration);
			} else if (context.event.hasProperty('dtend')) {
				const dtend = context.event.getFirstPropertyValue('dtend');
				dtend.addDuration(delta);
				context.event.updatePropertyWithValue('dtend', dtend);
			} else if (context.event.hasProperty('dtstart')) {
				const dtstart = event.getFirstProperty('dtstart');
				const dtend = dtstart.getFirstValue().clone();
				dtend.addDuration(delta);

				const prop = context.event.addPropertyWithValue('dtend', dtend);

				const tzid = dtstart.getParameter('tzid');
				if (tzid) {
					prop.setParameter('tzid', tzid);
				}
			}

			context.vevent.touch();
		};

		/**
		 * lock fc event for editing
		 */
		iface.lock = function() {
			context.lock = true;
		};

		/**
		 * unlock fc event
		 */
		iface.unlock = function() {
			context.lock = false;
		};

		return iface;
	}

	FcEvent.isFcEvent = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isAFcEventObject === true);
	};

	return FcEvent;
});
