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

describe('SubscriptionModel', function() {
	'use strict';

	var controller, scope, model, routeParams, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function ($controller, $rootScope, $httpBackend, 
		CalendarModel) {
			http = $httpBackend;
			scope = $rootScope.$new();
		}
	));

	it ('should be empty', inject(function (SubscriptionModel) {
		expect(SubscriptionModel.getAll().length).toBe(0);
	}));

	it('should get all the subscriptions', inject(function (SubscriptionModel) {
		SubscriptionModel.create({type: "org.ownCloud.webcal", url: "https://url.tld/file.ics"});
		SubscriptionModel.create({type: "org.ownCloud.webcal", url: "https://url.tld/file2.ics"});
		
		expect(SubscriptionModel.getAll().length).toBe(2);
	}));	

	it('should create a subscription', inject(function (SubscriptionModel) {
		SubscriptionModel.create({type: "org.ownCloud.webcal", url: "https://url.tld/file.ics"});

		expect(SubscriptionModel.getAll().length).toBe(1);
		expect(SubscriptionModel.getAll()[0].url).toBe('https://url.tld/file.ics');
	}));

	it('should get the Subscription Names', inject(function (SubscriptionModel) {
		var samplebackend = [{
			id : "org.ownCloud.local",
			subscriptions : [
				{
					name : "Sample Subscription",
					type : "org.ownCloud.local"
				}
			]
		}];

		expect(SubscriptionModel.getSubscriptionNames(samplebackend)[0].name).toBe('Sample Subscription');
	}));

	afterEach(function () {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});
});
