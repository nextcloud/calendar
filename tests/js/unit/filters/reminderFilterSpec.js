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
		})).toEqual('Audio alarm {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm {time} before the event starts', { time: '15 minutes' });
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
		})).toEqual('Email {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Email {time} before the event starts', { time: '15 minutes' });
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
		})).toEqual('Pop-up {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Pop-up {time} before the event starts', { time: '15 minutes' });
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
		})).toEqual('None {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'None {time} before the event starts', { time: '15 minutes' });
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
		})).toEqual('Audio alarm {time} before the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm {time} before the event starts', { time: '15 minutes' });
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
		})).toEqual('Audio alarm {time} before the event ends');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm {time} before the event ends', { time: '15 minutes' });
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
		})).toEqual('Audio alarm at the event\'s start');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm at the event\'s start');
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
		})).toEqual('Audio alarm at the event\'s end');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm at the event\'s end');
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
		})).toEqual('Audio alarm {time} after the event starts');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm {time} after the event starts', { time: '15 minutes' });
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
		})).toEqual('Audio alarm {time} after the event ends');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm {time} after the event ends', { time: '15 minutes' });
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
		})).toEqual('Audio alarm at {time}');
		expect(t).toHaveBeenCalledWith( 'calendar', 'Audio alarm at {time}', { time: 'Friday, February 8, 2013 9:30 AM' });
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
