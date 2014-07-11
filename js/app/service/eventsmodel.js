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
	};

	EventsModel.prototype = {
		create : function (newevent) {
			var rawdata = new ICAL.Event();
			this.events.push(rawdata);
		},
		addalldisplayfigures : function (calendarid,jcalData,timezone) {
			var events = [];
			var start = '';
			var end = '';
			var eventsid = '';
			var rawdata = new ICAL.Component(jcalData);
			var fields = [];
			var self = this;
			var isAllDay;
			if (rawdata.jCal.length !== 0) {
				var vtimezones = rawdata.getAllSubcomponents("vtimezone");
				ICAL.TimezoneService.reset();

				angular.forEach(vtimezones, function (value,key) {
					var timezone = new ICAL.Timezone(value);
					ICAL.TimezoneService.register(timezone.tzid, timezone);
				});

				var vevents = rawdata.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (value,key) {
					// Todo : Repeating Calendar.
					if (value.hasProperty('dtstart')) {
						if (value.hasProperty('recurrenceId')) {
							start = value.getFirstPropertyValue('recurrenceId');
							eventsid = value.getFirstPropertyValue('x-oc-uri') + '//' + start.toICALString();
						} else {
							start = value.getFirstPropertyValue('dtstart');
							eventsid = value.getFirstPropertyValue('x-oc-uri');
						}
						if (value.hasProperty('dtend')){
							end = value.getFirstPropertyValue('dtend');
						} else if (value.hasProperty('duration')) {
							end = start.clone();
							end.addDuration(value.getFirstPropertyValue('dtstart'));
						} else {
							end = start.clone();	
						}
						if (start.icaltype != 'date' && start.zone != ICAL.Timezone.utcTimezone && start.zone !=  ICAL.Timezone.localTimezone) {
							start = start.convertToZone(timezone);
						}
						if (end.icaltype != 'date' && end.zone != ICAL.Timezone.utcTimezone && end.zone !=  ICAL.Timezone.localTimezone) {
							end = end.convertToZone(timezone);
						}
						isAllDay = (start.icaltype == 'date' && end.icaltype == 'date');
					}
					events[key] = {
						"id" : eventsid,
						"calid" : calendarid,
						"title" : value.getFirstPropertyValue('summary'),
						"start" : start.toJSDate(),
						"end" : end.toJSDate(),
						"allDay" : isAllDay
					};
				});
			}
			return events;
		},
		alertMessage : function (title,start,end,allday) {
			return 0;
		},
		addEvent: function(id) {
			this.calid.changer = Math.random(1000); 
			this.calid.id = id;
		},
		getEvent: function() {
			return this.calid;
		},
		getAll : function () {
			return this.events;
		},
		get : function (id) {

		},
		remove : function (id) {
			delete this.id;
		}
	};

	return new EventsModel();
});