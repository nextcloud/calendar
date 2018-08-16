/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

/**
* Controller: Date Picker Controller
* Description: Takes care for pushing dates from app navigation date picker and fullcalendar.
*/
app.controller('DatePickerController', ['$scope', 'fc', 'uibDatepickerConfig', 'constants',
	function ($scope, fc, uibDatepickerConfig, constants) {
		'use strict';

		function getDayClass(data) {
			if (moment(data.date).isSame(new Date(), 'day')) {
				return 'highlight-today';
			}

			if (data.date.getDay() === 0 || data.date.getDay() === 6) {
				return 'highlight-weekend';
			}

			return '';
		}

		$scope.datepickerOptions = {
			formatDay: 'd',
			customClass: getDayClass
		};

		$scope.dt = new Date();
		$scope.visibility = false;

		$scope.selectedView = constants.initialView;

		angular.extend(uibDatepickerConfig, {
			showWeeks: false,
			startingDay: parseInt(moment().startOf('week').format('d'))
		});

		$scope.today = function () {
			$scope.dt = new Date();
		};

		function changeView(index) {
			switch($scope.selectedView) {
				case 'agendaDay':
					return moment($scope.dt)
						.add(index, 'day')
						.toDate();

				case 'agendaWeek':
					return moment($scope.dt)
						.add(index, 'week')
						.startOf('week')
						.toDate();

				case 'month':
					return moment($scope.dt)
						.add(index, 'month')
						.startOf('month')
						.toDate();
			}
		}

		$scope.prev = function() {
			$scope.dt = changeView(-1);
		};

		$scope.next = function() {
			$scope.dt = changeView(1);
		};

		$scope.toggle = function() {
			$scope.visibility = !$scope.visibility;
		};

		$scope.$watch('dt', function(newValue) {
			if (fc) {
				fc.elm.fullCalendar(
					'gotoDate',
					newValue
				);
			}
		});

		$scope.$watch('selectedView', function(newValue) {
			if (fc) {
				fc.elm.fullCalendar(
					'changeView',
					newValue);
			}
		});
	}
]);
