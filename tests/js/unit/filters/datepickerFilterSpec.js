describe('The datepickerFilter filter', function () {
	'use strict';

	var filter, dt;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('datepickerFilter');
			dt = new Date('2016-12-17');
			spyOn(window, 't').and.callThrough();
		});
	});

	it('should not fail with unexpected parameters', function() {
		expect(filter(null, null)).toEqual('');
		expect(filter(undefined, null)).toEqual('');
		expect(filter(null)).toEqual('');
		expect(filter()).toEqual('');
		expect(filter(123, 'agendaDay')).toEqual('');
		expect(filter(new Date(), 123)).toEqual('');
	});

 	it('should display for view agendaDay correctly', function() {
		expect(filter(dt, 'agendaDay')).toEqual('Dec 17, 2016');
	});

	it('should display for view agendaWeek correctly', function() {
		expect(filter(dt, 'agendaWeek')).toEqual('Week {number} of {year}');
		expect(t).toHaveBeenCalledWith('calendar', 'Week {number} of {year}', { number: 51, year: 2016 });
	});

	it('should display for view month correctly', function() {
		expect(filter(dt, 'month')).toEqual('December 2016');
	});

	it('should return an empty string for unknown views', function() {
		expect(filter(dt, 'foobar')).toEqual('');
	});
});
