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

describe('SubscriptionController', function() {

	var controller, scope, model, routeParams, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, $rootScope, $httpBackend,
		SubscriptionModel) {
			http = $httpBackend;
			scope = $rootScope.$new();
			model = SubscriptionModel;
			controller = $controller;
		}
	));

	it ('should delete the selected subscription', function () {
		var calendars = [
			{id: 7, title: 'Sample Subscription'}
		];

		http.expectGET('/v1/calendars').respond(200, calendars);

		controller = controller('CalendarListController', {
			$scope: scope,
			SubscriptionModel: model
		});

		http.flush(1);

		http.expectDELETE('/v1/calendars/7').respond(200, {});
		scope.delete(7);
		http.flush(1);

		expect(model.get(7)).not.toBeDefined();
	});

	afterEach(function() {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});
});