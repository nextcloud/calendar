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

describe('CalendarModel', function() {
	'use strict';

	var controller, scope, model, routeParams, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, $rootScope, $httpBackend, 
		CalendarModel) {
			http = $httpBackend;
			scope = $rootScope.$new();
		}
	));

	it ('should be empty', inject(function (CalendarModel) {
		expect(CalendarModel.getAll().length).toBe(0);
	}));

	it('should create a calendar', inject(function (CalendarModel) {
		CalendarModel.create({id: 6, displayname: 'Sample Calendar'});
		expect(CalendarModel.getAll().length).toBe(1);
		expect(CalendarModel.getAll()[0].displayname).toBe('Sample Calendar');
		expect(CalendarModel.get(6).displayname).toBe('Sample Calendar');
	}));

	it('should delete a calendar', inject(function (CalendarModel) {
		CalendarModel.create({id: 6, displayname: 'Sample Calendar 6'});
        CalendarModel.remove(6);
        expect(CalendarModel.getAll().length).toBe(0);
	}));

	afterEach(function () {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});
});