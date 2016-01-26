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
 * Controller: Events Dialog Controller
 * Description: Takes care of anything inside the Events Modal.
 */

app.controller('EventsPopoverEditorController', ['$scope', 'TimezoneService', 'eventEditorHelper', '$uibModalInstance', 'fcEvent', 'isNew',
	function($scope, TimezoneService, eventEditorHelper, $uibModalInstance, fcEvent, isNew) {
		'use strict';

		$scope.event = fcEvent.event;
		$scope.properties = fcEvent.event.getSimpleData(fcEvent);
		$scope.isNew = isNew;
		$scope.calendar = isNew ? null : fcEvent.calendar;
		$scope.oldCalendar = isNew ? null : fcEvent.calendar;

		$scope.close = function(action) {
			var moment_start = moment(angular.element('#from').datepicker('getDate'));
			var moment_end = moment(angular.element('#to').datepicker('getDate'));

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';

				moment_end.add(1, 'days');

				$scope.properties.dtstart.time = '00:00:00';
				$scope.properties.dtend.time = '00:00:00';
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';

				var moment_start_time = moment(angular.element('#fromtime').timepicker('getTimeAsDate'));
				var moment_end_time = moment(angular.element('#totime').timepicker('getTimeAsDate'));

				$scope.properties.dtstart.time = moment_start_time.format('HH:mm:ss');
				$scope.properties.dtend.time = moment_end_time.format('HH:mm:ss');

				//TODO - make sure the timezones are loaded!!!!1111OneOneEleven
			}
			$scope.properties.dtstart.date = moment_start.format('YYYY-MM-DD');
			$scope.properties.dtend.date = moment_end.format('YYYY-MM-DD');

			if (action === 'proceed') {
				$uibModalInstance.close({
					action: 'proceed',
					properties: $scope.properties
				});
			} else {
				$scope.event.patch(fcEvent, $scope.properties);

				$uibModalInstance.close({
					action: action,
					event: $scope.event
				});
			}
		};

		$scope.delete = function() {
			$uibModalInstance.dismiss('delete');
		};

		$uibModalInstance.rendered.then(function() {
			// TODO: revaluate current solution:
			// moment.js and the datepicker use different formats to format a date.
			// therefore we have to do some conversion-black-magic to make the moment.js
			// local formats work with the datepicker.
			// THIS HAS TO BE TESTED VERY CAREFULLY
			// WE NEED A SHORT UNIT TEST IDEALLY FOR ALL LANGUAGES SUPPORTED
			// maybe move setting the date format into a try catch block
			var localeData = moment.localeData();
			angular.element('#from').datepicker({
				dateFormat : localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
				monthNames: moment.months(),
				monthNamesShort: moment.monthsShort(),
				dayNames: moment.weekdays(),
				dayNamesMin: moment.weekdaysMin(),
				dayNamesShort: moment.weekdaysShort(),
				firstDay: localeData.firstDayOfWeek(),
				minDate: null
			});
			angular.element('#to').datepicker({
				dateFormat : localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
				monthNames: moment.months(),
				monthNamesShort: moment.monthsShort(),
				dayNames: moment.weekdays(),
				dayNamesMin: moment.weekdaysMin(),
				dayNamesShort: moment.weekdaysShort(),
				firstDay: localeData.firstDayOfWeek(),
				minDate: null
			});

			angular.element('#fromtime').timepicker({
				showPeriodLabels: false,
				showLeadingZero: true,
				showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1)
			});
			angular.element('#totime').timepicker({
				showPeriodLabels: false,
				showLeadingZero: true,
				showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1)
			});

			var moment_start = moment($scope.properties.dtstart.date, 'YYYY-MM-DD');
			var moment_end = moment($scope.properties.dtend.date, 'YYYY-MM-DD');

			var midnight = new Date('2000-01-01 00:00');
			if ($scope.properties.dtstart.type === 'date') {
				angular.element('#fromtime').timepicker('setTime', midnight);
			} else {
				var fromTime = new Date('2000-01-01 ' + $scope.properties.dtstart.time);
				angular.element('#fromtime').timepicker('setTime', fromTime);
			}

			if ($scope.properties.dtend.type === 'date') {
				moment_end.subtract(1, 'days');
				angular.element('#totime').timepicker('setTime', midnight);
			} else {
				var toTime = new Date('2000-01-01 ' + $scope.properties.dtend.time);
				angular.element('#totime').timepicker('setTime', toTime);
			}

			angular.element('#from').datepicker('setDate', moment_start.toDate());
			angular.element('#to').datepicker('setDate', moment_end.toDate());
		});
	}
]);