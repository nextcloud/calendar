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

app.controller('EventsPopoverEditorController', ['$scope', 'TimezoneService', 'eventEditorHelper', '$uibModalInstance', 'vevent', 'recurrenceId', 'isNew',
	function($scope, TimezoneService, eventEditorHelper, $uibModalInstance, vevent, recurrenceId, isNew) {
		'use strict';

		$scope.properties = vevent.getSimpleData(recurrenceId);
		$scope.isNew = isNew;
		$scope.calendar = isNew ? null : vevent.calendar;
		$scope.oldCalendar = isNew ? null : vevent.calendar;

		console.log($scope.properties);

		$scope.close = function(action) {
			console.log(angular.element('#from').datepicker('getDate'));
			console.log(moment(angular.element('#from').datepicker('getDate')));

			$scope.properties.dtstart.value = moment(angular.element('#from').datepicker('getDate'));
			$scope.properties.dtend.value = moment(angular.element('#to').datepicker('getDate'));

			if ($scope.properties.allDay) {
				$scope.properties.dtstart.type = 'date';
				$scope.properties.dtend.type = 'date';
				$scope.properties.dtend.value.add(1, 'days');
			} else {
				$scope.properties.dtstart.type = 'date-time';
				$scope.properties.dtend.type = 'date-time';

				console.log(angular.element('#fromtime').timepicker('getHour'));
				console.log(angular.element('#fromtime').timepicker('getMinute'));

				$scope.properties.dtstart.value.hours(angular.element('#fromtime').timepicker('getHour'));
				$scope.properties.dtstart.value.minutes(angular.element('#fromtime').timepicker('getMinute'));
				$scope.properties.dtstart.value.seconds(0);

				$scope.properties.dtend.value.hours(angular.element('#totime').timepicker('getHour'));
				$scope.properties.dtend.value.minutes(angular.element('#totime').timepicker('getMinute'));
				$scope.properties.dtend.value.seconds(0);
			}

			if (action === 'proceed') {
				$uibModalInstance.close({
					action: 'proceed',
					properties: $scope.properties
				});
			} else {
				vevent.patch(recurrenceId, $scope.properties);

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

			var midnight = new Date('2000-01-01 00:00');
			if ($scope.properties.dtstart.type === 'date') {
				angular.element('#fromtime').timepicker('setTime', midnight);
			} else {
				var fromTime = $scope.properties.dtstart.value.toDate();
				angular.element('#fromtime').timepicker('setTime', fromTime);
			}

			if ($scope.properties.dtend.type === 'date') {
				$scope.properties.dtend.value.subtract(1, 'days');
				angular.element('#totime').timepicker('setTime', midnight);
			} else {
				var toTime = $scope.properties.dtend.value.toDate();
				angular.element('#totime').timepicker('setTime', toTime);
			}

			angular.element('#from').datepicker('setDate', $scope.properties.dtstart.value.toDate());
			angular.element('#to').datepicker('setDate', $scope.properties.dtend.value.toDate());
		});
	}
]);