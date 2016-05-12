describe('The timezoneFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('timezoneFilter');
		});
	});

	it('should not fail with unexpected parameters', function () {
		expect(filter(null)).toEqual('');
		expect(filter()).toEqual('');
		expect(filter(4)).toEqual('');
		expect(filter([])).toEqual('');
		expect(filter({})).toEqual('');
	});

	it('should remove underscores', function() {
		expect(filter('Berlin_')).toEqual('Berlin ');
	});

	it('should append the continent after the city\'s name', function() {
		expect(filter('Europe/Berlin')).toEqual('Berlin (Europe)');
	});
});
