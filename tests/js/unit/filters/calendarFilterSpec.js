describe('The attendeeNotOrganizerFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('calendarFilter');
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
		var writable55 = () => true;
		expect(filter([
			123,
			456,
			{
				id: 55,
				isWritable: writable55
			}
		])).toEqual([{
			id: 55,
			isWritable: writable55
		}]);
	});

	it('should only return writable calendars', function() {
		var writable55 = () => true;
		expect(filter([
			{
				id: 60,
				isWritable: () => false
			},
			{
				id: 55,
				isWritable: writable55
			}
		])).toEqual([{
			id: 55,
			isWritable: writable55
		}]);
	});

});