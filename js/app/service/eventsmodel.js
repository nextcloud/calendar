/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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


app.factory('EventsModel', function () {
	var EventsModel = function () {
		this.events = [];
		this.eventsUid = {};
		this.calid = {
			id: '',
			changer: ''
		}; // required for switching the calendars on the fullcalendar
		this.eventsmodalproperties = {};
	};


	/**
	 * check if vevent is the one described in event
	 * @param {Object} event
	 * @param {Object} vevent
	 * @returns {boolean}
	 */
	function isCorrectEvent(event, vevent) {
		if (event.objectUri !== vevent.getFirstPropertyValue('x-oc-uri')) {
			return false;
		}

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


	EventsModel.prototype = {
		create: function (newevent) {
			var rawdata = new ICAL.Event();
			this.events.push(rawdata);
		},
		addAllDisplayFigures: function (calendarId, jcalData, start, end, timezone) {
			var components = new ICAL.Component(jcalData);
			var events = [];

			var dtstart = '';
			var dtend = '';
			var eventsId = '';
			var uri = '';
			var recurrenceId = null;
			var isAllDay = false;

			if (components.jCal.length !== 0) {
				var vtimezones = components.getAllSubcomponents("vtimezone");
				angular.forEach(vtimezones, function (vtimezone) {
					var timezone = new ICAL.Timezone(vtimezone);
					ICAL.TimezoneService.register(timezone.tzid, timezone);
				});

				var vevents = components.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (vevent) {
					// Todo : Repeating Calendar.
					if (vevent.hasProperty('dtstart')) {
						uri = vevent.getFirstPropertyValue('x-oc-uri');

						if (!vevent.hasProperty('dtstart')) {
							return;
						}
						dtstart = vevent.getFirstPropertyValue('dtstart');

						if (vevent.hasProperty('recurrence-id')) {
							recurrenceId = vevent.getFirstPropertyValue('recurrence-id').toICALString();
						}

						if (vevent.hasProperty('dtend')) {
							dtend = vevent.getFirstPropertyValue('dtend');
						} else if (vevent.hasProperty('duration')) {
							dtend = dtstart.clone();
							dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
						} else {
							dtend = dtstart.clone();
						}

						if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
							dtstart = dtstart.convertToZone(timezone);
						}

						if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
							dtend = dtend.convertToZone(timezone);
						}

						isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

						eventsId = uri;
						if (recurrenceId !== null) {
							eventsId = eventsId + recurrenceId;
						}

						events.push({
							"id": eventsId,
							"calendarId": calendarId,
							"objectUri": uri,
							"recurrenceId": recurrenceId,
							"title": vevent.getFirstPropertyValue('summary'),
							"start": dtstart.toJSDate(),
							"end": dtend.toJSDate(),
							"allDay": isAllDay
						});
					}
				});
			}
			console.log(events);
			return events;
		},
		eventResizer: function (event, delta, jcalData) {
			var components = new ICAL.Component(jcalData);
			var vevents = components.getAllSubcomponents('vevent');
			var didFindEvent = false;
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
					didFindEvent = true;
				}
			}

			return (didFindEvent) ? components.toJSON() : null;
		},
		eventDropper: function (event, delta, jcalData) {
			var components = new ICAL.Component(jcalData);
			var vevents = components.getAllSubcomponents('vevent');
			var didFindEvent = false;
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
					didFindEvent = true;
				}
			}

			return (didFindEvent) ? components.toJSON() : null;
		},
		putmodalproperties: function (event,jsEvent,view) {
			this.eventsmodalproperties = {
				"event": event,
				"jsEvent": jsEvent,
				"view": view
			};
		},
		getmodalproperties: function () {
			return this.eventsmodalproperties;
		},
		getEvent: function () {
			return this.calid;
		},
		getAll: function () {
			return this.events;
		},
		remove: function (id) {
			delete this.id;
		}
	};

	return new EventsModel();
});