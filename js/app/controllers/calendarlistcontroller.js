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
* Controller: CalendarListController
* Description: Takes care of CalendarList in App Navigation.
*/

app.controller('CalendarListController', ['$scope', '$rootScope', '$window',
	'$routeParams', 'Restangular', 'CalendarModel',
	function ($scope, $rootScope, $window, $routeParams, Restangular, CalendarModel) {
		'use strict';

		$scope.calendarModel = CalendarModel;
		$scope.calendars = CalendarModel.getAll();
		$scope.backups = {};

		var calendarResource = Restangular.all('calendars');

		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

		$scope.create = function (name, color) {
			calendarResource.post({
				displayname: name,
				color: color,
				components: {
					vevent: true,
					vjournal: true,
					vtodo: true
				},
				enabled: true
			}).then(function (calendar) {
				CalendarModel.create(calendar);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('createdCalendar', calendar);
			});

			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
		};

		$scope.download = function (calendar) {
			$window.open('v1/calendars/' + calendar.id + '/export');
		};

		$scope.prepareUpdate = function (calendar) {
			$scope.backups[calendar.id] = angular.copy(calendar);
			calendar.list.edit = true;
		};

		$scope.cancelUpdate = function (calendar) {
			angular.forEach($scope.calendars, function(value, key) {
				if (value.id === calendar.id) {
					$scope.calendars[key] = angular.copy($scope.backups[calendar.id]);
					$scope.calendars[key].list.edit = false;
				}
			});
		};

		$scope.performUpdate = function (calendar) {
			Restangular.one('calendars', calendar.id).patch({
				displayname: calendar.displayname,
				color: calendar.color,
				components: angular.copy(calendar.components)
			}).then(function (updated) {
				CalendarModel.update(updated);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('updatedCalendar', updated);
			});
		};

		$scope.triggerEnable = function(c) {
			c.loading = true;
			var calendar = CalendarModel.get(c.id);
			var newEnabled = !calendar.enabled;
			calendar.patch({
				'enabled': newEnabled
			}).then(function (calendarObj) {
				CalendarModel.update(calendarObj);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('updatedCalendarsVisibility', calendarObj);
			});
		};

		$scope.remove = function (c) {
			c.loading = true;
			var calendar = CalendarModel.get(c.id);
			calendar.remove().then(function () {
				CalendarModel.remove(c.id);
				$scope.calendars = CalendarModel.getAll();
				$rootScope.$broadcast('removedCalendar', c);
			});
		};

		//We need to reload the refresh the calendar-list,
		//if the user added a subscription
		$rootScope.$on('createdSubscription', function() {
			Restangular.all('calendars').getList().then(function (calendars) {
				CalendarModel.addAll(calendars);
			});
		});


		$rootScope.$on('finishedLoadingEvents', function(event, calendarId) {
			var calendar = CalendarModel.get(calendarId);
			calendar.loading = false;
			CalendarModel.update(calendar);
			$scope.calendars = CalendarModel.getAll();
		});
	}
]);
