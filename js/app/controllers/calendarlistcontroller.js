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

app.controller('CalendarListController', ['$scope', '$window', '$location', '$routeParams', 'Restangular', 'CalendarModel', 'EventsModel',
	function ($scope, $window, $location, $routeParams, Restangular, CalendarModel, EventsModel) {

		$scope.calendars = CalendarModel.getAll();
		var calendarResource = Restangular.all('calendars');
		// Gets All Calendars.
		calendarResource.getList().then(function (calendars) {
			CalendarModel.addAll(calendars);
		});

		$scope.newcolor = 'rgba(37,46,95,1.0)';
		$scope.newCalendarInputVal = '';

		// Needed for CalDAV Input opening.
		$scope.calDAVmodel = '';
		$scope.i = [];

		// Needed for editing calendars.
		$scope.editmodel = '';
		$scope.editfieldset = null;
		$scope.editcolor = '';
		$scope.vevent = true;
		$scope.vjournal = false;
		$scope.vtodo = false;

		// Create a New Calendar
		$scope.create = function (newCalendarInputVal, newcolor) {
			var newCalendar = {
				"displayname": $scope.newCalendarInputVal,
				"color": $scope.newcolor,
				"components": {
					"vevent": true,
					"vjournal": true,
					"vtodo": true
				},
				"enabled": true
			};
			calendarResource.post(newCalendar).then(function (newCalendar) {
				CalendarModel.create(newCalendar);
			}, function (response) {
				OC.Notification.show(t('calendar', response.data.message));
			});
		};

		$scope.download = function (id) {
			$window.open('v1/calendars/' + id + '/export');
		};

		// Sharing Logic Comes Here.
		$scope.share = function (sharewith) {

		};

		// CalDAV display - hide logic goes here.
		$scope.toggleCalDAV = function ($index, uri, id) {
			$scope.i.push($index);
			$scope.calDAVmodel = OC.linkToRemote('caldav') + '/' + escapeHTML(encodeURIComponent(oc_current_user)) + '/' + escapeHTML(encodeURIComponent(uri));
		};

		$scope.updatecalendarform = function ($index, id, displayname, color) {
			if ($scope.editfieldset === id) {
				$scope.editfieldset = null;
			} else {
				$scope.editfieldset = id;
			}
			$scope.editmodel = displayname;
			$scope.editcolor = color;

			$scope.update = function (id, updatedname, updatedcolor, vevent, vjournal, vtodo) {
				var updated = {
					"displayname": updatedname,
					"color": updatedcolor,
					"components": {
						"vevent": vevent,
						"vjournal": vjournal,
						"vtodo": vtodo
					}
				};
				Restangular.one('calendars', id).patch(updated);
			};
		};

		// To Delete a Calendar
		$scope.delete = function (id) {
			var calendar = CalendarModel.get(id);
			var delcalendarResource = Restangular.one('calendars', id);
			delcalendarResource.remove().then(function () {
				CalendarModel.remove(calendar);
			});
		};

		// Initialises full calendar by sending the calendarid
		$scope.addEvent = function (newid) {
			EventsModel.addEvent(newid);
		};

		// Responsible for displaying or hiding events on the fullcalendar.
		$scope.addRemoveEventSource = function (newid) {
			$scope.addEvent(newid); // Switches watch in CalController
		};

	}
]);
