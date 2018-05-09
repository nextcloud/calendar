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

app.factory('VEvent', function(TimezoneService, FcEvent, SimpleEvent, ICalFactory, StringUtility) {
	'use strict';

	/**
	 * get a VEvent object
	 * @param {Calendar} calendar
	 * @param {ICAL.Component} comp
	 * @param {string} uri
	 * @param {string} etag
	 */
	function VEvent(calendar, comp, uri, etag='') {
		const context = {calendar, comp, uri, etag};
		const iface = {
			_isAVEventObject: true
		};

		if (!context.comp || !context.comp.jCal || context.comp.jCal.length === 0) {
			throw new TypeError('Given comp is not a valid calendar');
		}

		// read all timezones in the comp and register them
		const vtimezones = comp.getAllSubcomponents('vtimezone');
		vtimezones.forEach(function(vtimezone) {
			const timezone = new ICAL.Timezone(vtimezone);
			ICAL.TimezoneService.register(timezone.tzid, timezone);
		});

		if (!uri) {
			const vevent = context.comp.getFirstSubcomponent('vevent');
			context.uri = vevent.getFirstPropertyValue('uid');
		}

		/**
		 * get DTEND from vevent
		 * @param {ICAL.Component} vevent
		 * @returns {ICAL.Time}
		 */
		context.calculateDTEnd = function(vevent) {
			if (vevent.hasProperty('dtend')) {
				return vevent.getFirstPropertyValue('dtend');
			} else if (vevent.hasProperty('duration')) {
				const dtstart = vevent.getFirstPropertyValue('dtstart').clone();
				dtstart.addDuration(vevent.getFirstPropertyValue('duration'));

				return dtstart;
			} else {
				/*
				 * RFC 5545 - 3.6.1.
				 *
				 * For cases where a "VEVENT" calendar component
				 * specifies a "DTSTART" property with a DATE value type but no
				 * "DTEND" nor "DURATION" property, the event’s duration is taken to
				 * be one day.  For cases where a "VEVENT" calendar component
				 * specifies a "DTSTART" property with a DATE-TIME value type but no
				 * "DTEND" property, the event ends on the same calendar date and
				 * time of day specified by the "DTSTART" property.
				 */
				const dtstart = vevent.getFirstPropertyValue('dtstart').clone();

				if (dtstart.icaltype === 'date') {
					dtstart.addDuration(ICAL.Duration.fromString('P1D'));
				}

				return dtstart;
			}
		};

		/**
		 * convert a dt's timezone if necessary
		 * @param {ICAL.Time} dt
		 * @param {ICAL.Component} timezone
		 * @returns {ICAL.Time}
		 */
		context.convertTz = function(dt, timezone) {
			if (context.needsTzConversion(dt) && timezone) {
				dt = dt.convertToZone(timezone);
			}

			return dt;
		};

		/**
		 * check if we need to convert the timezone of either dtstart or dtend
		 * @param {ICAL.Time} dt
		 * @returns {boolean}
		 */
		context.needsTzConversion = function(dt) {
			return (dt.icaltype !== 'date' &&
				dt.zone !== ICAL.Timezone.localTimezone);
		};

		/**
		 * collect missing timezones
		 * @returns {Array}
		 */
		context.getMissingEventTimezones = () => {
			const missingTimezones = [];
			const propertiesToSearch = ['dtstart', 'dtend'];
			const vevents = context.comp.getAllSubcomponents('vevent');
			vevents.forEach(function (vevent) {
				propertiesToSearch.forEach((propName) => {
					if (vevent.hasProperty(propName)) {
						const prop = vevent.getFirstProperty(propName);
						const tzid = prop.getParameter('tzid');
						if (tzid && !ICAL.TimezoneService.has(tzid) && missingTimezones.indexOf(tzid) === -1) {
							missingTimezones.push(tzid);
						}
					}
				});
			});

			return missingTimezones;
		};

		Object.defineProperties(iface, {
			calendar: {
				get: function() {
					return context.calendar;
				},
				set: function(calendar) {
					context.calendar = calendar;
				}
			},
			comp: {
				get: function() {
					return context.comp;
				}
			},
			data: {
				get: function() {
					return context.comp.toString();
				}
			},
			etag: {
				get: function() {
					return context.etag;
				},
				set: function(etag) {
					context.etag = etag;
				}
			},
			uri: {
				get: function() {
					return context.uri;
				}
			}
		});

		/**
		 * get fullcalendar event in a defined time-range
		 * @param {moment} start
		 * @param {moment} end
		 * @param {Timezone} timezone
		 * @returns {Promise}
		 */
		iface.getFcEvent = function(start, end, timezone) {
			return new Promise((resolve, reject) => {
				const iCalStart = ICAL.Time.fromJSDate(start.toDate());
				const iCalEnd = ICAL.Time.fromJSDate(end.toDate());
				const fcEvents = [];

				const missingTimezones = context.getMissingEventTimezones();
				const errorSafeMissingTimezones = [];
				missingTimezones.forEach((missingTimezone) => {
					const promise = TimezoneService.get(missingTimezone)
						.then((tz) => tz)
						.catch((reason) => null);
					errorSafeMissingTimezones.push(promise);
				});

				Promise.all(errorSafeMissingTimezones).then((timezones) => {
					timezones.forEach((timezone) => {
						if (!timezone) {
							return;
						}

						const icalTimezone = new ICAL.Timezone(timezone.jCal);
						ICAL.TimezoneService.register(timezone.name, icalTimezone);
					});
				}).then(() => {
					const vevents = context.comp.getAllSubcomponents('vevent');
					const exceptions = vevents.filter((vevent) => vevent.hasProperty('recurrence-id'));
					const vevent = vevents.find((vevent) => !vevent.hasProperty('recurrence-id'));

					if (!vevent && exceptions.length === 0) {
						resolve([]);
					}

					// is there a main event that's recurring?
					if (vevent && (vevent.hasProperty('rrule') || vevent.hasProperty('rdate'))) {
						if (!vevent.hasProperty('dtstart')) {
							resolve([]);
						}

						const iCalEvent = new ICAL.Event(vevent, {exceptions});
						const dtstartProp = vevent.getFirstProperty('dtstart');
						const rawDtstart = dtstartProp.getFirstValue('dtstart');

						const iterator = new ICAL.RecurExpansion({
							component: vevent,
							dtstart: rawDtstart
						});

						let next;
						while ((next = iterator.next())) {
							const occurrence = iCalEvent.getOccurrenceDetails(next);

							if (occurrence.endDate.compare(iCalStart) < 0) {
								continue;
							}
							if (occurrence.startDate.compare(iCalEnd) > 0) {
								break;
							}

							const dtstart = context.convertTz(occurrence.startDate, timezone.jCal);
							const dtend = context.convertTz(occurrence.endDate, timezone.jCal);
							const fcEvent = FcEvent(iface, occurrence.item.component, dtstart, dtend);

							fcEvents.push(fcEvent);
						}
					} else {
						if (vevent) {
							exceptions.push(vevent);
						}

						exceptions.forEach((singleVEvent) => {
							if (!singleVEvent.hasProperty('dtstart')) {
								return;
							}

							const dtstartProp = singleVEvent.getFirstProperty('dtstart');
							const rawDtstart = dtstartProp.getFirstValue('dtstart');
							const rawDtend = context.calculateDTEnd(singleVEvent);

							const dtstart = context.convertTz(rawDtstart, timezone.jCal);
							const dtend = context.convertTz(rawDtend, timezone.jCal);
							const fcEvent = FcEvent(iface, singleVEvent, dtstart, dtend);

							fcEvents.push(fcEvent);
						});
					}

					resolve(fcEvents);
				});
			});
		};

		/**
		 *
		 * @param searchedRecurrenceId
		 * @returns {SimpleEvent}
		 */
		iface.getSimpleEvent = function(searchedRecurrenceId) {
			const vevents = context.comp.getAllSubcomponents('vevent');

			const veventsLength = vevents.length;
			for (let i=0; i < veventsLength; i++) {
				const vevent = vevents[i];
				const hasRecurrenceId = vevent.hasProperty('recurrence-id');
				let recurrenceId = null;
				if (hasRecurrenceId) {
					recurrenceId = vevent.getFirstPropertyValue('recurrence-id').toICALString();
				}

				if (!hasRecurrenceId && !searchedRecurrenceId ||
					hasRecurrenceId && searchedRecurrenceId === recurrenceId) {
					return SimpleEvent(vevent);
				}
			}

			throw new Error('Event not found');
		};

		/**
		 * update events last-modified property to now
		 */
		iface.touch = function() {
			const vevent = context.comp.getFirstSubcomponent('vevent');
			vevent.updatePropertyWithValue('last-modified', ICAL.Time.now());
		};

		return iface;
	}

	VEvent.isVEvent = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isAVEventObject === true);
	};

	/**
	* create all-day event from malformed input
	* @param {string} ics
	* @returns {string}
	*/
	VEvent.sanDate = function(ics) {
		ics.split("\n").forEach(function(el, i) {

			var findTypes = ['DTSTART', 'DTEND'];
			var dateType = /[^:]*/.exec(el)[0];
			var icsDate = null;

			if (findTypes.indexOf(dateType) >= 0 && el.trim().substr(-3) === 'T::') { // is date without time
				icsDate = el.replace(/[^0-9]/g, '');
				ics = ics.replace(el, dateType + ';VALUE=DATE:' + icsDate);
			}
		});

		return ics;
	};

	/**
	 * create all-day event from malformed input
	 * @param {string} ics
	 * @returns {string}
	 */
	VEvent.sanNoDateValue = (ics) => {
		ics.split("\n").forEach(function(el, i) {

			if (el.indexOf(';VALUE=DATE') !== -1) {
				return;
			}

			const findTypes = ['DTSTART', 'DTEND'];
			const [dateTypePara, dateValue] = el.split(':');
			const [dateType, ...dateParameters] = dateTypePara.split(';');

			if (findTypes.indexOf(dateType) >= 0 && dateParameters.indexOf('VALUE=DATE') === -1 && dateValue.length === 8) { // is date without time
				ics = ics.replace(el, dateTypePara + ';VALUE=DATE:' + dateValue);
			}
		});

		return ics;
	};

	/**
	 * fix incorrectly populated trigger
	 * @param {string} ics
	 * @returns {string}
	 */
	VEvent.sanTrigger = function(ics) {
		const regex = /^TRIGGER:P$/gm;
		if (ics.match(regex)) {
			ics = ics.replace(regex, 'TRIGGER:P0D');
		}

		return ics;
	};

	/**
	 * create a VEvent object from raw ics data
	 * @param {Calendar} calendar
	 * @param {string} ics
	 * @param {string} uri
	 * @param {string} etag
	 * @returns {VEvent}
	 */
	VEvent.fromRawICS = function(calendar, ics, uri, etag='') {
		let comp;

		if (ics.search('T::') > 0) { // no time
			ics = VEvent.sanDate(ics);
		}

		if (ics.search('TRIGGER:P') > 0) {
			ics = VEvent.sanTrigger(ics);
		}

		ics = VEvent.sanNoDateValue(ics);

		try {
			const jCal = ICAL.parse(ics);
			comp = new ICAL.Component(jCal);
		} catch (e) {
			//console.log(e);
			throw new TypeError('given ics data was not valid');
		}

		return VEvent(calendar, comp, uri, etag);
	};


	/**
	 * generates a new VEvent based on start and end
	 * @param start
	 * @param end
	 * @param timezone
	 * @returns {VEvent}
	 */
	VEvent.fromStartEnd = function(start, end, timezone) {
		const uid = StringUtility.uid();
		const comp = ICalFactory.newEvent(uid);
		const uri = StringUtility.uid('Nextcloud', 'ics');
		const vevent = VEvent(null, comp, uri);
		const simple = vevent.getSimpleEvent();

		simple.allDay = !start.hasTime() && !end.hasTime();
		simple.dtstart = {
			type: start.hasTime() ? 'datetime' : 'date',
			value: start,
			parameters: {
				zone: timezone
			}
		};
		simple.dtend = {
			type: end.hasTime() ? 'datetime' : 'date',
			value: end,
			parameters: {
				zone: timezone
			}
		};
		simple.patch();

		return vevent;
	};

	return VEvent;
});
