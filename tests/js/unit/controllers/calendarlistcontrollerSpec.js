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

describe('CalendarListController', function() {
	'use strict';

	var controller, scope, model, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, $rootScope, $httpBackend,
		CalendarModel) {
			http = $httpBackend;
			scope = $rootScope.$new();
			model = CalendarModel;
			controller = $controller;
		}
	));

	it ('should create a calendar', function() {

		controller = controller('CalendarListController', {
			$scope: scope,
			CalendarModel: model
		});

		var calendar = {
			displayname : 'Sample Calendar',
			id: 7
		};

		http.expectPOST('/v1/calendars').respond(calendar);
		scope.create();
		http.flush(1);

		expect(model.get(7).displayname).toBe('Sample Calendar');
	});

	it ('should delete the selected calendar', function () {

		var calendars = [
			{id: 2, title: 'Sample Calendar'},
			{id: 3, title: 'Sample Calendar 2'}
		];

		controller = controller('CalendarListController', {
			$scope: scope,
			CalendarModel: model
		});

		model.create(calendars);

		scope.remove(2);
		http.expectDELETE('/v1/calendars/2').respond(200, {});

		http.flush(1);

		expect(model.getAll().length).toBe(1);
	});

	afterEach(function() {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});
});
