describe('The importErrorFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('importErrorFilter');
			spyOn(window, 't').and.callThrough();
		});
	});

	it('should not fail with unexpected parameters', function () {
		expect(filter(null)).toEqual('');
		expect(filter()).toEqual('');
		expect(filter({})).toEqual('');
	});

	it('should be able to handle zero errors', function() {
		expect(filter({errors: 0})).toEqual('Successfully imported');
		expect(t).toHaveBeenCalledWith('calendar', 'Successfully imported');
	});

	it('should be able to handle one error', function() {
		expect(filter({errors: 1})).toEqual('Partially imported, 1 failure');
		expect(t).toHaveBeenCalledWith('calendar', 'Partially imported, 1 failure');
	});

	it('should be able to handle two or more errors', function() {
		expect(filter({errors: 2})).toEqual('Partially imported, {n} failures');
		expect(t).toHaveBeenCalledWith('calendar', 'Partially imported, {n} failures', {n:2});

		expect(filter({errors: 42})).toEqual('Partially imported, {n} failures');
		expect(t).toHaveBeenCalledWith('calendar', 'Partially imported, {n} failures', {n:42});
	});
});
