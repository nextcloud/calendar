describe('The simpleReminderDescription filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('simpleReminderDescription');
			spyOn(window, 't').and.callThrough();
		});
	});

	it('should not fail with unexpected parameters', function() {
		expect(filter(null)).toEqual('');
		expect(filter()).toEqual('');
		expect(filter({})).toEqual('');
	});

	it('should display audio alarms correctly', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'Audio alarm', time: '15 minutes' });
	});

	it('should display email alarms correctly', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'EMAIL'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'Email', time: '15 minutes' });
	});

	it('should display popup alarms correctly', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'DISPLAY'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'Pop-up', time: '15 minutes' });
	});

	it('should display none alarms correctly', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'NONE'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'None', time: '15 minutes' });
	});

	it('should display unknown alarms with it\'s identifier', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'foobar'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'foobar', time: '15 minutes' });
	});

	it('should display alarms correctly (relative before start)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event starts', { type: 'Audio alarm', time: '15 minutes' });
	});

	it('should display alarms correctly (relative before end)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'end',
				type: 'duration',
				value: -900
			}
		})).toEqual('{type} {time} before the event ends');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} before the event ends', { type: 'Audio alarm', time: '15 minutes' });
	});

	it('should display alarms correctly (relative at start)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: 0
			}
		})).toEqual('{type} at the event\'s start');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} at the event\'s start', { type: 'Audio alarm'});
	});

	it('should display alarms correctly (relative at end)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'end',
				type: 'duration',
				value: 0
			}
		})).toEqual('{type} at the event\'s end');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} at the event\'s end', { type: 'Audio alarm'});
	});

	it('should display alarms correctly (relative after start)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'duration',
				value: 900
			}
		})).toEqual('{type} {time} after the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} after the event starts', { type: 'Audio alarm', time: '15 minutes' });
	});

	it('should display alarms correctly (relative after end)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'end',
				type: 'duration',
				value: 900
			}
		})).toEqual('{type} {time} after the event ends');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} {time} after the event ends', { type: 'Audio alarm', time: '15 minutes' });
	});

	it('should display alarms correctly (absolute)', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			editor: {
				absMoment: moment('2013-02-08 09:30')
			},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'date-time',
				value: moment('2013-02-08 09:30')
			}
		})).toEqual('{type} at {time}');
		expect(t).toHaveBeenCalledWith( 'calendar', '{type} at {time}', { type: 'Audio alarm', time: 'Friday, February 8, 2013 9:30 AM' });
	});

	it('should return empty string when editor is not set for absolute alarms', function() {
		expect(filter({
			action: {
				type: 'text',
				value: 'AUDIO'
			},
			duration: {},
			id: 42,
			repeat: {},
			trigger: {
				related: 'start',
				type: 'date-time',
				value: moment()
			}
		})).toEqual('');
	});

});
