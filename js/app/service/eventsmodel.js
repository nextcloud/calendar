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

/**
* Model: Events
* Description: Required for Calendar Sharing.
*/

app.factory('EventsModel', ['objectConverter', function (objectConverter) {
	var EventsModel = function () {
		this.events = [];
		this.eventsUid = {};
		this.eventobject = {};
		this.calid = {
			id: '',
			changer: ''
		}; // required for switching the calendars on the fullcalendar
		this.components = {};
		this.vevents = {};
		this.eventsmodalproperties = {
			"event": '',
			"jsEvent": '',
			"view": ''
		};
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
		addAllDisplayFigures: function (calendarId, calendardisplayname, calendarcolor, jcalData, start, end, timezone) {
			var components = new ICAL.Component(jcalData);
			var events = [];

			var dtstart = '';
			var dtend = '';
			var etag = '';
			var eventsId = '';
			var uri = '';
			var recurrenceId = null;
			var isAllDay = false;

			var iCalTimeStart = new ICAL.Time();
			iCalTimeStart.fromUnixTime(start);
			var iCalTimeEnd = new ICAL.Time();
			iCalTimeEnd.fromUnixTime(end);

			if (components.jCal.length !== 0) {
				var vtimezones = components.getAllSubcomponents("vtimezone");
				angular.forEach(vtimezones, function (vtimezone) {
					var timezone = new ICAL.Timezone(vtimezone);
					ICAL.TimezoneService.register(timezone.tzid, timezone);
				});

				var vevents = components.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (vevent) {
					try {
						var iCalEvent = new ICAL.Event(vevent);
						var event = {
							"calendardisplayname": calendardisplayname,
							"calendarcolor": calendarcolor,
							"calendarId": calendarId
						};

						event.objectUri = vevent.getFirstPropertyValue('x-oc-uri');
						event.etag = vevent.getFirstPropertyValue('x-oc-etag');
						event.title = vevent.getFirstPropertyValue('summary');

						if (iCalEvent.isRecurrenceException()) {
							event.recurrenceId = vevent
								.getFirstPropertyValue('recurrence-id')
								.toICALString();
							event.id = event.objectUri + event.recurrenceId;
						} else {
							event.recurrenceId = null;
							event.id = event.objectUri;
						}

						if (!vevent.hasProperty('dtstart')) {
							return;
						}
						dtstart = vevent.getFirstPropertyValue('dtstart');

						if (vevent.hasProperty('dtend')) {
							dtend = vevent.getFirstPropertyValue('dtend');
						} else if (vevent.hasProperty('duration')) {
							dtend = dtstart.clone();
							dtend.addDuration(vevent.getFirstPropertyValue('dtstart'));
						} else {
							dtend = dtstart.clone();
						}

						if (iCalEvent.isRecurring()) {
							var iterator = new ICAL.RecurExpansion({
								component: vevent,
								dtstart: dtstart
							});

							var duration = dtend.subtractDate(dtstart);

							var next;
							while ((next = iterator.next())) {
								if (next.compare(iCalTimeStart) === -1) {
									continue;
								}
								if (next.compare(iCalTimeEnd) === 1) {
									break;
								}

								dtstart = next.clone();
								dtend = next.clone();
								dtend.addDuration(duration);

								if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
									dtstart.convertToZone(timezone);
								}
								if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
									dtend.convertToZone(timezone);
								}

								isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

								var newEvent = JSON.parse(JSON.stringify(event));
								newEvent.start = dtstart.toJSDate();
								newEvent.end = dtend.toJSDate();
								newEvent.allDay = isAllDay;

								events.push(newEvent);
							}
						} else {
							if (dtstart.icaltype != 'date' && dtstart.zone != ICAL.Timezone.utcTimezone && dtstart.zone != ICAL.Timezone.localTimezone) {
								dtstart = dtstart.convertToZone(timezone);
							}

							if (dtend.icaltype != 'date' && dtend.zone != ICAL.Timezone.utcTimezone && dtend.zone != ICAL.Timezone.localTimezone) {
								dtend = dtend.convertToZone(timezone);
							}

							isAllDay = (dtstart.icaltype == 'date' && dtend.icaltype == 'date');

							event.start = dtstart.toJSDate();
							event.end = dtend.toJSDate();
							event.allDay = isAllDay;

							events.push(event);
						}
					} catch(e) {
						console.warn('');
						console.warn('Error in calendar:');
						console.warn(calendardisplayname);
						console.warn(e.message);
						console.warn('');
						//console.log(e.stack);
					}
				});
			}
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

			return (didFindEvent) ? components.toString() : null;
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

			return (didFindEvent) ? components.toString() : null;
		},
		modalpropertyholder: function (event, jsEvent, view, jcalData) {
			this.components = new ICAL.Component(jcalData);
			this.vevents = this.components.getAllSubcomponents('vevent');
			if (this.components.jCal.length !== 0) {
				for (var i = 0; i < this.vevents.length; i++) {
					if (!isCorrectEvent(event, this.vevents[i])) {
						this.components.addSubcomponent(vevents[i]);
						continue;
					}
					var data = objectConverter.parse(this.vevents[i]);
					console.log(data);
					this.addeventobjectcontent(event,this.vevents[i]);
				}
			}
		},
		addeventobjectcontent: function (event,vevent) {
			this.eventobject.push({
				"calendar":event,
				"title" : vevent.getFirstPropertyValue('summary'),
				"location" : vevent.getFirstPropertyValue('location'),
				"categoties" : vevent.getFirstPropertyValue('category'),
				"description" : vevent.getFirstPropertyValue('description')
			});
		},
		addattendee: function (attendee) {
			this.components.removeAllSubcomponents('vevent');

			if (this.components.jCal.length !== 0) {
				for (var i = 0; i < this.vevents.length; i++) {
					console.log(this.vevents[i]);
					console.log(attendee);
					//if (!isCorrectEvent(event, this.vevents[i])) {
					//	this.components.addSubcomponent(this.vevents[i]);
					//	continue;
					//}

					var property = new ICAL.Property('attendee');

					property.setParameter('ROLE', 'REQ-PARTICIPANT');
					property.setParameter('RVSP', true);
					property.setParameter('PARTSTAT', 'NEEDS-ACTION');
					property.setParameter('CUTYPE', 'INDIVIDUAL');
					property.setParameter('X-OC-SENTMAIL', false);

					property.setValue('email addr');

					console.log(property.toJSON());
				}
			}
		},
		updateevent : function (updated) {
			console.log(updated);
		},
		addEvent: function (id) {
			this.calid.changer = Math.random(1000);
			this.calid.id = id;
		},
		getAll: function () {
			return this.events;
		},
		remove: function (id) {
			delete this.id;
		}
	};

	return new EventsModel();
}]);