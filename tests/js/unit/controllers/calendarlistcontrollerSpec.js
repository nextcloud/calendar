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

	var controller, $scope, $rootScope, Calendar, CalendarService, ColorUtility, $window, calendar, deferred;

	beforeEach(module('Calendar', function($provide) {
		$provide.value('Calendar', {});
		$provide.value('CalendarListItem', {});
		$provide.value('WebCalService', {});
		$provide.value('isSharingAPI', true);
		$provide.value('constants', {});
	}));

	beforeEach(inject(function ($controller, _$rootScope_, _$window_, $q) {
			$scope = _$rootScope_.$new();
			$rootScope = _$rootScope_;
			$window = _$window_;
			controller = $controller;

			CalendarService = {
				getAll: function(){},
				get: function() {},
				create: function() {}
			};
			Calendar = function() {
				return {
					list: {},
					update: jasmine.createSpy(),
					delete: jasmine.createSpy(),
					publish: jasmine.createSpy(),
					unpublish: jasmine.createSpy()
				};
			};
			ColorUtility = {
				randomColor: () => {}
			};

			deferred = $q.defer();
			deferred.resolve(new Calendar());
		}
	));

	it ('should create a calendar', function() {
		spyOn(CalendarService, 'create').and.returnValue(deferred.promise);
		spyOn(ColorUtility, 'randomColor').and.returnValue('#ffffff');

		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService,
			ColorUtility: ColorUtility
		});

		$scope.newCalendarInputVal = 'Sample Calendar';

		$scope.create($scope.newCalendarInputVal);
		expect(CalendarService.create).toHaveBeenCalledWith('Sample Calendar', '#ffffff');
	});

	it ('should delete the selected calendar', function () {
		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToDelete = {
			delete: jasmine.createSpy().and.returnValue(deferred.promise),
		};
		var calendarItem = {
			calendar: calendarToDelete
		};

		$scope.remove(calendarItem);
		expect(calendarToDelete.delete).toHaveBeenCalledWith();
	});

	it ('should publish the selected calendar', function () {
		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToPublish = {
			publish: jasmine.createSpy().and.returnValue(deferred.promise),
			published: true
		};
		var calendarItem = {
			calendar: calendarToPublish
		};

		$scope.togglePublish(calendarItem);
		expect(calendarToPublish.publish).toHaveBeenCalledWith();
	});

	it ('should unpublish the selected calendar', function () {
		controller = controller('CalendarListController', {
			$scope: $scope,
			CalendarService: CalendarService
		});

		var calendarToUnPublish = {
			unpublish: jasmine.createSpy().and.returnValue(deferred.promise),
			published: false
		};
		var calendarItem = {
			calendar: calendarToUnPublish
		};

		$scope.togglePublish(calendarItem);
		expect(calendarToUnPublish.unpublish).toHaveBeenCalledWith();
	});

	afterEach(function() {

	});
});
