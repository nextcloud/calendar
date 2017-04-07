describe('The monthsFilter filter', function () {
	'use strict';

	let filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('monthsFilter');
		});
		window.n = jasmine.createSpy().and.callFake((n1, n2, n3, n4) => {
			return [n1, n2, n3, n4];
		});
	});

	it ('should call n', () => {
		expect(filter(10)).toEqual(['calendar', 'month', 'months', 10]);
		expect(n).toHaveBeenCalledWith('calendar', 'month', 'months', 10);
	});
});
