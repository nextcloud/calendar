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

describe('CalendarListController', function() {
	'use strict';

	var controller, $scope, $rootScope, Calendar, CalendarService, $window, calendar, deferred;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, _$rootScope_, _$window_, $q) {
			$scope = _$rootScope_.$new();
			$rootScope = _$rootScope_;
			$window = _$window_;
			controller = $controller;

			CalendarService = {
				getAll: function(){},
				get: function() {},
				create: function() {},
				update: function() {},
				delete: function() {},
				publish: function() {},
				unpublish: function() {}
			};
			Calendar = function() {
				return {
					list: {}
				};
			};

			deferred = $q.defer();
			deferred.resolve(new Calendar());
		}
	));

	it ('should create a calendar', function() {
		spyOn(CalendarService, 'create').and.returnValue(deferred.promise);

		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		$scope.newCalendarInputVal = 'Sample Calendar';
		$scope.newCalendarColorVal = '#ffffff';

		$scope.create($scope.newCalendarInputVal, $scope.newCalendarColorVal);
		expect(CalendarService.create).toHaveBeenCalledWith('Sample Calendar', '#ffffff');

		//make sure values are reset
		expect($scope.newCalendarInputVal).toBe('');
		expect($scope.newCalendarColorVal).toBe('');
	});

	it ('should delete the selected calendar', function () {
		spyOn(CalendarService, 'delete').and.returnValue(deferred.promise);

		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToDelete = {};
		var calendarItem = {
			calendar: calendarToDelete
		};

		$scope.remove(calendarItem);
		expect(CalendarService.delete).toHaveBeenCalledWith(calendarToDelete);
	});

	it ('should publish the selected calendar', function () {
		spyOn(CalendarService, 'publish').and.returnValue(deferred.promise);

		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToPublish = {
			published: true
		};
		var calendarItem = {
			calendar: calendarToPublish
		};

		$scope.togglePublish(calendarItem);
		expect(CalendarService.publish).toHaveBeenCalledWith(calendarToPublish);
	});

	it ('should unpublish the selected calendar', function () {
		spyOn(CalendarService, 'unpublish').and.returnValue(deferred.promise);

		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToUnPublish = {
			published: false
		};
		var calendarItem = {
			calendar: calendarToUnPublish
		};

		$scope.togglePublish(calendarItem);
		expect(CalendarService.unpublish).toHaveBeenCalledWith(calendarToUnPublish);
	});

	afterEach(function() {

	});
});
