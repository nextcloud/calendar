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

app.controller('CalendarListController', ['$scope', '$rootScope', '$window', 'CalendarService', 'is',
	function ($scope, $rootScope, $window, CalendarService, is) {
		'use strict';

		$scope.calendars = [];
		$scope.backups = {};
		is.loading = true;

		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

		CalendarService.getAll().then(function(calendars) {
			$scope.calendars = calendars;
			is.loading = false;
			// TODO - scope.apply should not be necessary here
			$scope.$apply();
		});


		$scope.create = function (name, color) {

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

		};

		$scope.triggerEnable = function(calendar) {
			calendar.loading = true;
			var newEnabled = !calendar.enabled;

			CalendarService.patch()
		};

		$scope.remove = function (c) {
			c.loading = true;
			CalendarService.delete(c);
		};

		//We need to reload the refresh the calendar-list,
		//if the user added a subscription
		$rootScope.$on('createdSubscription', function() {
			// TO BE REIMPLEMENTED, BUT IN A DIFFERENT PR
		});


		$rootScope.$on('finishedLoadingEvents', function(event, calendarId) {
			//var calendar = CalendarModel.get(calendarId);
			//calendar.loading = false;
			//CalendarModel.update(calendar);
			//$scope.calendars = CalendarModel.getAll();
		});
	}
]);
