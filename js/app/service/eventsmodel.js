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
	};

	EventsModel.prototype = {
		add : function (id) {
			this.events.push(id);
		},
		/* This has to return an object with
		creation date, end date, summary, and last modified.
		field = [
			{
				uid: "1"
				summary : "asd"
				createdon: "ads"
				endson: "sdad"
				lastedited : "asdsa"
			},
			{
				uid: "2"
				summary : "asdasd"
				createdon: "aasdds"
				endson: "sdasd"
				lastedited : "asdasdsa"
			}]
		*/ 
		addalldisplayfigures : function (jcalData) {
			var comp = new ICAL.Component(jcalData);
			var vevents = comp.getAllSubcomponents("vevent");
			var fields = [];
			var title = [];
			angular.forEach(vevents, function (value,key) {
				fields[key] = {
					"title" : value.jCal[1][4][3],
					"start" : value.jCal[1][5][3],
					"end" : value.jCal[1][6][3],
					"allDay": false
				};
			}, fields);
			return fields;
		},
		addAll : function (events) {
			for (var i=0; i<events.length; i++) {
				this.add(events[i]);
			}
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