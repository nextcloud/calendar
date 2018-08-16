describe('The attendeeNotOrganizerFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('attendeeNotOrganizerFilter');
		});
	});

	it('should be able to handle null', function () {
		expect(filter(null, null)).toEqual([]);

	});

	it('should be able to handle combinations of null and undefined', function () {
		expect(filter(undefined, null)).toEqual([]);
		expect(filter(null, undefined)).toEqual([]);

	});

	it('should be able to handle undefined', function () {
		expect(filter()).toEqual([]);
	});

	it('should be able to handle empty array', function () {
		expect(filter([])).toEqual([]);
	});

	it('should only accept strings as organizer', function() {
		expect(filter([{
			parameters: {
				cn: 'Jon Doe'
			},
			value: 'MAILTO:4'
		}], 4)).toEqual([{
			parameters: {
				cn: 'Jon Doe'
			},
			value: 'MAILTO:4'
		}]);
	});

	it('should only accept an array as attendees', function() {
		expect(filter('abc', '4')).toEqual([]);
		expect(filter(42, '4')).toEqual([]);
		expect(filter({}, '4')).toEqual([]);
	});

	it('should remove the organizer from the array', function() {
		expect(filter([{
			parameters: {
				cn: 'Jon Doe'
			},
			value: 'MAILTO:5'
		},{
			parameters: {
				cn: 'Jon Doe 2'
			},
			value: 'MAILTO:4'
		}], '5')).toEqual([{
			parameters: {
				cn: 'Jon Doe 2'
			},
			value: 'MAILTO:4'
		}]);
	});
});
