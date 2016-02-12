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

app.factory('VEvent', ['$filter', 'objectConverter', 'ICalFactory', 'RandomStringService', function($filter, objectConverter, icalfactory, RandomStringService) {
	'use strict';

	/**
	 * check if vevent is the one described in event
	 * @param {String} recurrenceId
	 * @param {Object} vevent
	 * @returns {boolean}
	 */
	function isCorrectEvent(recurrenceId, vevent) {
		if (recurrenceId === null) {
			if (!vevent.hasProperty('recurrence-id')) {
				return true;
			}
		} else {
			if (recurrenceId === vevent.getFirstPropertyValue('recurrence-id').toICALString()) {
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
			etag: props['{DAV:}getetag'] || null
		});

		this.jCal = ICAL.parse(this.data);
		this.components = new ICAL.Component(this.jCal);

		if (this.components.jCal.length === 0) {
			throw "invalid calendar";
		}

		angular.extend(this, {
			getFcEvent: function(start, end, timezone) {
				var iCalStart = new ICAL.Time();
				iCalStart.fromUnixTime(start.format('X'));
				var iCalEnd = new ICAL.Time();
				iCalEnd.fromUnixTime(end.format('X'));

				if (_this.components.jCal.length === 0) {
					return [];
				}

				registerTimezones(_this.components);

				var vevents = _this.components.getAllSubcomponents('vevent');
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
			getSimpleData: function(recurrenceId) {
				var vevents = _this.components.getAllSubcomponents('vevent');

				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(recurrenceId, vevents[i])) {
						continue;
					}

					return objectConverter.parse(vevents[i]);
				}
			},
			drop: function(recurrenceId, delta) {
				var vevents = _this.components.getAllSubcomponents('vevent');
				var foundEvent = false;
				var deltaAsSeconds = delta.asSeconds();
				var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
				var propertyToUpdate = null;

				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(recurrenceId, vevents[i])) {
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

				if (!foundEvent) {
					return false;
				}
				_this.data = _this.components.toString();
				return true;
			},
			resize: function(recurrenceId, delta) {
				var vevents = _this.components.getAllSubcomponents('vevent');
				var foundEvent = false;
				var deltaAsSeconds = delta.asSeconds();
				var duration = new ICAL.Duration().fromSeconds(deltaAsSeconds);
				var propertyToUpdate = null;

				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(recurrenceId, vevents[i])) {
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

				if (!foundEvent) {
					return false;
				}

				_this.data = _this.components.toString();
				return true;
			},
			patch: function(recurrenceId, newSimpleData) {
				var vevents = _this.components.getAllSubcomponents('vevent');
				var vevent = null;

				for (var i = 0; i < vevents.length; i++) {
					if (!isCorrectEvent(recurrenceId, vevents[i])) {
						continue;
					}

					vevent = vevents[i];
				}

				if (!vevent) {
					return false;
				}

				objectConverter.patch(vevent, this.getSimpleData(recurrenceId), newSimpleData);
				_this.data = _this.components.toString();
			}
		});
	}

	VEvent.fromStartEnd = function(start, end, timezone) {
		console.log(start, end, timezone);
		var comp = icalfactory.new();

		var vevent = new ICAL.Component('vevent');
		comp.addSubcomponent(vevent);
		vevent.updatePropertyWithValue('created', ICAL.Time.now());
		vevent.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		vevent.updatePropertyWithValue('last-modified', ICAL.Time.now());
		vevent.updatePropertyWithValue('uid', RandomStringService.generate());

		objectConverter.patch(vevent, {}, {
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
			},
			summary: {
				type: 'text',
				value: t('calendar', 'New event')
			},
			alarm: [],
			attendee: []
		});

		return new VEvent(null, {
			'{urn:ietf:params:xml:ns:caldav}calendar-data': comp.toString(),
			'{DAV:}getetag': null
		}, null);
	};

	return VEvent;
}]);
