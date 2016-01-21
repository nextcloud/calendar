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

app.factory('VEvent', ['$filter', 'objectConverter', function($filter, objectConverter) {
	'use strict';

	/**
	 * check if vevent is the one described in event
	 * @param {Object} fcEvent
	 * @param {Object} vevent
	 * @returns {boolean}
	 */
	function isCorrectEvent(fcEvent, vevent) {
		if (fcEvent.recurrenceId === null) {
			if (!vevent.hasProperty('recurrence-id')) {
				return true;
			}
		} else {
			if (fcEvent.recurrenceId === vevent.getFirstPropertyValue('recurrence-id').toICALString()) {
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
			var dtstart = vevent.getFirstPropertyValue('dtstart').clone();
			dtstart.addDuration(vevent.getFirstPropertyValue('duration'));
			return dtstart;
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

	function VEvent(calendar, props, uri) {
		var _this = this;

		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null,
			_onDemandProps: {
				jCal: null
			},

			getFcEvent: function(start, end, timezone) {
				var components = new ICAL.Component(this.jCal);

				var iCalStart = new ICAL.Time();
				iCalStart.fromUnixTime(start.format('X'));
				var iCalEnd = new ICAL.Time();
				iCalEnd.fromUnixTime(end.format('X'));

				if (components.jCal.length === 0) {
					return [];
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
							fcData = parseTimeForRecurringEvent(vevent, iCalStart, iCalEnd, timezone.jCal);
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
						// add information about calendar
						fcData[i].calendar = _this.calendar;
						fcData[i].editable = calendar.writable;
						fcData[i].backgroundColor = calendar.color;
						fcData[i].borderColor = calendar.color;
						fcData[i].textColor = calendar.textColor;
						fcData[i].className = 'fcCalendar-id-' + calendar.tmpId;

						// add information about actual event
						fcData[i].uri = _this.uri;
						fcData[i].etag = _this.etag;
						fcData[i].title = vevent.getFirstPropertyValue('summary');

						if (event.isRecurrenceException()) {
							fcData[i].recurrenceId = vevent
								.getFirstPropertyValue('recurrence-id')
								.toICALString();
							fcData[i].id = _this.uri + event.recurrenceId;
						} else {
							fcData[i].recurrenceId = null;
							fcData[i].id = _this.uri;
						}

						fcData[i].event = _this;

						renderedEvents.push(fcData[i]);
					}
				});

				return renderedEvents;
			},
			getSimpleData: function(fcEvent) {
				var components = new ICAL.Component(this.jCal);
				var vevents = components.getAllSubcomponents('vevent');
				var vevent = null;

				if (components.jCal.length !== 0) {
					for (var i = 0; i < vevents.length; i++) {
						if (!isCorrectEvent(fcEvent, vevents[i])) {
							continue;
						}

						vevent = vevents[i];
					}
				}

				if (!vevent) {
					return;
				}

				return objectConverter.parse(vevent);
			},
			drop: function(fcEvent, delta) {
				var components = new ICAL.Component(this.jCal);
				var vevents = components.getAllSubcomponents('vevent');
				var foundEvent = false;
				var deltaAsSeconds = delta.asSeconds();
				var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
				var propertyToUpdate = null;

				if (components.jCal.length !== 0) {
					for (var i = 0; i < vevents.length; i++) {
						if (!isCorrectEvent(fcEvent, vevents[i])) {
							continue;
						}

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

						foundEvent = true;
					}
				}

				if (!foundEvent) {
					return false;
				}
				this.data = components.toString();
				return true;
			},
			resize: function(fcEvent, delta) {
				var components = new ICAL.Component(this.jCal);
				var vevents = components.getAllSubcomponents('vevent');
				var foundEvent = false;
				var deltaAsSeconds = delta.asSeconds();
				var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
				var propertyToUpdate = null;

				if (components.jCal.length !== 0) {
					for (var i = 0; i < vevents.length; i++) {
						if (!isCorrectEvent(fcEvent, vevents[i])) {
							continue;
						}

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

						foundEvent = true;
					}
				}

				if (!foundEvent) {
					return false;
				}

				this.data = components.toString();
				return true;
			},
			patch: function(fcEvent, newSimpleData) {
				var components = new ICAL.Component(this.jCal);
				var vevents = components.getAllSubcomponents('vevent');
				var vevent = null;

				if (components.jCal.length !== 0) {
					for (var i = 0; i < vevents.length; i++) {
						if (!isCorrectEvent(fcEvent, vevents[i])) {
							continue;
						}

						vevent = vevents[i];
					}
				}

				if (!vevent) {
					return false;
				}

				objectConverter.patch(vevent, this.getSimpleData(fcEvent), newSimpleData);
				this.data = components.toString();
			},
			//does this work???
			get jCal() {
				if (this._onDemandProps.jCal === null) {
					this._onDemandProps.jCal = ICAL.parse(this.data);
				}

				return this._onDemandProps.jCal;
			}
		});
	}

	return VEvent;
}]);
