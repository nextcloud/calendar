describe('The calendar factory', function () {
	'use strict';

	var Calendar, window, hook, veventservice, timezoneservice, colorutilityservice, randomstringservice;

	beforeEach(module('Calendar', function ($provide) {
		window = {};
		window.location = {};
		window.location.origin = 'HTTP://AWE.SOME-LOCATION.ORIGIN';

		hook = jasmine.createSpy().and.returnValue({
			emit: jasmine.createSpy()
		});

		randomstringservice = {};
		randomstringservice.generate = jasmine.createSpy().and.returnValue('**random**');

		$provide.value('$window', window);
		$provide.value('Hook', hook);
		$provide.value('RandomStringService', randomstringservice);
	}));

	beforeEach(inject(function (_Calendar_) {
		Calendar = _Calendar_;
	}));

	it('should correctly reflect the given paramters', function() {
		var components = {
			vevents: true,
			vjournals: true,
			vtodos: true
		};
		var shares = {
			groups: [],
			users: []
		};
		var calendar = Calendar('/remote.php/dav/caldav/foobar/', {
			components: components,
			color: '#001122',
			displayname: 'name_1337',
			enabled: true,
			order: 42,
			owner: 'user123',
			shares: shares,
			shareable: true,
			writable: false,
			writableProperties: true
		});

		expect(calendar.components).toEqual(components);
		expect(calendar.color).toEqual('#001122');
		expect(calendar.displayname).toEqual('name_1337');
		expect(calendar.enabled).toEqual(true);
		expect(calendar.order).toEqual(42);
		expect(calendar.owner).toEqual('user123');
		expect(calendar.shares).toEqual(shares);
		expect(calendar.isShareable()).toEqual(true);
		expect(calendar.isWritable()).toEqual(false);
		expect(calendar.arePropertiesWritable()).toEqual(true);
		expect(calendar.tmpId).toEqual('**random**');

		expect(calendar.isShared()).toEqual(false);

		expect(randomstringservice.generate).toHaveBeenCalled();
	});

	it('should correctly reflect if it\'s shared', function() {
		var calendar1 = Calendar('/remote.php/dav/caldav/foobar/', {
			shares: {
				groups: [],
				users: []
			}
		});
		expect(calendar1.isShared()).toEqual(false);

		var calendar2 = Calendar('/remote.php/dav/caldav/foobar/', {
			shares: {
				groups: [{}],
				users: []
			}
		});
		expect(calendar2.isShared()).toEqual(true);

		var calendar3 = Calendar('/remote.php/dav/caldav/foobar/', {
			shares: {
				groups: [],
				users: [{}]
			}
		});
		expect(calendar3.isShared()).toEqual(true);

		var calendar4 = Calendar('/remote.php/dav/caldav/foobar/', {
			shares: {
				groups: [{}],
				users: [{}]
			}
		});
		expect(calendar4.isShared()).toEqual(true);
	});

	it('should be able to store warnings', function() {
		var calendar = Calendar();

		expect(calendar.hasWarnings()).toEqual(false);
		expect(calendar.warnings).toEqual([]);

		calendar.addWarning('abc');
		calendar.addWarning('def');

		expect(calendar.hasWarnings()).toEqual(true);
		expect(calendar.warnings).toEqual(['abc', 'def']);

		calendar.resetWarnings();

		expect(calendar.hasWarnings()).toEqual(false);
		expect(calendar.warnings).toEqual([]);
	});

	it('should be able to remember updated properties', function() {
		var calendar = Calendar();

		expect(calendar.hasUpdated()).toEqual(false);
		expect(calendar.getUpdated()).toEqual([]);

		calendar.color = '#000000';

		expect(calendar.hasUpdated()).toEqual(true);
		expect(calendar.getUpdated()).toEqual(['color']);
		
		calendar.displayname = '123';

		expect(calendar.hasUpdated()).toEqual(true);
		expect(calendar.getUpdated()).toEqual(['color', 'displayname']);
		
		calendar.enabled = false;

		expect(calendar.hasUpdated()).toEqual(true);
		expect(calendar.getUpdated()).toEqual(['color', 'displayname', 'enabled']);
		
		calendar.order = 1337;

		expect(calendar.hasUpdated()).toEqual(true);
		expect(calendar.getUpdated()).toEqual(['color', 'displayname', 'enabled', 'order']);

		calendar.resetUpdated();

		expect(calendar.hasUpdated()).toEqual(false);
		expect(calendar.getUpdated()).toEqual([]);
	});

	it('should correctly detect whether it\'s a Calendar object', function() {
		expect(Calendar.isCalendar({})).toBe(false);
		expect(Calendar.isCalendar(true)).toBe(false);
		expect(Calendar.isCalendar(false)).toBe(false);
		expect(Calendar.isCalendar(123)).toBe(false);
		expect(Calendar.isCalendar('asd')).toBe(false);

		expect(Calendar.isCalendar({
			_isACalendarObject: true
		})).toBe(true);

		var item = Calendar('/', {});
		expect(Calendar.isCalendar(item)).toBe(true);
	});
});
