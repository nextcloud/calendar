describe('The calendarSelectorFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('calendarSelectorFilter');
		});
	});

	it('should be able to handle null', function () {
		expect(filter(null, null)).toEqual([]);
	});

	it('should be able to handle combinations of null and undefined', function () {
		expect(filter(undefined, null)).toEqual([]);
		expect(filter(null)).toEqual([]);
	});

	it('should be able to handle undefined', function () {
		expect(filter()).toEqual([]);
	});

	it('should be able to handle empty array', function () {
		expect(filter([])).toEqual([]);
	});

	it('should return only writable calendars', function() {
		expect(filter([
			{
				id: 1,
				writable: true
			},
			{
				id: 2
			},
			{
				id: 3,
				writable: false
			},
			{
				id: 4,
				writable: true
			}
		])).toEqual([
			{
				id: 1,
				writable: true
			},
			{
				id: 4,
				writable: true
			}
		]);
	});

	it('should add the calendar to calendars if it ain\'t in there yet', function() {
		var calendar = {
			id: 42,
			writable: true
		};

		expect(filter([
			{
				id: 1,
				writable: false
			},
			{
				id: 2,
				writable: true
			}
		], calendar)).toEqual([
			{
				id: 2,
				writable: true
			},
			{
				id: 42,
				writable: true
			}
		]);
	});

	it('should not add the calendars if it\'s already in there', function() {
		var calendar = {
			id: 42,
			writable: true
		};

		expect(filter([
			{
				id: 1,
				writable: false
			},
			calendar,
			{
				id: 2,
				writable: true
			}
		], calendar)).toEqual([
			{
				id: 42,
				writable: true
			},
			{
				id: 2,
				writable: true
			}
		]);
	});

	it('should only return the calendar if it\'s readonly', function() {
		var calendar = {
			id: 42,
			writable: false
		};

		expect(filter([
			{
				id: 1,
				writable: false
			},
			calendar,
			{
				id: 2,
				writable: true
			}
		], calendar)).toEqual([
			{
				id: 42,
				writable: false
			}
		]);
	});
});
