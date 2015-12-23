/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2015 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2015 Georg Ehrke <oc.list@georgehrke.com>
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

 app.factory('fcHelper', function () {
	'use strict';

	/**
	 * check if vevent is the one described in event
	 * @param {Object} event
	 * @param {Object} vevent
	 * @returns {boolean}
	 */
	function isCorrectEvent(event, vevent) {
		if (event.recurrenceId === null) {
			if (!vevent.hasProperty('recurrence-id')) {
				return true;
			}
		} else {
			if (event.recurrenceId === vevent.getFirstPropertyValue('recurrence-id').toICALString()) {
				return true;
			}
		}

		return false;
	}

	/**
	 * get DTEND from vevent
	 * @param {object} vevent
	 * @returns {ICAL.Time}
	 */
	function calculateDTEnd(vevent) {
		if (vevent.hasProperty('dtend')) {
			return vevent.getFirstPropertyValue('dtend');
		} else if (vevent.hasProperty('duration')) {
			return vevent.getFirstPropertyValue('dtstart').clone();
		} else {
			return vevent.getFirstPropertyValue('dtstart').clone();
		}
	}

	/**
	 * register timezones from ical response
	 * @param components
	 */
	function registerTimezones(components) {
		var vtimezones = components.getAllSubcomponents('vtimezone');
		angular.forEach(vtimezones, function (vtimezone) {
			var timezone = new ICAL.Timezone(vtimezone);
			ICAL.TimezoneService.register(timezone.tzid, timezone);
		});
	}

	/**
	 * adds data about the calendar to the fcData object
	 * @param fcData
	 * @param calendar
	 * @returns {*}
	 */
	function addCalendarDataToFCData(fcData, calendar) {
		fcData.calendar = calendar;
		fcData.editable = calendar.cruds.update;
		fcData.className = 'fcCalendar-id-' + calendar.url;

		return fcData;
	}

	/**
	 * Adds data about the event to the fcData object
	 * @param fcData
	 * @param vevent
	 * @param event
	 * @param eventsObject
	 * @returns {*}
	 */
	function addEventDataToFCData(fcData, vevent, event, eventsObject) {
		fcData.uri = eventsObject.uri;
		fcData.etag = eventsObject.etag;
		fcData.title = vevent.getFirstPropertyValue('summary');

		if (event.isRecurrenceException()) {
			fcData.recurrenceId = vevent
				.getFirstPropertyValue('recurrence-id')
				.toICALString();
			fcData.id = event.objectUri + event.recurrenceId;
		} else {
			fcData.recurrenceId = null;
			fcData.id = fcData.objectUri;
		}

		return fcData;
	}

	/**
	 * check if we need to convert the timezone of either dtstart or dtend
	 * @param dt
	 * @returns {boolean}
	 */
	function isTimezoneConversionNecessary(dt) {
		return (dt.icaltype !== 'date' &&
		dt.zone !== ICAL.Timezone.utcTimezone &&
		dt.zone !== ICAL.Timezone.localTimezone);
	}

	/**
	 * check if dtstart and dtend are both of type date
	 * @param dtstart
	 * @param dtend
	 * @returns {boolean}
	 */
	function isEventAllDay(dtstart, dtend) {
		return (dtstart.icaltype === 'date' && dtend.icaltype === 'date');
	}

	/**
	 * parse an recurring event
	 * @param vevent
	 * @param start
	 * @param end
	 * @param timezone
	 * @return []
	 */
	function parseTimeForRecurringEvent(vevent, start, end, timezone) {
		var dtstart = vevent.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(vevent);
		var duration = dtend.subtractDate(dtstart);
		var fcDataContainer = [];

		var iterator = new ICAL.RecurExpansion({
			component: vevent,
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

			var dtstartOfRecurrence = next.clone();
			var dtendOfRecurrence = next.clone();
			dtendOfRecurrence.addDuration(duration);

			if (isTimezoneConversionNecessary(dtstartOfRecurrence) && timezone) {
				dtstartOfRecurrence = dtstartOfRecurrence.convertToZone(timezone);
			}
			if (isTimezoneConversionNecessary(dtendOfRecurrence) && timezone) {
				dtendOfRecurrence = dtendOfRecurrence.convertToZone(timezone);
			}

			fcDataContainer.push({
				allDay: isEventAllDay(dtstartOfRecurrence, dtendOfRecurrence),
				start: dtstartOfRecurrence.toJSDate(),
				end: dtendOfRecurrence.toJSDate(),
				repeating: true
			});
		}

		return fcDataContainer;
	}

	/**
	 * parse a single event
	 * @param vevent
	 * @param timezone
	 * @returns {object}
	 */
	function parseTimeForSingleEvent(vevent, timezone) {
		var dtstart = vevent.getFirstPropertyValue('dtstart');
		var dtend = calculateDTEnd(vevent);

		if (isTimezoneConversionNecessary(dtstart) && timezone) {
			dtstart = dtstart.convertToZone(timezone);
		}
		if (isTimezoneConversionNecessary(dtend) && timezone) {
			dtend = dtend.convertToZone(timezone);
		}

		return {
			allDay: isEventAllDay(dtstart, dtend),
			start: dtstart.toJSDate(),
			end: dtend.toJSDate(),
			repeating: false
		};
	}

	return {
		/**
		 * render a ics string
		 * @param eventObject
		 * @param start
		 * @param end
		 * @param timezone
		 * @returns {Array}
		 */
		renderCalData: function(eventObject, start, end, timezone) {
			var jcal = ICAL.parse(eventObject.data);
			var components = new ICAL.Component(jcal);

			var icalstart = new ICAL.Time();
			icalstart.fromUnixTime(start.format('X'));
			var icalend = new ICAL.Time();
			icalend.fromUnixTime(end.format('X'));

			if (components.jCal.length === 0) {
				return null;
			}

			registerTimezones(components);

			var vevents = components.getAllSubcomponents('vevent');
			var renderedEvents = [];

			angular.forEach(vevents, function (vevent) {
				var event = new ICAL.Event(vevent);
				var fcData;

				try {
					if (!vevent.hasProperty('dtstart')) {
						return;
					}
					if (event.isRecurring()) {
						fcData = parseTimeForRecurringEvent(vevent, icalstart, icalend, timezone.jCal);
					} else {
						fcData = [];
						fcData.push(parseTimeForSingleEvent(vevent, timezone.jCal));
					}
				} catch(e) {
					console.log(e);
				}

				if (typeof fcData === 'undefined') {
					return;
				}

				for (var i = 0, length = fcData.length; i < length; i++) {
					fcData[i] = addCalendarDataToFCData(fcData[i], eventObject.calendar);
					fcData[i] = addEventDataToFCData(fcData[i], vevent, event, eventObject);
					fcData[i].event = eventObject;

					renderedEvents.push(fcData[i]);
				}
			});

			return renderedEvents;
		},

		/**
		 * resize an event
		 * @param event
		 * @param delta
		 * @param data
		 * @returns {*}
		 */
		resizeEvent: function(event, delta, data) {
			var jcal = ICAL.parse(data);
			var components = new ICAL.Component(jcal);
			var vevents = components.getAllSubcomponents('vevent');
			var foundEvent = false;
			var deltaAsSeconds = 0;
			var duration = null;
			var propertyToUpdate = null;

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					deltaAsSeconds = delta.asSeconds();
					duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);

					if (vevents[i].hasProperty('duration')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('duration');
						duration.fromSeconds((duration.toSeconds() + propertyToUpdate.toSeconds()));
						vevents[i].updatePropertyWithValue('duration', duration);
					} else if (vevents[i].hasProperty('dtend')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
					} else if (vevents[i].hasProperty('dtstart')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart').clone();
						propertyToUpdate.addDuration(duration);
						vevents[i].addPropertyWithValue('dtend', propertyToUpdate);
					} else {
						continue;
					}

					components.addSubcomponent(vevents[i]);
					foundEvent = true;
				}
			}

			return (foundEvent) ? components.toString() : null;
		},

		/**
		 * drop an event
		 * @param event
		 * @param delta
		 * @param data
		 * @returns {*}
		 */
		dropEvent: function(event, delta, data) {
			var jcal = ICAL.parse(data);
			var components = new ICAL.Component(jcal);
			var vevents = components.getAllSubcomponents('vevent');
			var foundEvent = false;
			var deltaAsSeconds = 0;
			var duration = null;
			var propertyToUpdate = null;

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					deltaAsSeconds = delta.asSeconds();
					duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);

					if (vevents[i].hasProperty('dtstart')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtstart');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtstart', propertyToUpdate);

					}

					if (vevents[i].hasProperty('dtend')) {
						propertyToUpdate = vevents[i].getFirstPropertyValue('dtend');
						propertyToUpdate.addDuration(duration);
						vevents[i].updatePropertyWithValue('dtend', propertyToUpdate);
					}

					components.addSubcomponent(vevents[i]);
					foundEvent = true;
				}
			}

			return (foundEvent) ? components.toString() : null;
		},

		/**
		 *
		 * @param event
		 * @param data
		 */
		getCorrectEvent: function(event, data) {
			var jCalData = ICAL.parse(data);
			var components = new ICAL.Component(jCalData);
			var vevents = components.getAllSubcomponents('vevent');

			components.removeAllSubcomponents('vevent');

			if (components.jCal.length !== 0) {
				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(event, vevents[i])) {
						components.addSubcomponent(vevents[i]);
						continue;
					}

					return vevents[i];
				}
			}

			return null;
		}
	 };
 });
