describe('The timezoneWithoutContinentFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('timezoneWithoutContinentFilter');
		});
	});

	it('should add a dot to St. Kitts', function () {
		expect(filter('St Kitts')).toEqual('St. Kitts');
	});

	it('should not add whitespaces to Port-au-Prince', function (){
		expect(filter('Port-Au-Prince')).toEqual('Port-Au-Prince');
	});

	it('should replace all underscores', function (){
		expect(filter('Dar_es_Salaam')).toEqual('Dar es Salaam');
	});
});

