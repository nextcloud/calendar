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

describe('EventsModel', function() {
	'use strict';

	var scope, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, $rootScope,
		$httpBackend) {
			http = $httpBackend;
			scope = $rootScope.$new();
		}
	));

	it ('should be empty', inject(function (EventsModel) {
		expect(EventsModel.getAll().length).toBe(0);
	}));

	it('should get all the events', inject(function () {
	}));

	it('should create an event', inject(function () {
	}));

	it('should add all the events', inject(function () {
	}));

	it('should delete an event', inject(function () {
	}));

	it('should add an attendee to the event', inject(function () {

	}));

	it('should drag and drop the event from one position to another', inject(function () {

	}));

	it('should resize the duration of the event', inject(function () {

	}));

	it('should add all display figures', inject(function () {

	}));

	afterEach(function () {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});
});
