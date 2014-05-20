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

app.factory('CalendarModel', function() {
	var CalendarModel = function () {
		this.calendars = [];
		this.calendarId = {};
	};

	CalendarModel.prototype = {
		add: function (calendar) {
			this.calendars.push(calendar);
		},
		addAll : function (calendars) {
			for(var i=0; i<calendars.length; i++) {
				this.add(calendars[i]);
			}
		},
		getAll : function () {
			return this.calendars;
		},
		get : function (uri) {
			for (var i = 0; i<this.calendars.length;i++) {
				var calendar = this.calendars[i];
				if (calendar.uri === uri) {
					this.calendarId = this.calendars[i];
					break;
				}
			}
			return this.calendarId;
		},
		updateIfExists : function () {

		},
		remove : function (calendar) {
			console.log(calendar);
			// Todo: Splice of the Calendar Input here instead the calendar.
			delete this.calendar;
		},
	};

	return new CalendarModel();
});
