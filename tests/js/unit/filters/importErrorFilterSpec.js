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
		expect(filter({progressToReach: 20, errors: 0, duplicates: 0})).toEqual('Successfully imported {imported} objects');
		expect(t).toHaveBeenCalledWith('calendar', 'Successfully imported {imported} objects', {imported: 20});
	});

	it('should be able to display one duplicate', function() {
		expect(filter({progressToReach: 20, errors: 1, duplicates: 1})).toEqual('Imported {imported} out of {all}, skipped one duplicate');
		expect(t).toHaveBeenCalledWith('calendar', 'Imported {imported} out of {all}, skipped one duplicate', {all: 20, imported: 19});
	});

	it('should be able to handle one error', function() {
		expect(filter({progressToReach: 20, errors: 1, duplicates: 0})).toEqual('Imported {imported} out of {all}, one failure');
		expect(t).toHaveBeenCalledWith('calendar', 'Imported {imported} out of {all}, one failure', {all: 20, imported: 19});
	});

	it('should be able to handle two or more duplicates', function() {
		expect(filter({progressToReach: 20, errors: 2, duplicates: 2})).toEqual('Imported {imported} out of {all}, skipped {duplicates} duplicates');
		expect(t).toHaveBeenCalledWith('calendar', 'Imported {imported} out of {all}, skipped {duplicates} duplicates', {all: 20, imported: 18, duplicates: 2});
	});

	it('should be able to handle two or more errors', function() {
		expect(filter({progressToReach: 20, errors: 2, duplicates: 0})).toEqual('Imported {imported} out of {all}, {errors} failures');
		expect(t).toHaveBeenCalledWith('calendar', 'Imported {imported} out of {all}, {errors} failures', {all: 20, imported: 18, errors: 2});
	});

	it('shoud be able to handle mixed errors and duplicates', function() {
		expect(filter({progressToReach: 20, errors: 5, duplicates: 3})).toEqual('Imported {imported} out of {all}, {errors} failures, skipped {duplicates} duplicates');
		expect(t).toHaveBeenCalledWith('calendar', 'Imported {imported} out of {all}, {errors} failures, skipped {duplicates} duplicates', {all: 20, imported: 15, errors: 2, duplicates: 3});

	});
});
