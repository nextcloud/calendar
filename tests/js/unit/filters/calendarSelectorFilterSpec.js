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
		var writable1 = () => true,
			writable4 = () => true;
		expect(filter([
			{
				id: 1,
				isWritable: writable1
			},
			{
				id: 2,
				isWritable: () => false
			},
			{
				id: 3,
				isWritable: () => false
			},
			{
				id: 4,
				isWritable: writable4
			}
		])).toEqual([
			{
				id: 1,
				isWritable: writable1
			},
			{
				id: 4,
				isWritable: writable4
			}
		]);
	});

	it('should add the calendar to calendars if it ain\'t in there yet', function() {
		var writable2 = () => true,
			writable42 = () => true;
		var calendar = {
			id: 42,
			isWritable: writable42
		};

		expect(filter([
			{
				id: 1,
				isWritable: () => false
			},
			{
				id: 2,
				isWritable: writable2
			}
		], calendar)).toEqual([
			{
				id: 2,
				isWritable: writable2
			},
			{
				id: 42,
				isWritable: writable42
			}
		]);
	});

	it('should not add the calendars if it\'s already in there', function() {
		var writable2 = () => true,
			writable42 = () => true;
		var calendar = {
			id: 42,
			isWritable: writable42
		};

		expect(filter([
			{
				id: 1,
				isWritable: () => false
			},
			calendar,
			{
				id: 2,
				isWritable: writable2
			}
		], calendar)).toEqual([
			{
				id: 42,
				isWritable: writable42
			},
			{
				id: 2,
				isWritable: writable2
			}
		]);
	});

	it('should only return the calendar if it\'s readonly', function() {
		var notWritable = () => false;
		var calendar = {
			id: 42,
			isWritable: notWritable
		};

		expect(filter([
			{
				id: 1,
				isWritable: () => false
			},
			calendar,
			{
				id: 2,
				isWritable: () => true
			}
		], calendar)).toEqual([
			{
				id: 42,
				isWritable: notWritable
			}
		]);
	});
});
