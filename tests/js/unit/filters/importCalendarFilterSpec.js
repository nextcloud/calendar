describe('The importCalendarFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('importCalendarFilter');
		});
	});

	it('should be able to handle unexpected parameters', function() {
		expect(filter(null, null)).toEqual([]);
		expect(filter(undefined, null)).toEqual([]);
		expect(filter(null)).toEqual([]);
		expect(filter()).toEqual([]);
		expect(filter(123)).toEqual([]);
		expect(filter('abc')).toEqual([]);
		expect(filter({})).toEqual([]);
	});

	it('should only return calendars which can store the requested data', function() {
		expect(filter([
			{
				id: 1,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: true
				}
			},
			{
				id: 2,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: false
				}
			},
			{
				id: 3,
				components: {
					vevent: false,
					vjournal: true,
					vtodo: false
				}
			}
		], {
			splittedICal: {
				vevents: [{}, {}, {}, {}, {}],
				vjournals: [],
				vtodos: [{}, {}]
			}
		})).toEqual([
			{
				id: 1,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: true
				}
			}
		]);
	});

	it('should be able to handle incomplete data', function() {
		expect(filter([
			{
				id: 1,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: true
				}
			},
			{
				id: 2,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: false
				}
			},
			{
				id: 3,
				components: {
					vevent: false,
					vjournal: true,
					vtodo: false
				}
			}
		], {
			splittedICal: {
				vevents: [{}, {}, {}],
				vjournals: [],
				vtodos: []
			}
		})).toEqual([
			{
				id: 1,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: true
				}
			},
			{
				id: 2,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: false
				}
			}
		]);
	});
});
