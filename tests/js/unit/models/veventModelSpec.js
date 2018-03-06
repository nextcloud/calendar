describe('The VEvent factory', function () {
	'use strict';

	let VEvent, FcEvent, SimpleEvent, ICalFactory, StringUtility;
	let $q, $rootScope;

	const ics_invalid = `ASHGDAS
ASDASD
!@#ASF`;

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
BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
TZNAME:EDT
RRULE:FREQ=YEARLY;UNTIL=20060402T070000Z;BYDAY=1SU;BYMONTH=4
DTSTART:20000402T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:DAYLIGHT
TZNAME:EDT
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
DTSTART:20070311T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:EST
RRULE:FREQ=YEARLY;UNTIL=20061029T060000Z;BYDAY=-1SU;BYMONTH=10
DTSTART:20001029T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
BEGIN:STANDARD
TZNAME:EST
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
DTSTART:20071104T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
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
CREATED:20161002T105542Z
UID:DF8A5F8D-9037-4FA3-84CC-97FB6D5D0DA9
DTEND;TZID=America/New_York:20161004T113000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 1
DTSTART;TZID=America/New_York:20161004T090000
DTSTAMP:20161002T105552Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics4 = `BEGIN:VCALENDAR
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

	const ics5 = `BEGIN:VCALENDAR
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

	const ics6 = `BEGIN:VCALENDAR
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
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics7 = `BEGIN:VCALENDAR
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
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics8 = `BEGIN:VCALENDAR
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

	const ics9 = `BEGIN:VCALENDAR
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
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20140928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20140928T090000
DTSTAMP:20161003T140928Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics10 = `BEGIN:VCALENDAR
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
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20160928T100000
EXDATE;TZID=Europe/Berlin:20161019T090000
EXDATE;TZID=Europe/Berlin:20161012T090000
TRANSP:OPAQUE
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140928Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

	const ics11 = `BEGIN:VCALENDAR
PRODID:-//ownCloud calendar v1.4.0
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161020T130607
DTSTAMP:20161020T130607
LAST-MODIFIED:20161020T130607
UID:ujihvdbldzg
SUMMARY:Test
CLASS:PUBLIC
STATUS:CONFIRMED
RRULE:FREQ=DAILY;COUNT=3
DTSTART;TZID=Europe/Berlin:20161022T180000
DTEND;TZID=Europe/Berlin:20161023T060000
END:VEVENT
BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
END:STANDARD
END:VTIMEZONE
END:VCALENDAR`;

	const ics12 = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//SabreDAV//SabreDAV//EN
X-WR-CALNAME:Test
X-APPLE-CALENDAR-COLOR:#c274e7
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
CLASS:PUBLIC
DESCRIPTION: 
DTEND;TZID=Europe/Berlin:20170105T130000
DTSTART;TZID=Europe/Berlin:20170105T120000
DTSTAMP:20170103T150245Z
LAST-MODIFIED:20170103T150246Z
PRIORITY:5
SEQUENCE:1
SUMMARY:Test
TRANSP:OPAQUE
UID:348acb0f-b02f-4800-9fde-202a0717c5b5
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:P
END:VALARM
END:VEVENT
END:VCALENDAR`;

	const ics13 = `BEGIN:VCALENDAR
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
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
SUMMARY:foobar 9990
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT
BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 9991
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;RANGE=THISANDFUTURE;TZID=Europe/Berlin:20161012T090000
END:VEVENT
END:VCALENDAR`;

	const ics14 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.13.3//EN
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
CREATED:20180207T173756Z
UID:77A9ABE1-D203-4E42-808A-05C9BC896455
DTEND;TZID=Europe/Berlin:20180227T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:TestEvent
DTSTART;TZID=Europe/Berlin:20180227T090000
DTSTAMP:20180207T173812Z
SEQUENCE:0
RECURRENCE-ID;TZID=Europe/Berlin:20180226T090000
END:VEVENT
END:VCALENDAR`;

	const ics15 = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:carrier CMS
METHOD:PUBLISH
BEGIN:VEVENT
UID:3736a16963ebae6ef46c32dd120c9520
SUMMARY:Abfuhrtermin: Schadstoffmobil S1
CLASS:PUBLIC
DTSTART;VALUE=DATE:20180102
DTSTAMP:20180103T154011Z
END:VEVENT
END:VCALENDAR`;

	const timezone_nyc = {
		jCal: new ICAL.Timezone(new ICAL.Component(ICAL.parse(`BEGIN:VTIMEZONE
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
END:VTIMEZONE`))),
		name: 'America/New_York'
	};
	const timezone_berlin = {
		jCal: new ICAL.Timezone(new ICAL.Component(ICAL.parse(`BEGIN:VTIMEZONE
TZID:Europe/Berlin
X-LIC-LOCATION:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
END:STANDARD
END:VTIMEZONE
`))),
		name: 'Europe/Berlin'
	};
	const timezone_utc = {
		jCal: ICAL.TimezoneService.get('UTC'),
		name: 'UTC'
	};

	beforeEach(module('Calendar', function ($provide) {
		FcEvent = jasmine.createSpy().and.callFake(function() {
			return Array.from(arguments);
		});
		SimpleEvent = jasmine.createSpy().and.callFake(function() {
			return Array.from(arguments);
		});

		ICalFactory = {};
		ICalFactory.newEvent = jasmine.createSpy();

		StringUtility = {};
		StringUtility.uid = jasmine.createSpy();

		spyOn(ICAL.TimezoneService, 'register').and.callThrough();
		spyOn(console, 'log');

		$provide.value('FcEvent', FcEvent);
		$provide.value('SimpleEvent', SimpleEvent);
		$provide.value('ICalFactory', ICalFactory);
		$provide.value('StringUtility', StringUtility);
		$provide.value('TimezoneService', {});
	}));

	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}
	}));

	beforeEach(inject(function (_VEvent_) {
		VEvent = _VEvent_;
	}));

	afterEach(function() {
		ICAL.TimezoneService.reset();
	});

	it ('should initialize correctly', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const uri = 'foobar123';
		const etag = 'etag2.7182';

		expect(() => VEvent(calendar, comp, uri, etag)).not.toThrow();
		const vevent = VEvent(calendar, comp, uri, etag);
		expect(vevent.calendar).toEqual(calendar);
		expect(vevent.comp).toEqual(comp);
		expect(vevent.uri).toEqual(uri);
		expect(vevent.etag).toEqual(etag);
	});

	it ('should set etag to empty string when not set', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const uri = 'foobar123';

		expect(() => VEvent(calendar, comp, uri)).not.toThrow();
		const vevent = VEvent(calendar, comp, uri);
		expect(vevent.calendar).toEqual(calendar);
		expect(vevent.comp).toEqual(comp);
		expect(vevent.uri).toEqual(uri);
		expect(vevent.etag).toEqual('');
	});

	it ('should set the uri to the events uid when not set', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));

		expect(() => VEvent(calendar, comp)).not.toThrow();
		const vevent = VEvent(calendar, comp);
		expect(vevent.calendar).toEqual(calendar);
		expect(vevent.comp).toEqual(comp);
		expect(vevent.uri).toEqual('0AD16F58-01B3-463B-A215-FD09FC729A02');
		expect(vevent.etag).toEqual('');
	});

	it ('should throw a typeerror when second parameter is not a comp', function() {
		const calendar = {this_is_a_fancy_calendar: true};

		expect(() => VEvent(calendar, 'foobar')).toThrowError(TypeError, 'Given comp is not a valid calendar');
	});

	it ('should sanatize an malformed DTSTART, DTEND', function() {
		const compDTStart = `DTSTART:1970-01-01T::`;
		const compDTEnd = `DTEND:1970-01-01T::`;

		expect(VEvent.sanDate(compDTStart)).toEqual("DTSTART;VALUE=DATE:19700101");
		expect(VEvent.sanDate(compDTEnd)).toEqual("DTEND;VALUE=DATE:19700101");
	});

	it ('should add a missing VALUE=DATE', () => {
		// add a VALUE=DATE
		expect(VEvent.sanNoDateValue('DTSTART;FOO=BAR;BAR=FOO:20170515')).toEqual('DTSTART;FOO=BAR;BAR=FOO;VALUE=DATE:20170515');
		expect(VEvent.sanNoDateValue('DTSTART:20170515')).toEqual('DTSTART;VALUE=DATE:20170515');

		// don't touch date-time values
		expect(VEvent.sanNoDateValue('DTSTART;TZID=Europe/Berlin:20161018T152500')).toEqual('DTSTART;TZID=Europe/Berlin:20161018T152500');
		expect(VEvent.sanNoDateValue('DTSTART:20161018T152500')).toEqual('DTSTART:20161018T152500');

		// don't add VALUE=DATE if already present
		expect(VEvent.sanNoDateValue('DTSTART;FOO=BAR;BAR=FOO;VALUE=DATE:20170515')).toEqual('DTSTART;FOO=BAR;BAR=FOO;VALUE=DATE:20170515');
		expect(VEvent.sanNoDateValue('DTSTART;VALUE=DATE:20170515')).toEqual('DTSTART;VALUE=DATE:20170515');

		// sanitize DTEND as well
		expect(VEvent.sanNoDateValue('DTEND:20170515')).toEqual('DTEND;VALUE=DATE:20170515');
	});

	it ('should register timezones in the given comp', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics2));

		const vevent = VEvent(calendar, comp);
		expect(vevent.calendar).toEqual(calendar);

		expect(ICAL.TimezoneService.register.calls.count()).toEqual(2);
		expect(ICAL.TimezoneService.register.calls.argsFor(0).length).toEqual(2);
		expect(ICAL.TimezoneService.register.calls.argsFor(0)[0]).toEqual('Europe/Berlin');
		expect(ICAL.TimezoneService.register.calls.argsFor(0)[1].component.toString()).toEqual(`BEGIN:VTIMEZONE
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
END:VTIMEZONE`.split("\n").join("\r\n"));
		expect(ICAL.TimezoneService.register.calls.argsFor(1).length).toEqual(2);
		expect(ICAL.TimezoneService.register.calls.argsFor(1)[0]).toEqual('America/New_York');
		expect(ICAL.TimezoneService.register.calls.argsFor(1)[1].component.toString()).toEqual(`BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
TZNAME:EDT
RRULE:FREQ=YEARLY;UNTIL=20060402T070000Z;BYDAY=1SU;BYMONTH=4
DTSTART:20000402T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:DAYLIGHT
TZNAME:EDT
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
DTSTART:20070311T020000
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:STANDARD
TZNAME:EST
RRULE:FREQ=YEARLY;UNTIL=20061029T060000Z;BYDAY=-1SU;BYMONTH=10
DTSTART:20001029T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
BEGIN:STANDARD
TZNAME:EST
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
DTSTART:20071104T020000
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
END:VTIMEZONE`.split("\n").join("\r\n"));
	});

	it ('should have a writable calendar property', function() {
		const calendar1 = {this_is_a_fancy_calendar: true};
		const calendar2 = {this_is_another_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));

		const vevent = VEvent(calendar1, comp);
		expect(vevent.calendar).toEqual(calendar1);

		vevent.calendar = calendar2;
		expect(vevent.calendar).toEqual(calendar2);
	});

	it ('should have a read-only comp property', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp1 = new ICAL.Component(ICAL.parse(ics1));
		const comp2 = new ICAL.Component(ICAL.parse(ics2));

		const vevent = VEvent(calendar, comp1);
		expect(vevent.comp).toEqual(comp1);

		expect(() => vevent.comp = comp2).toThrowError(TypeError);
	});

	it ('should have a read-only data property', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp1 = new ICAL.Component(ICAL.parse(ics1));

		const vevent = VEvent(calendar, comp1);
		expect(vevent.data).toEqual(ics1.split("\n").join("\r\n"));

		expect(() => vevent.data = 'foobar').toThrowError(TypeError);
	});

	it ('should have a writable etag property', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const etag1 = '123';
		const etag2 = '456';

		const vevent = VEvent(calendar, comp, '', etag1);
		expect(vevent.etag).toEqual(etag1);

		vevent.etag = etag2;

		expect(vevent.etag = etag2);
	});

	it ('should have a read-only uri property', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));
		const uri1 = 'foobar';
		const uri2 = 'barfoo';

		const vevent = VEvent(calendar, comp, uri1);
		expect(vevent.uri).toEqual(uri1);

		expect(() => vevent.uri = uri2).toThrowError(TypeError);
	});

	it ('should generate FcEvents for a dedicated time-range - single event with DTEND', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics3));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105542Z
UID:DF8A5F8D-9037-4FA3-84CC-97FB6D5D0DA9
DTEND;TZID=America/New_York:20161004T113000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 1
DTSTART;TZID=America/New_York:20161004T090000
DTSTAMP:20161002T105552Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);
			expect(fcEvents[0][2].toString()).toEqual('2016-10-04T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-10-04T11:30:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - single event with DURATION', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics4));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
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
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);
			expect(fcEvents[0][2].toString()).toEqual('2016-09-25T00:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-10-10T05:00:20');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - single event with neither DTEND nor DURATION - datetime', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics5));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);
			expect(fcEvents[0][2].toString()).toEqual('2016-11-05T23:59:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-11-05T23:59:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - single event with neither DTEND nor DURATION - allday', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics15));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2018-01-01');
		const end = moment('2018-01-31');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
UID:3736a16963ebae6ef46c32dd120c9520
SUMMARY:Abfuhrtermin: Schadstoffmobil S1
CLASS:PUBLIC
DTSTART;VALUE=DATE:20180102
DTSTAMP:20180103T154011Z
END:VEVENT`.split("\n").join("\r\n"));
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);
			expect(fcEvents[0][2].toString()).toEqual('2018-01-02');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2018-01-03');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - single event with neither DTEND nor DURATION and conversion', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics5));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=America/New_York:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);
			expect(fcEvents[0][2].toString()).toEqual('2016-11-06T04:59:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-11-06T04:59:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - single event /w timezone conversion', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const parsed = ICAL.parse(ics3);
		const comp = new ICAL.Component(parsed);
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0].length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161002T105542Z
UID:DF8A5F8D-9037-4FA3-84CC-97FB6D5D0DA9
DTEND;TZID=America/New_York:20161004T113000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 1
DTSTART;TZID=America/New_York:20161004T090000
DTSTAMP:20161002T105552Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(ICAL.Component.prototype.isPrototypeOf(fcEvents[0][1])).toBe(true);

			expect(fcEvents[0][2].toString()).toEqual('2016-10-04T15:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-10-04T17:30:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - skip an event when it doesn\'t contain a DTSTART', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const parsed = ICAL.parse(ics6);
		const comp = new ICAL.Component(parsed);
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(0);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - recurring events', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics7));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(6);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-09-28T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-09-28T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-05T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-05T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);

			expect(fcEvents[2][0]).toEqual(vevent);
			expect(fcEvents[2][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[2][2].toString()).toEqual('2016-10-12T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][2])).toBe(true);
			expect(fcEvents[2][3].toString()).toEqual('2016-10-12T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][3])).toBe(true);

			expect(fcEvents[3][0]).toEqual(vevent);
			expect(fcEvents[3][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[3][2].toString()).toEqual('2016-10-19T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][2])).toBe(true);
			expect(fcEvents[3][3].toString()).toEqual('2016-10-19T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][3])).toBe(true);

			expect(fcEvents[4][0]).toEqual(vevent);
			expect(fcEvents[4][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[4][2].toString()).toEqual('2016-10-26T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][2])).toBe(true);
			expect(fcEvents[4][3].toString()).toEqual('2016-10-26T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][3])).toBe(true);

			expect(fcEvents[5][0]).toEqual(vevent);
			expect(fcEvents[5][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[5][2].toString()).toEqual('2016-11-02T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][2])).toBe(true);
			expect(fcEvents[5][3].toString()).toEqual('2016-11-02T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - recurring events - timezone conversion', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics7));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(6);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-09-28T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-09-28T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-05T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-05T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);

			expect(fcEvents[2][0]).toEqual(vevent);
			expect(fcEvents[2][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[2][2].toString()).toEqual('2016-10-12T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][2])).toBe(true);
			expect(fcEvents[2][3].toString()).toEqual('2016-10-12T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][3])).toBe(true);

			expect(fcEvents[3][0]).toEqual(vevent);
			expect(fcEvents[3][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[3][2].toString()).toEqual('2016-10-19T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][2])).toBe(true);
			expect(fcEvents[3][3].toString()).toEqual('2016-10-19T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][3])).toBe(true);

			expect(fcEvents[4][0]).toEqual(vevent);
			expect(fcEvents[4][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[4][2].toString()).toEqual('2016-10-26T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][2])).toBe(true);
			expect(fcEvents[4][3].toString()).toEqual('2016-10-26T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][3])).toBe(true);

			expect(fcEvents[5][0]).toEqual(vevent);
			expect(fcEvents[5][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-236D2E8458CE
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[5][2].toString()).toEqual('2016-11-02T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][2])).toBe(true);
			expect(fcEvents[5][3].toString()).toEqual('2016-11-02T05:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should generate FcEvents for a dedicated time-range - recurring events with recurrence Exceptions', () => {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics8));

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			expect(fcEvents.length).toEqual(6);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-09-28T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-09-28T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-05T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-05T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);

			expect(fcEvents[2][0]).toEqual(vevent);
			expect(fcEvents[2][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[2][2].toString()).toEqual('2016-10-13T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][2])).toBe(true);
			expect(fcEvents[2][3].toString()).toEqual('2016-10-13T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][3])).toBe(true);

			expect(fcEvents[3][0]).toEqual(vevent);
			expect(fcEvents[3][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[3][2].toString()).toEqual('2016-10-19T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][2])).toBe(true);
			expect(fcEvents[3][3].toString()).toEqual('2016-10-19T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][3])).toBe(true);

			expect(fcEvents[4][0]).toEqual(vevent);
			expect(fcEvents[4][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[4][2].toString()).toEqual('2016-10-26T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][2])).toBe(true);
			expect(fcEvents[4][3].toString()).toEqual('2016-10-26T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][3])).toBe(true);

			expect(fcEvents[5][0]).toEqual(vevent);
			expect(fcEvents[5][1].toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[5][2].toString()).toEqual('2016-11-02T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][2])).toBe(true);
			expect(fcEvents[5][3].toString()).toEqual('2016-11-02T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][3])).toBe(true);
		});

		$rootScope.$apply();
	});

/*	it ('should generate FcEvents for a dedicated time-range - recurring events with recurrence Exceptions - THISANDFUTURE', () => {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics13));

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			expect(fcEvents.length).toEqual(6);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
SUMMARY:foobar 9990
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-09-28T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-09-28T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
RRULE:FREQ=WEEKLY;INTERVAL=1
DTEND;TZID=Europe/Berlin:20160928T100000
TRANSP:OPAQUE
SUMMARY:foobar 9990
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140538Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-05T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-05T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);

			expect(fcEvents[2][0]).toEqual(vevent);
			expect(fcEvents[2][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 9991
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;RANGE=THISANDFUTURE;TZID=Europe/Berlin:20161012T090000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[2][2].toString()).toEqual('2016-10-13T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][2])).toBe(true);
			expect(fcEvents[2][3].toString()).toEqual('2016-10-13T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][3])).toBe(true);

			expect(fcEvents[3][0]).toEqual(vevent);
			expect(fcEvents[3][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 9991
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;RANGE=THISANDFUTURE;TZID=Europe/Berlin:20161012T090000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[3][2].toString()).toEqual('2016-10-20T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][2])).toBe(true);
			expect(fcEvents[3][3].toString()).toEqual('2016-10-20T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][3])).toBe(true);

			expect(fcEvents[4][0]).toEqual(vevent);
			expect(fcEvents[4][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 9991
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;RANGE=THISANDFUTURE;TZID=Europe/Berlin:20161012T090000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[4][2].toString()).toEqual('2016-10-27T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][2])).toBe(true);
			expect(fcEvents[4][3].toString()).toEqual('2016-10-27T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[4][3])).toBe(true);

			expect(fcEvents[5][0]).toEqual(vevent);
			expect(fcEvents[5][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140450Z
UID:6D2955B1-5E46-4683-AA11-asdasdasdasdasdasdasdasd
DTEND;TZID=Europe/Berlin:20161013T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:foobar 9991
DTSTART;TZID=Europe/Berlin:20161013T090000
DTSTAMP:20161003T140622Z
SEQUENCE:0
RECURRENCE-ID;RANGE=THISANDFUTURE;TZID=Europe/Berlin:20161012T090000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[5][2].toString()).toEqual('2016-11-03T09:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][2])).toBe(true);
			expect(fcEvents[5][3].toString()).toEqual('2016-11-03T10:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[5][3])).toBe(true);
		});

		$rootScope.$apply();
	});

	it ('should generate FcEvents for a dedicated time-range - recurring events ending before requested time-frame', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics9));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(0);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});*/

	it ('should generate FcEvents for a dedicated time-range - recurring events with EXDATES', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics10));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-09-25');
		const end = moment('2016-11-06');

		const fcEvents = vevent.getFcEvent(start, end, timezone_nyc).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(4);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20160928T100000
EXDATE;TZID=Europe/Berlin:20161019T090000
EXDATE;TZID=Europe/Berlin:20161012T090000
TRANSP:OPAQUE
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140928Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-09-28T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-09-28T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20160928T100000
EXDATE;TZID=Europe/Berlin:20161019T090000
EXDATE;TZID=Europe/Berlin:20161012T090000
TRANSP:OPAQUE
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140928Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-05T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-05T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);

			expect(fcEvents[2][0]).toEqual(vevent);
			expect(fcEvents[2][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20160928T100000
EXDATE;TZID=Europe/Berlin:20161019T090000
EXDATE;TZID=Europe/Berlin:20161012T090000
TRANSP:OPAQUE
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140928Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[2][2].toString()).toEqual('2016-10-26T03:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][2])).toBe(true);
			expect(fcEvents[2][3].toString()).toEqual('2016-10-26T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[2][3])).toBe(true);

			expect(fcEvents[3][0]).toEqual(vevent);
			expect(fcEvents[3][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161003T140732Z
UID:4AE5E4A8-B010-4CA5-8FCD-4FAECE77E59B
RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT=6
DTEND;TZID=Europe/Berlin:20160928T100000
EXDATE;TZID=Europe/Berlin:20161019T090000
EXDATE;TZID=Europe/Berlin:20161012T090000
TRANSP:OPAQUE
SUMMARY:test
DTSTART;TZID=Europe/Berlin:20160928T090000
DTSTAMP:20161003T140928Z
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[3][2].toString()).toEqual('2016-11-02T04:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][2])).toBe(true);
			expect(fcEvents[3][3].toString()).toEqual('2016-11-02T05:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[3][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should extract events correctly when they span over the fdof', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics11));
		let called = false;

		const vevent = VEvent(calendar, comp);
		const start = moment('2016-10-24 00+02:00');
		const end = moment('2016-10-31 23:59:59+02:00');

		const fcEvents = vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			called = true;

			expect(fcEvents.length).toEqual(2);
			expect(fcEvents[0][0]).toEqual(vevent);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161020T130607
DTSTAMP:20161020T130607
LAST-MODIFIED:20161020T130607
UID:ujihvdbldzg
SUMMARY:Test
CLASS:PUBLIC
STATUS:CONFIRMED
RRULE:FREQ=DAILY;COUNT=3
DTSTART;TZID=Europe/Berlin:20161022T180000
DTEND;TZID=Europe/Berlin:20161023T060000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[0][2].toString()).toEqual('2016-10-23T18:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][2])).toBe(true);
			expect(fcEvents[0][3].toString()).toEqual('2016-10-24T06:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[0][3])).toBe(true);

			expect(fcEvents[1][0]).toEqual(vevent);
			expect(fcEvents[1][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20161020T130607
DTSTAMP:20161020T130607
LAST-MODIFIED:20161020T130607
UID:ujihvdbldzg
SUMMARY:Test
CLASS:PUBLIC
STATUS:CONFIRMED
RRULE:FREQ=DAILY;COUNT=3
DTSTART;TZID=Europe/Berlin:20161022T180000
DTEND;TZID=Europe/Berlin:20161023T060000
END:VEVENT`.split("\n").join("\r\n"));
			expect(fcEvents[1][2].toString()).toEqual('2016-10-24T18:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][2])).toBe(true);
			expect(fcEvents[1][3].toString()).toEqual('2016-10-25T06:00:00');
			expect(ICAL.Time.prototype.isPrototypeOf(fcEvents[1][3])).toBe(true);
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should get a simple event without recurrenceId', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics8));

		const vevent = VEvent(calendar, comp);
		const simple = vevent.getSimpleEvent();

		expect(simple.toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should get a simple event with recurrenceId', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics8));

		const vevent = VEvent(calendar, comp);
		const simple = vevent.getSimpleEvent('20161012T090000');

		expect(simple.toString()).toEqual(`BEGIN:VEVENT
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
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should throw an error when event for simple event was not found', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics8));

		const vevent = VEvent(calendar, comp);
		expect(() => vevent.getSimpleEvent('20181012T090000')).toThrowError(Error, 'Event not found');
	});

	it ('should provide a touch method', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const comp = new ICAL.Component(ICAL.parse(ics1));

		const vevent = VEvent(calendar, comp);

		expect(vevent.data).toEqual(`BEGIN:VCALENDAR
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
END:VCALENDAR`.split("\n").join("\r\n"));

		const baseTime = new Date(2017, 0, 1);
		jasmine.clock().mockDate(baseTime);

		vevent.touch();

		expect(vevent.data).toEqual(`BEGIN:VCALENDAR
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
LAST-MODIFIED:20170101T000000
END:VEVENT
END:VCALENDAR`.split("\n").join("\r\n"));

	});

	it ('should check if an object is an VEvent', function() {
		expect(VEvent.isVEvent({})).toBe(false);
		expect(VEvent.isVEvent(true)).toBe(false);
		expect(VEvent.isVEvent(false)).toBe(false);
		expect(VEvent.isVEvent(123)).toBe(false);
		expect(VEvent.isVEvent('asd')).toBe(false);

		expect(VEvent.isVEvent({
			_isAVEventObject: true
		})).toBe(true);
	});

	it ('should provide a constructor from raw ics1 data - valid ics', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const uri = '123.ics';
		const etag = '3.14159';

		const vevent = VEvent.fromRawICS(calendar, ics1, uri, etag);
		expect(vevent.calendar).toEqual(calendar);
		expect(vevent.comp.toString()).toEqual(ics1.split("\n").join("\r\n"));
		expect(vevent.uri).toEqual(uri);
		expect(vevent.etag).toEqual(etag);
	});

	it ('should provide a constructor from raw ics1 data - invalid ics', function() {
		const calendar = {this_is_a_fancy_calendar: true};
		const uri = '123.ics';
		const etag = '3.14159';

		expect(() => VEvent.fromRawICS(calendar, ics_invalid, uri, etag)).toThrowError(TypeError, 'given ics data was not valid');
		expect(console.log).toHaveBeenCalled();
	});

	it ('should provide a constructor from a start and end - allday', function() {
		const start = $.fullCalendar.moment('2016-06-01');
		const end = $.fullCalendar.moment('2016-06-05');
		const timezone = 'America/New_York';
		let simple, root, event;

		StringUtility.uid.and.returnValues('fancyuid1337', 'Nextcloud-123456.ics');
		SimpleEvent.and.callFake(function() {
			simple = {
				patch: jasmine.createSpy()
			};
			return simple;
		});
		ICalFactory.newEvent.and.callFake(function(uid) {
			root = new ICAL.Component(['vcalendar', [], []]);

			event = new ICAL.Component('vevent');
			root.addSubcomponent(event);
			event.updatePropertyWithValue('uid', uid);
			//add a dummy dtstart, so it's a valid ics
			event.updatePropertyWithValue('dtstart', ICAL.Time.now());

			return root;
		});

		const vevent = VEvent.fromStartEnd(start, end, timezone);

		expect(StringUtility.uid.calls.count()).toEqual(2);
		expect(StringUtility.uid.calls.argsFor(0)).toEqual([]);
		expect(StringUtility.uid.calls.argsFor(1)).toEqual(['Nextcloud', 'ics']);

		expect(SimpleEvent).toHaveBeenCalledWith(event);
		expect(simple.patch).toHaveBeenCalled();
		expect(simple.dtstart.value.toString()).toEqual('Wed Jun 01 2016 00:00:00 GMT+0000');
		expect(simple.dtend.value.toString()).toEqual('Sun Jun 05 2016 00:00:00 GMT+0000');

		delete simple.patch;
		delete simple.dtstart.value;
		delete simple.dtend.value;

		expect(simple).toEqual({
			allDay: true,
			dtstart: {
				type: 'date',
				parameters: {
					zone: 'America/New_York'
				}
			},
			dtend: {
				type: 'date',
				parameters: {
					zone: 'America/New_York'
				}
			}
		});

		expect(vevent.calendar).toEqual(null);
		expect(vevent.comp).toEqual(root);
		expect(vevent.uri).toEqual('Nextcloud-123456.ics');
	});

	it ('should provide a constructor from a start and end - not allday', function() {
		const start = $.fullCalendar.moment.utc('2016-06-01T12:00:00');
		const end = $.fullCalendar.moment.utc('2016-06-01T18:00:00');
		const timezone = 'America/New_York';
		let simple, root, event;

		StringUtility.uid.and.returnValues('fancyuid1337', 'Nextcloud-123456.ics');
		SimpleEvent.and.callFake(function() {
			simple = {
				patch: jasmine.createSpy()
			};
			return simple;
		});
		ICalFactory.newEvent.and.callFake(function(uid) {
			root = new ICAL.Component(['vcalendar', [], []]);

			event = new ICAL.Component('vevent');
			root.addSubcomponent(event);
			event.updatePropertyWithValue('uid', uid);
			//add a dummy dtstart, so it's a valid ics
			event.updatePropertyWithValue('dtstart', ICAL.Time.now());

			return root;
		});

		const vevent = VEvent.fromStartEnd(start, end, timezone);

		expect(StringUtility.uid.calls.count()).toEqual(2);
		expect(StringUtility.uid.calls.argsFor(0)).toEqual([]);
		expect(StringUtility.uid.calls.argsFor(1)).toEqual(['Nextcloud', 'ics']);

		expect(SimpleEvent).toHaveBeenCalledWith(event);
		expect(simple.patch).toHaveBeenCalled();
		expect(simple.dtstart.value.toString()).toEqual('Wed Jun 01 2016 12:00:00 GMT+0000');
		expect(simple.dtend.value.toString()).toEqual('Wed Jun 01 2016 18:00:00 GMT+0000');

		delete simple.patch;
		delete simple.dtstart.value;
		delete simple.dtend.value;

		expect(simple).toEqual({
			allDay: false,
			dtstart: {
				type: 'datetime',
				parameters: {
					zone: 'America/New_York'
				}
			},
			dtend: {
				type: 'datetime',
				parameters: {
					zone: 'America/New_York'
				}
			}
		});

		expect(vevent.calendar).toEqual(null);
		expect(vevent.comp).toEqual(root);
		expect(vevent.uri).toEqual('Nextcloud-123456.ics');
	});

	it ('should provide a constructor from a start and end - mixed - 1', function() {
		const start = $.fullCalendar.moment('2016-06-01');
		const end = $.fullCalendar.moment.utc('2016-06-01T18:00:00');
		const timezone = 'America/New_York';
		let simple, root, event;

		StringUtility.uid.and.returnValues('fancyuid1337', 'Nextcloud-123456.ics');
		SimpleEvent.and.callFake(function() {
			simple = {
				patch: jasmine.createSpy()
			};
			return simple;
		});
		ICalFactory.newEvent.and.callFake(function(uid) {
			root = new ICAL.Component(['vcalendar', [], []]);

			event = new ICAL.Component('vevent');
			root.addSubcomponent(event);
			event.updatePropertyWithValue('uid', uid);
			//add a dummy dtstart, so it's a valid ics
			event.updatePropertyWithValue('dtstart', ICAL.Time.now());

			return root;
		});

		const vevent = VEvent.fromStartEnd(start, end, timezone);

		expect(StringUtility.uid.calls.count()).toEqual(2);
		expect(StringUtility.uid.calls.argsFor(0)).toEqual([]);
		expect(StringUtility.uid.calls.argsFor(1)).toEqual(['Nextcloud', 'ics']);

		expect(SimpleEvent).toHaveBeenCalledWith(event);
		expect(simple.patch).toHaveBeenCalled();
		expect(simple.dtstart.value.toString()).toEqual('Wed Jun 01 2016 00:00:00 GMT+0000');
		expect(simple.dtend.value.toString()).toEqual('Wed Jun 01 2016 18:00:00 GMT+0000');

		delete simple.patch;
		delete simple.dtstart.value;
		delete simple.dtend.value;

		expect(simple).toEqual({
			allDay: false,
			dtstart: {
				type: 'date',
				parameters: {
					zone: 'America/New_York'
				}
			},
			dtend: {
				type: 'datetime',
				parameters: {
					zone: 'America/New_York'
				}
			}
		});

		expect(vevent.calendar).toEqual(null);
		expect(vevent.comp).toEqual(root);
		expect(vevent.uri).toEqual('Nextcloud-123456.ics');
	});

	it ('should provide a constructor from a start and end - mixed - 2', function() {
		const start = $.fullCalendar.moment.utc('2016-06-01T12:00:00');
		const end = $.fullCalendar.moment('2016-06-05');
		const timezone = 'America/New_York';
		let simple, root, event;

		StringUtility.uid.and.returnValues('fancyuid1337', 'Nextcloud-123456.ics');
		SimpleEvent.and.callFake(function() {
			simple = {
				patch: jasmine.createSpy()
			};
			return simple;
		});
		ICalFactory.newEvent.and.callFake(function(uid) {
			root = new ICAL.Component(['vcalendar', [], []]);

			event = new ICAL.Component('vevent');
			root.addSubcomponent(event);
			event.updatePropertyWithValue('uid', uid);
			//add a dummy dtstart, so it's a valid ics
			event.updatePropertyWithValue('dtstart', ICAL.Time.now());

			return root;
		});

		const vevent = VEvent.fromStartEnd(start, end, timezone);

		expect(StringUtility.uid.calls.count()).toEqual(2);
		expect(StringUtility.uid.calls.argsFor(0)).toEqual([]);
		expect(StringUtility.uid.calls.argsFor(1)).toEqual(['Nextcloud', 'ics']);

		expect(SimpleEvent).toHaveBeenCalledWith(event);
		expect(simple.patch).toHaveBeenCalled();
		expect(simple.dtstart.value.toString()).toEqual('Wed Jun 01 2016 12:00:00 GMT+0000');
		expect(simple.dtend.value.toString()).toEqual('Sun Jun 05 2016 00:00:00 GMT+0000');

		delete simple.patch;
		delete simple.dtstart.value;
		delete simple.dtend.value;

		expect(simple).toEqual({
			allDay: false,
			dtstart: {
				type: 'datetime',
				parameters: {
					zone: 'America/New_York'
				}
			},
			dtend: {
				type: 'date',
				parameters: {
					zone: 'America/New_York'
				}
			}
		});

		expect(vevent.calendar).toEqual(null);
		expect(vevent.comp).toEqual(root);
		expect(vevent.uri).toEqual('Nextcloud-123456.ics');
	});

	it ('should correctly sanatize malformed triggers', () => {
		const calendar = {this_is_a_fancy_calendar: true};
		const vevent = VEvent.fromRawICS(calendar, ics12);

		let called = false;

		const start = moment('2017-01-01');
		const end = moment('2017-01-31');

		vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CLASS:PUBLIC
DESCRIPTION: 
DTEND;TZID=Europe/Berlin:20170105T130000
DTSTART;TZID=Europe/Berlin:20170105T120000
DTSTAMP:20170103T150245Z
LAST-MODIFIED:20170103T150246Z
PRIORITY:5
SEQUENCE:1
SUMMARY:Test
TRANSP:OPAQUE
UID:348acb0f-b02f-4800-9fde-202a0717c5b5
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:P0D
END:VALARM
END:VEVENT`.split("\n").join("\r\n"));

			called = true;
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it ('should parse VEvents with recurrence exceptions only', () => {
		const calendar = {this_is_a_fancy_calendar: true};
		const vevent = VEvent.fromRawICS(calendar, ics14);

		let called = false;

		const start = moment('2018-02-25');
		const end = moment('2018-03-03');

		vevent.getFcEvent(start, end, timezone_berlin).then((fcEvents) => {
			expect(fcEvents.length).toEqual(1);
			expect(fcEvents[0][1].toString()).toEqual(`BEGIN:VEVENT
CREATED:20180207T173756Z
UID:77A9ABE1-D203-4E42-808A-05C9BC896455
DTEND;TZID=Europe/Berlin:20180227T100000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:TestEvent
DTSTART;TZID=Europe/Berlin:20180227T090000
DTSTAMP:20180207T173812Z
SEQUENCE:0
RECURRENCE-ID;TZID=Europe/Berlin:20180226T090000
END:VEVENT`.split("\n").join("\r\n"));

			called = true;
		}).catch(() => fail('Promise was not supposed to fail'));

		$rootScope.$apply();

		expect(called).toEqual(true);
	});
});
