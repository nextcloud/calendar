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

		$scope.newCalendarInputVal = '';
		$scope.newCalendarColorVal = '';

		$scope.create = function (name, color) {
			CalendarService.create(name, color).then(function(calendar) {
				$scope.calendars.push(calendar);
				$scope.$apply();
			});

			$scope.newCalendarInputVal = '';
			$scope.newCalendarColorVal = '';
		};

		$scope.download = function (calendar) {
			var url = calendar.url;
			// cut off last slash to have a fancy name for the ics
			if (url.slice(url.length - 1) === '/') {
				url = url.slice(0, url.length - 1);
			}
			url += '?export';

			$window.open(url);
		};

		$scope.prepareUpdate = function (calendar) {
			calendar.prepareUpdate();
		};

		$scope.cancelUpdate = function (calendar) {
			calendar.resetToPreviousState();
		};

		$scope.performUpdate = function (calendar) {
			CalendarService.update(calendar).then(function() {
				calendar.list.edit = false;
				$scope.$apply();
			});
		};

		$scope.triggerEnable = function(calendar) {
			calendar.list.loading = true;
			calendar.enabled = !calendar.enabled;

			CalendarService.update(calendar).then(function() {
				$rootScope.$broadcast('updatedCalendarsVisibility', calendar);
			});
		};

		$scope.remove = function (calendar) {
			calendar.list.loading = true;
			CalendarService.delete(calendar).then(function() {
				$scope.calendars = $scope.calendars.filter(function (element) {
					return element.url !== calendar.url;
				});
				$scope.$apply();
			});
		};

		//We need to reload the refresh the calendar-list,
		//if the user added a subscription
		$rootScope.$on('createdSubscription', function() {
			// TO BE REIMPLEMENTED, BUT IN A DIFFERENT PR
		});


		$rootScope.$on('finishedLoadingEvents', function(event, calendarId) {
			//var calendar = CalendarModel.get(calendarId);
			//calendar.list.loading = false;
			//CalendarModel.update(calendar);
			//$scope.calendars = CalendarModel.getAll();
		});
	}
]);
