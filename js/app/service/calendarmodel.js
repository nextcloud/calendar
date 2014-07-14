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

app.factory('CalendarModel', function () {
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
		this.firstday = {};
		this.modelview = {
			id: '',
			view: ''
		};
		this.datepickerview = {
			id: '',
			view: ''
		};
		this.today = {
			id: '',
			date: new Date()
		};
		this.date = new Date();
	};

	CalendarModel.prototype = {
		create: function (newcalendar) {
			this.calendars.push(newcalendar);
		},
		add: function (calendar) {
			this.updateIfExists(calendar);
		},
		addAll: function (calendars) {
			for (var i = 0; i < calendars.length; i++) {
				this.add(calendars[i]);
			}
		},
		getAll: function () {
			return this.calendars;
		},
		get: function (id) {
			return this.calendarId[id];
		},
		updateIfExists: function (updated) {
			var calendar = this.calendarId[updated.id];
			if (angular.isDefined(calendar)) {
				calendar.displayname = updated.displayname;
				calendar.color = updated.color;
			} else {
				this.calendars.push(updated);
				this.calendarId[updated.id] = updated;
			}
		},
		remove: function (id) {
			for (var i = 0; i < this.calendars.length; i++) {
				var calendar = this.calendars[i];
				if (calendar.id === id) {
					this.calendars.splice(i, 1);
					delete this.calendarId[id];
					break;
				}
			}
		},
		pushdatepickerview: function (view, date) {
			this.datepickerview.id = Math.random(1000);
			this.datepickerview.view = view;
		},
		getdatepickerview: function (view) {
			return this.datepickerview;
		},
		pushtoggleview: function (view) {
			this.modelview.id = Math.random(1000);
			this.modelview.view = view;
		},
		gettoggleview: function () {
			return this.modelview;
		},
		pushtodaydatepicker: function () {
			this.today.id = Math.random(1000);
		},
		gettodaydatepicker: function () {
			return this.today;
		},
		pushdate: function (date) {
			this.date = date;
		},
		getdate: function () {
			return this.date;
		},
		pushfirstday: function (val) {
			this.firstday = moment().day(val).day();
		},
		getfirstday: function () {
			return this.firstday;
		}
	};

	return new CalendarModel();
});
