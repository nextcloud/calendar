/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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
app.directive('ocdatetimepicker', function($compile, $timeout) {
	'use strict';

	return {
		restrict: 'E',
		require: 'ngModel',
		scope: {
			disabletime: '=disabletime'
		},
		link: function (scope, element, attrs, ngModelCtrl) {
			var templateHTML = '<input type="text" ng-model="date" class="events--date" />';
			templateHTML += '<input type="text" ng-model="time" class="events--time" ng-disabled="disabletime"/>';
			var template = angular.element(templateHTML);

			scope.date = null;
			scope.time = null;
			scope.ignoreWatch = false;

			$compile(template)(scope);
			element.append(template);

			var localeData = moment.localeData();
			function initDatePicker() {
				element.find('.events--date').datepicker({
					dateFormat: localeData.longDateFormat('L').toLowerCase().replace('yy', 'y').replace('yyy', 'yy'),
					monthNames: moment.months(),
					monthNamesShort: moment.monthsShort(),
					dayNames: moment.weekdays(),
					dayNamesMin: moment.weekdaysMin(),
					dayNamesShort: moment.weekdaysShort(),
					firstDay: localeData.firstDayOfWeek(),
					minDate: null,
					showOtherMonths: true,
					selectOtherMonths: true
				});
			}
			function initTimepicker() {
				element.find('.events--time').timepicker({
					showPeriodLabels: false,
					showLeadingZero: true,
					showPeriod: (localeData.longDateFormat('LT').toLowerCase().indexOf('a') !== -1),
					duration: 0
				});
			}

			initDatePicker();
			initTimepicker();

			scope.$watch(function() {
				return ngModelCtrl.$modelValue;
			}, function(value) {
				if (moment.isMoment(value)) {
					scope.ignoreWatch = true;

					element.find('.events--date').datepicker('setDate', value.toDate());
					element.find('.events--time').timepicker('setTime', value.toDate());

					$timeout(function() {
						scope.ignoreWatch = false;
					}, 100);
				}
			});

			scope.$watch('date + time', function() {
				if (!scope.ignoreWatch) {
					var date = element.find('.events--date').datepicker('getDate'),
						hours = 0,
						minutes = 0;

					if (!scope.disabletime) {
						hours = element.find('.events--time').timepicker('getHour');
						minutes = element.find('.events--time').timepicker('getMinute');
					}

					var m = moment(date);
					m.hours(hours);
					m.minutes(minutes);
					m.seconds(0);

					//Hiding the timepicker is an ugly hack to mitigate a bug in the timepicker
					//We might want to consider using another timepicker in the future
					element.find('.events--time').timepicker('hide');
					ngModelCtrl.$setViewValue(m);
				}
			});

			element.on('$destroy', function() {
				element.find('.events--date').datepicker('destroy');
				element.find('.events--time').timepicker('destroy');
			});
		}
	};
});