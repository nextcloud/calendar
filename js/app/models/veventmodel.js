/**
 * ownCloud - Calendar App
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

app.factory('VEvent', function(FcEvent, SimpleEvent, ICalFactory, RandomStringService) {
	'use strict';

	/**
	 * get DTEND from vevent
	 * @param {ICAL.Component} vevent
	 * @returns {ICAL.Time}
	 */
	function calculateDTEnd(vevent) {
		if (vevent.hasProperty('dtend')) {
			return vevent.getFirstPropertyValue('dtend');
		} else if (vevent.hasProperty('duration')) {
			var dtstart = vevent.getFirstPropertyValue('dtstart').clone();
			dtstart.addDuration(vevent.getFirstPropertyValue('duration'));
			return dtstart;
		} else {
			return vevent.getFirstPropertyValue('dtstart').clone();
		}
	}

	/**
	 * check if we need to convert the timezone of either dtstart or dtend
	 * @param {ICAL.Time} dt
	 * @returns {boolean}
	 */
	function isTimezoneConversionNecessary(dt) {
		return (dt.icaltype !== 'date' &&
		dt.zone !== ICAL.Timezone.utcTimezone &&
		dt.zone !== ICAL.Timezone.localTimezone);
	}

	/**
	 * convert a dt's timezone if necessary
	 * @param {ICAL.Time} dt
	 * @param {ICAL.Component} timezone
	 * @returns {ICAL.Time}
	 */
	function convertTimezoneIfNecessary(dt, timezone) {
		if (isTimezoneConversionNecessary(dt) && timezone) {
			dt = dt.convertToZone(timezone);
		}

		return dt;
	}

	/**
	 * parse an recurring event
	 * @param vevent
	 * @param event
	 * @param start
	 * @param end
	 * @param timezone
	 * @return []
	 */
	function getTimeForRecurring(vevent, event, start, end, timezone) {
		var dtstart = event.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(event);
		var duration = dtend.subtractDate(dtstart);
		var fcEvents = [];

		var iterator = new ICAL.RecurExpansion({
			component: event,
			dtstart: dtstart
		});

		var next;
		while ((next = iterator.next())) {
			if (next.compare(start) < 0) {
				continue;
			}
			if (next.compare(end) > 0) {
				break;
			}

			var singleDtStart = next.clone();
			var singleDtEnd = next.clone();
			singleDtEnd.addDuration(duration);

			fcEvents.push(new FcEvent(vevent, event,
				convertTimezoneIfNecessary(singleDtStart, timezone),
				convertTimezoneIfNecessary(singleDtEnd, timezone)));
		}

		return fcEvents;
	}

	/**
	 * parse a single event
	 * @param vevent
	 * @param event
	 * @param timezone
	 * @returns {FcEvent}
	 */
	function getTime(vevent, event, timezone) {
		var dtstart = event.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(event);

		return new FcEvent(vevent, event,
			convertTimezoneIfNecessary(dtstart, timezone),
			convertTimezoneIfNecessary(dtend, timezone));
	}

	/**
	 * register timezones from ical response
	 * @param {ICAL.Component} components
	 */
	function registerTimezones(components) {
		var vtimezones = components.getAllSubcomponents('vtimezone');
		angular.forEach(vtimezones, function (vtimezone) {
			var timezone = new ICAL.Timezone(vtimezone);
			ICAL.TimezoneService.register(timezone.tzid, timezone);
		});
	}

	/**
	 * @constructor
	 * @param {Calendar} calendar
	 * @param {string|ICAL.Component} ical
	 * @param {string|null} etag
	 * @param {string|null} uri
	 * @constructor
	 */
	function VEvent(calendar, ical, etag, uri) {
		if (typeof ical === 'string') {
			try {
				var jcal = ICAL.parse(ical);
				this.comp = new ICAL.Component(jcal);
			} catch (e) {
				console.log(e);
				throw VEvent.INVALID;
			}
		} else if (Object.getPrototypeOf(ical) === ICAL.Component.prototype) {
			this.comp = ical;
		}

		if (!this.comp || this.comp.jCal.length === 0) {
			throw VEvent.INVALID;
		}

		registerTimezones(this.comp);

		angular.extend(this, {
			calendar: calendar,
			etag: etag,
			uri: uri
		});
	}

	VEvent.prototype = {
		/**
		 * serialize jsical object to actual ical data
		 * @returns {String}
		 */
		get data() {
			return this.comp.toString();
		},
		/**
		 *
		 * @param start
		 * @param end
		 * @param timezone
		 * @returns {Array}
		 */
		getFcEvent: function(start, end, timezone) {
			var iCalStart = ICAL.Time.fromJSDate(start.toDate());
			var iCalEnd = ICAL.Time.fromJSDate(end.toDate());
			var renderedEvents = [], self = this;

			var vevents = this.comp.getAllSubcomponents('vevent');
			angular.forEach(vevents, function (event) {
				var iCalEvent = new ICAL.Event(event);

				if (!event.hasProperty('dtstart')) {
					return;
				}

				if (iCalEvent.isRecurring()) {
					angular.extend(renderedEvents,
						getTimeForRecurring(self, event, iCalStart, iCalEnd, timezone.jCal));
				} else {
					renderedEvents.push(getTime(self, event, timezone.jCal));
				}
			});

			return renderedEvents;
		},
		/**
		 *
		 * @param recurrenceId
		 * @returns {SimpleEvent}
		 */
		getSimpleEvent: function(recurrenceId) {
			var vevents = this.comp.getAllSubcomponents('vevent'), simpleEvent = null;

			angular.forEach(vevents, function (event) {
				var hasRecurrenceId = event.hasProperty('recurrence-id');
				if ((!hasRecurrenceId && recurrenceId === null) ||
					(hasRecurrenceId && recurrenceId === event.getFirstPropertyValue('recurrence-id'))) {
					simpleEvent = new SimpleEvent(event);
				}
			});

			return simpleEvent;
		}
	};

	/**
	 *
	 * @param start
	 * @param end
	 * @param timezone
	 * @returns {VEvent}
	 */
	VEvent.fromStartEnd = function(start, end, timezone) {
		var comp = ICalFactory.new();

		var iCalEvent = new ICAL.Component('vevent');
		comp.addSubcomponent(iCalEvent);
		iCalEvent.updatePropertyWithValue('created', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('last-modified', ICAL.Time.now());
		iCalEvent.updatePropertyWithValue('uid', RandomStringService.generate());
		// add a dummy dtstart to make the ical valid before we create SimpleEvent
		iCalEvent.updatePropertyWithValue('dtstart', ICAL.Time.now());

		var vevent = new VEvent(null, comp, null, null);
		var simple = new SimpleEvent(iCalEvent);
		angular.extend(simple, {
			allDay: !start.hasTime() && !end.hasTime(),
			dtstart: {
				type: start.hasTime() ? 'datetime' : 'date',
				value: start,
				parameters: {
					zone: timezone
				}
			},
			dtend: {
				type: end.hasTime() ? 'datetime' : 'date',
				value: end,
				parameters: {
					zone: timezone
				}
			}
		});
		simple.patch();

		return vevent;
	};

	/**
	 *
	 * @type {string}
	 */
	VEvent.INVALID = 'INVALID_EVENT';

	return VEvent;
});
