describe('The daysFilter filter', function () {
	'use strict';

	let filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('daysFilter');
		});
		window.n = jasmine.createSpy().and.callFake((n1, n2, n3, n4) => {
			return [n1, n2, n3, n4];
		});
	});

	it ('should call n', () => {
		expect(filter(10)).toEqual(['calendar', 'day', 'days', 10]);
		expect(n).toHaveBeenCalledWith('calendar', 'day', 'days', 10);
	});
});
