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
		addalldisplayfigures : function (calendarid,jcalData) {
			var events = [];
			var rawdata = new ICAL.Component(jcalData);
			var fields = [];
			var self = this;
			var isAllDay;
			if (rawdata.jCal.length !== 0) {
				var vevents = rawdata.getAllSubcomponents("vevent");
				angular.forEach(vevents, function (value,key) {
					var start = value.getFirstPropertyValue('dtstart');
					var end = value.getFirstPropertyValue('dtend');
					if (start.icaltype == 'date' && end.icaltype == 'date') {
						isAllDay = true;
					} else {
						isAllDay = false;
					}
					events[key] = {
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