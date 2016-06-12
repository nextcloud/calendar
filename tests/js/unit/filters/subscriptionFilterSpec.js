describe('The subscriptionFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('subscriptionFilter');
		});
	});

	it('should be able to handle null', function () {
		expect(filter(null)).toEqual([]);
	});

	it('should be able to handle undefined', function () {
		expect(filter()).toEqual([]);
	});

	it('should be able to handle an object', function () {
		expect(filter({})).toEqual([]);
	});

	it('should be able to handle non-objects inside the array', function() {
		expect(filter([
			123,
			456,
			{
				id: 55,
				writable: true
			}
		])).toEqual([]);
	});

	it('should only return writable calendars', function() {
		expect(filter([
			{
				id: 60,
				writable: false
			},
			{
				id: 55,
				writable: true
			}
		])).toEqual([{
			id: 60,
			writable: false
		}]);
	});

});