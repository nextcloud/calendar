describe('The FullCalendar Event factory', function () {
	'use strict';

	let FcEvent, SimpleEvent;

	const ics1 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tests//
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
DTSTART:19810329T020000
TZNAME:GMT+2
TZOFFSETTO:+0200
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
DTSTART:19961027T030000
TZNAME:GMT+1
TZOFFSETTO:+0100
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics2 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;TZID=America/New_York:20160925T000000
DURATION:P15DT5H0M20S
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics3 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics4 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
DTSTART:19810329T020000
TZNAME:GMT+2
TZOFFSETTO:+0200
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
DTSTART:19961027T030000
TZNAME:GMT+1
TZOFFSETTO:+0100
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT
BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 123
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;TZID=Europe/Berlin:20161012T090000
END:VEVENT
END:VCALENDAR`;

	const ics5 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161008
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics6 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:P10DT0H0M0S
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics7 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;


	beforeEach(module('Calendar', function ($provide) {
		SimpleEvent = jasmine.createSpy().and.callFake(function() {
			return Array.from(arguments);
		});

		const tzBerlin = new ICAL.Timezone(new ICAL.Component(ICAL.parse(`BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
DTSTART:19810329T020000
TZNAME:GMT+2
TZOFFSETTO:+0200
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
DTSTART:19961027T030000
TZNAME:GMT+1
TZOFFSETTO:+0100
END:STANDARD
END:VTIMEZONE`)));
		ICAL.TimezoneService.register('Europe/Berlin', tzBerlin);

		$provide.value('SimpleEvent', SimpleEvent);
	}));

	beforeEach(inject(function (_FcEvent_) {
		FcEvent = _FcEvent_;
	}));

	it ('should initialize correctly', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy().and.returnValue(true)
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		expect(() => FcEvent(vevent, event, start, end)).not.toThrow();
		const fcEvent = FcEvent(vevent, event, start, end);

		expect(vevent.calendar.isWritable).toHaveBeenCalled();

		expect(fcEvent.vevent).toEqual(vevent);
		expect(() => fcEvent.vevent = 123).toThrowError(TypeError);

		expect(fcEvent.event).toEqual(event);
		expect(() => fcEvent.event = 123).toThrowError(TypeError);

		expect(fcEvent.calendar).toEqual(vevent.calendar);
		expect(() => fcEvent.calendar = 123).toThrowError(TypeError);

		expect(fcEvent.id).toEqual('fancy1337');
		expect(fcEvent.allDay).toEqual(false);
		expect(fcEvent.start.toString()).toEqual(moment(start.toString()).toString());
		expect(fcEvent.end.toString()).toEqual(moment(end.toString()).toString());
		expect(fcEvent.repeating).toEqual(false);
		expect(fcEvent.backgroundColor).toEqual('#000');
		expect(fcEvent.borderColor).toEqual('#000');
		expect(fcEvent.className).toEqual(['fcCalendar-id-3.1415926536']);
		expect(fcEvent.editable).toEqual(true);
		expect(fcEvent.textColor).toEqual('#fff');
		expect(fcEvent.title).toEqual('Test');
	});

	it ('should check if it\'s an FcEvent object', function() {
		expect(FcEvent.isFcEvent({})).toBe(false);
		expect(FcEvent.isFcEvent(true)).toBe(false);
		expect(FcEvent.isFcEvent(false)).toBe(false);
		expect(FcEvent.isFcEvent(123)).toBe(false);
		expect(FcEvent.isFcEvent('asd')).toBe(false);

		expect(FcEvent.isFcEvent({
			_isAFcEventObject: true
		})).toBe(true);
	});

	it ('should include the recurrenceId in the id', function() {
		const comp = new ICAL.Component(ICAL.parse(ics4));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getAllSubcomponents('vevent')[1];
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		expect(fcEvent.id).toEqual('fancy133720161012T090000');
	});

	it ('should return a simpleEvent object', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const simpleEvent = fcEvent.getSimpleEvent();

		expect(simpleEvent).toEqual([event]);
		expect(SimpleEvent).toHaveBeenCalledWith(event);
	});

	it ('should drop an event correctly within grid - with DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(2, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, '', moment.duration(), moment.duration());

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T120000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T110000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly within grid - without DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics3));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, '', moment.duration(), moment.duration());

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161106T015900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});


	it ('should drop an event correctly within allDay - with DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics5));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(2, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161008
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, true, '', moment.duration(), moment.duration());

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161010
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161007
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});


	it ('should drop an event correctly within allDay - without DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics6));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:P10DT0H0M0S
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, true, '', moment.duration(), moment.duration());

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:P10DT0H0M0S
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161007
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - DTEND - tz', function() {
		const comp = new ICAL.Component(ICAL.parse(ics5));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161008
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'Europe/Berlin', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;TZID=Europe/Berlin:20161007T180000
TRANSP:TRANSPARENT
DTSTART;TZID=Europe/Berlin:20161007T130000
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - DTEND - UTC', function() {
		const comp = new ICAL.Component(ICAL.parse(ics5));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161008
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'UTC', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND:20161007T180000Z
TRANSP:TRANSPARENT
DTSTART:20161007T130000Z
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - DURATION - tz', function() {
		const comp = new ICAL.Component(ICAL.parse(ics6));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:P10DT0H0M0S
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'Europe/Berlin', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:PT5H
TRANSP:TRANSPARENT
DTSTART;TZID=Europe/Berlin:20161007T130000
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - DURATION - UTC', function() {
		const comp = new ICAL.Component(ICAL.parse(ics6));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:P10DT0H0M0S
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'UTC', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DURATION:PT5H
TRANSP:TRANSPARENT
DTSTART:20161007T130000Z
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - neither DTEND nor DURATION - tz', function() {
		const comp = new ICAL.Component(ICAL.parse(ics7));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'Europe/Berlin', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTART;TZID=Europe/Berlin:20161007T130000
DTSTAMP:20161004T144437Z
SEQUENCE:0
DTEND;TZID=Europe/Berlin:20161007T180000
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - allDay to grid - neither DTEND nor DURATION - UTC', function() {
		const comp = new ICAL.Component(ICAL.parse(ics7));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'days').add(13, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, false, 'UTC', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTART:20161007T130000Z
DTSTAMP:20161004T144437Z
SEQUENCE:0
DTEND:20161007T180000Z
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - grid to allDay - DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(0, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, true, '', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;VALUE=DATE:20160819
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;VALUE=DATE:20160816
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - grid to allDay - DURATION', function() {
		const comp = new ICAL.Component(ICAL.parse(ics2));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(-3, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;TZID=America/New_York:20160925T000000
DURATION:P15DT5H0M20S
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, true, '', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;VALUE=DATE:20160922
DURATION:P3D
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - grid to allDay - neither DTEND nor DURATION', function() {
		const comp = new ICAL.Component(ICAL.parse(ics3));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(3, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta, true, '', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;VALUE=DATE:20161108
DTSTAMP:20161002T105648Z
SEQUENCE:0
DTEND;VALUE=DATE:20161111
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should drop an event correctly - grid to allDay to grid - DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta1 = moment.duration(-2, 'days');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.drop(delta1, true, '', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;VALUE=DATE:20160817
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;VALUE=DATE:20160814
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();

		const delta2 = moment.duration(3, 'days').add(15, 'hours').add(30, 'minutes');
		fcEvent.drop(delta2, false, 'Europe/Berlin', moment.duration(5, 'hours'), moment.duration(3, 'days'));

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160817T203000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160817T153000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should resize an event correctly - with DURATION', function() {
		const comp = new ICAL.Component(ICAL.parse(ics2));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;TZID=America/New_York:20160925T000000
DURATION:P15DT5H0M20S
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.resize(delta);

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;TZID=America/New_York:20160925T000000
DURATION:P15DT7H20S
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should resize an event correctly - with DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');
		const end = event.getFirstPropertyValue('dtend');

		const fcEvent = FcEvent(vevent, event, start, end);
		const delta = moment.duration(2, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.resize(delta);

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T120000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});

	it ('should resize an event correctly - with neither DURATION nor DTEND', function() {
		const comp = new ICAL.Component(ICAL.parse(ics3));
		const vevent = {
			calendar: {
				color: '#000',
				textColor: '#fff',
				tmpId: '3.1415926536',
				isWritable: jasmine.createSpy()
			},
			uri: 'fancy1337',
			touch: jasmine.createSpy()
		};
		const event = comp.getFirstSubcomponent('vevent');
		const start = event.getFirstPropertyValue('dtstart');

		const fcEvent = FcEvent(vevent, event, start, start);
		const delta = moment.duration(2, 'hours');

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		fcEvent.resize(delta);

		expect(fcEvent.event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
DTEND;TZID=America/New_York:20161106T015900
END:VEVENT`.split("\n").join("\r\n"));
		expect(vevent.touch).toHaveBeenCalled();
	});
});
