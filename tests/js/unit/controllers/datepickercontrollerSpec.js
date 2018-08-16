/**
 * Calendar App
 *
 * @author Thomas Bille
 * @copyright 2017 Thomas Bille <contact@tbille.fr>
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

describe('DatePickerController', function() {
	'use strict';

	var controller, $scope, fc, uibDatepickerConfig, constants;

	beforeEach(module('Calendar', function($provide) {
		$provide.value('fc', {});
		$provide.value('uibDatepickerConfig', {});
		$provide.value('constants', {});
	}));

	beforeEach(inject(function ($controller, _$rootScope_) {
			$scope = _$rootScope_.$new();
			fc = {
				elm : {
					fullCalendar: jasmine.createSpy()
				}
			};
			uibDatepickerConfig = {};
			constants = {
				initialView: 'initialView'
			};
			controller = $controller('DatePickerController', {
				$scope: $scope,
				uibDatepickerConfig: uibDatepickerConfig,
				fc: fc,
				constants: constants
			});

		}
	));

	it ('should initiate the controller with the right values', function() {
		var today = new Date();
		expect($scope.dt.getFullYear()).toBe(today.getFullYear());
		expect($scope.dt.getMonth()).toBe(today.getMonth());
		expect($scope.dt.getDate()).toBe(today.getDate());

		expect($scope.visibility).toBe(false);
		expect($scope.selectedView).toBe(constants.initialView);

		expect(uibDatepickerConfig.showWeeks).toBe(false);
		expect(uibDatepickerConfig.startingDay).toBe(0);

	});

	it ('should set the date dt to today', function () {
		var today = new Date();
		$scope.dt = new Date(1970, 5, 19);

		$scope.today();

		expect($scope.dt.getFullYear()).toBe(today.getFullYear());
		expect($scope.dt.getMonth()).toBe(today.getMonth());
		expect($scope.dt.getDate()).toBe(today.getDate());
	});

	it ('should set $scope.visibility to true', function () {
		$scope.visibility = false;
		$scope.toggle();

		expect($scope.visibility).toBe(true);
	});

	it ('should set $scope.visibility to false', function () {
		$scope.visibility = true;
		$scope.toggle();

		expect($scope.visibility).toBe(false);
	});

	it ('should call fullcalendar on dt modification', function() {
		$scope.dt = new Date(1970, 5, 19);
		$scope.$digest();

		expect(fc.elm.fullCalendar).toHaveBeenCalledWith('gotoDate', $scope.dt);
	});

	it ('should call fullcalendar on dt modification', function() {
		$scope.selectedView = 'newView';
		$scope.$digest();

		expect(fc.elm.fullCalendar).toHaveBeenCalledWith('changeView', $scope.selectedView);
	});

	it ('should add a day to dt', function() {
		$scope.selectedView = 'agendaDay';
		$scope.dt = new Date(1970, 4, 19);
		var expectedDate = new Date(1970, 4, 20);

		$scope.next();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should add a week to dt and focus on the first day of the week', function() {
		$scope.selectedView = 'agendaWeek';
		$scope.dt = new Date(2017, 6, 4);
		var expectedDate = new Date(2017, 6, 9);

		$scope.next();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should add a month to dt and focus on the first day of the month', function() {
		$scope.selectedView = 'month';
		$scope.dt = new Date(2017, 6, 4);
		var expectedDate = new Date(2017, 7, 1);

		$scope.next();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should remove a day to dt', function() {
		$scope.selectedView = 'agendaDay';
		$scope.dt = new Date(1970, 4, 19);
		var expectedDate = new Date(1970, 4, 18);

		$scope.prev();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should remove a week to dt and focus on the first day of the week', function() {
		$scope.selectedView = 'agendaWeek';
		$scope.dt = new Date(2017, 6, 4);
		var expectedDate = new Date(2017, 5, 25);

		$scope.prev();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should remove a month to dt and focus on the first day of the month', function() {
		$scope.selectedView = 'month';
		$scope.dt = new Date(2017, 6, 4);
		var expectedDate = new Date(2017, 5, 1);

		$scope.prev();

		expect($scope.dt.getFullYear()).toBe(expectedDate.getFullYear());
		expect($scope.dt.getMonth()).toBe(expectedDate.getMonth());
		expect($scope.dt.getDate()).toBe(expectedDate.getDate());
	});

	it ('should return highlight-today if the day is today date', function() {
		var data = {
			date: new Date()
		};

		expect($scope.datepickerOptions.customClass(data)).toBe('highlight-today');
	});

	it ('should return highlight-weekend if the day is weekendDay', function() {
		var data = {
			date: new Date(2017, 6, 9)
		};

		expect($scope.datepickerOptions.customClass(data)).toBe('highlight-weekend');
	});

	it ('should return an empty string if the day is not today\'s date', function() {
		var data = {
			date: new Date(1970, 4, 18)
		};

		expect($scope.datepickerOptions.customClass(data)).toBe('');
	});
});
