describe('The SimpleEvent factory', function () {
	'use strict';

	let SimpleEvent;

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

	beforeEach(module('Calendar', function() {
		spyOn(ICAL.TimezoneService, 'register').and.callThrough();

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

		const tzNYC = new ICAL.Timezone(new ICAL.Component(ICAL.parse(`BEGIN:VTIMEZONE
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
END:VTIMEZONE`)));
		ICAL.TimezoneService.register('America/New_York', tzNYC);
	}));

	beforeEach(inject(function (_SimpleEvent_) {
		SimpleEvent = _SimpleEvent_;
	}));

	it ('should initialize correctly', function() {
		const root = new ICAL.Component(ICAL.parse(ics1));
		const event = root.getFirstSubcomponent('vevent');

		expect(() => SimpleEvent(event)).not.toThrow();
	});

	it ('should check if it\'s an SimpleEvent object', function() {
		expect(SimpleEvent.isSimpleEvent({})).toBe(false);
		expect(SimpleEvent.isSimpleEvent(true)).toBe(false);
		expect(SimpleEvent.isSimpleEvent(false)).toBe(false);
		expect(SimpleEvent.isSimpleEvent(123)).toBe(false);
		expect(SimpleEvent.isSimpleEvent('asd')).toBe(false);

		expect(SimpleEvent.isSimpleEvent({
			_isASimpleEventObject: true
		})).toBe(true);
	});

	it ('should patch an object once', function() {
		const root = new ICAL.Component(ICAL.parse(ics1));
		const event = root.getFirstSubcomponent('vevent');

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		const simple = SimpleEvent(event);
		simple.summary.value = 'Altered title take one';

		simple.patch();
		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
TRANSP:OPAQUE
SUMMARY:Altered title take one
DTSTAMP:20160809T163632Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160816T090000
DTEND;TZID=Europe/Berlin:20160816T100000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should not patch an object twice', function() {
		const root = new ICAL.Component(ICAL.parse(ics1));
		const event = root.getFirstSubcomponent('vevent');

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
DTEND;TZID=Europe/Berlin:20160816T100000
TRANSP:OPAQUE
SUMMARY:Test
DTSTART;TZID=Europe/Berlin:20160816T090000
DTSTAMP:20160809T163632Z
SEQUENCE:0
END:VEVENT`.split("\n").join("\r\n"));

		const simple = SimpleEvent(event);
		simple.summary.value = 'Altered title take one';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
TRANSP:OPAQUE
SUMMARY:Altered title take one
DTSTAMP:20160809T163632Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160816T090000
DTEND;TZID=Europe/Berlin:20160816T100000
END:VEVENT`.split("\n").join("\r\n"));

		simple.summary.value = 'Altered title take two';
		expect(() => simple.patch()).toThrowError(Error, 'SimpleEvent was already patched, patching not possible');

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20160809T163629Z
UID:0AD16F58-01B3-463B-A215-FD09FC729A02
TRANSP:OPAQUE
SUMMARY:Altered title take one
DTSTAMP:20160809T163632Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160816T090000
DTEND;TZID=Europe/Berlin:20160816T100000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add a summary', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.summary).toEqual(null);

		simple.summary = {
			value: 'This is a dummy summary'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
SEQUENCE:0
SUMMARY:This is a dummy summary
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the summary', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SUMMARY:foobar
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.summary).toEqual({
			parameters: {},
			type: 'text',
			value: 'foobar'
		});

		simple.summary.value = 'barfoo';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
SUMMARY:barfoo
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the summary', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SUMMARY:foobar
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.summary = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add a location', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.summary).toEqual(null);

		simple.location = {
			value: 'Location 123'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
SEQUENCE:0
LOCATION:Location 123
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the location', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
LOCATION:Location 123
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.location).toEqual({
			parameters: {},
			type: 'text',
			value: 'Location 123'
		});

		simple.location.value = 'Location 456';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
LOCATION:Location 456
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the location', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161004T144437Z
LOCATION:foobar
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.location = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161004T144433Z
UID:85560E76-1B0D-47E1-A735-21625767FCA4
TRANSP:TRANSPARENT
DTSTAMP:20161004T144437Z
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add an attendee', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.attendee = [{
			group: -1,
			parameters: {
				cutype: 'INDIVIDUAL',
				cn: 'bar@foo.com',
			},
			type: 'cal-address',
			value: 'mailto:bar@foo.com'
		}];
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add multiple attendee', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.attendee = [
			{
				group: -1,
				parameters: {
					cutype: 'INDIVIDUAL',
					cn: 'bar@foo.com',
				},
				type: 'cal-address',
				value: 'mailto:bar@foo.com'
			},
			{
				group: -2,
				parameters: {
					cutype: 'INDIVIDUAL',
					cn: 'foo@bar.com',
				},
				type: 'cal-address',
				value: 'mailto:foo@bar.com'

			}
		];
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
ATTENDEE;CUTYPE=INDIVIDUAL;CN=foo@bar.com:mailto:foo@bar.com
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));

	});

	it ('should modify an attendee', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.attendee).toEqual([{
			group: 0,
			parameters: {
				role: undefined,
				rvsp: undefined,
				partstat: undefined,
				cutype: 'INDIVIDUAL',
				cn: 'bar@foo.com',
				'delegated-from': undefined,
				'delegated-to': undefined
			},
			type: 'cal-address',
			value: 'mailto:bar@foo.com'
		}]);

		simple.attendee[0].parameters.cn = 'bar789@foo.com';
		simple.attendee[0].value = 'mailto:bar123@foo.com';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar789@foo.com:mailto:bar123@foo.com
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify an attendee without altering the other ones', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
ATTENDEE;CN="bar@foo.com";CUTYPE=INDIVIDUAL;EMAIL="bar@foo.com":mailto:bar@foo.com
ATTENDEE;CN="foo@bar.com";CUTYPE=INDIVIDUAL;EMAIL="foo@bar.com":mailto:foo@bar.com
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.attendee).toEqual([
			{
				group: 0,
				parameters: {
					role: undefined,
					rvsp: undefined,
					partstat: undefined,
					cutype: 'INDIVIDUAL',
					cn: 'bar@foo.com',
					'delegated-from': undefined,
					'delegated-to': undefined
				},
				type: 'cal-address',
				value: 'mailto:bar@foo.com'
			},{
				group: 1,
				parameters: {
					role: undefined,
					rvsp: undefined,
					partstat: undefined,
					cutype: 'INDIVIDUAL',
					cn: 'foo@bar.com',
					'delegated-from': undefined,
					'delegated-to': undefined
				},
				type: 'cal-address',
				value: 'mailto:foo@bar.com'
			}
		]);

		simple.attendee[0].parameters.cn = 'bar789@foo.com';
		simple.attendee[0].value = 'mailto:bar123@foo.com';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
ATTENDEE;CN=bar789@foo.com;CUTYPE=INDIVIDUAL;EMAIL=bar@foo.com:mailto:bar12
 3@foo.com
ATTENDEE;CN=foo@bar.com;CUTYPE=INDIVIDUAL;EMAIL=foo@bar.com:mailto:foo@bar.
 com
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete an attendee', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.attendee = [];
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete an attendee without altering/deleting the other ones', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
ATTENDEE;CN="bar@foo.com";CUTYPE=INDIVIDUAL;EMAIL="bar@foo.com":mailto:bar@foo.com
ATTENDEE;CN="foo@bar.com";CUTYPE=INDIVIDUAL;EMAIL="foo@bar.com":mailto:foo@bar.com
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.attendee.splice(0, 1);
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
ATTENDEE;CN=foo@bar.com;CUTYPE=INDIVIDUAL;EMAIL=foo@bar.com:mailto:foo@bar.
 com
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:test
DTSTAMP:20161005T070816Z
SEQUENCE:0
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add an organizer', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.organizer = {
			parameters: {
				cn: 'Señor Foobar'
			},
			type: 'cal-address',
			value: 'mailto:foo@bar.com'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
ORGANIZER;CN=Señor Foobar:mailto:foo@bar.com
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the organizer', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
ORGANIZER;CN="Señor Foobar":mailto:foo@bar.com
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.organizer).toEqual({
			parameters: {
				cn: "Señor Foobar"
			},
			type: 'cal-address',
			value: 'mailto:foo@bar.com'
		});
		simple.organizer.parameters.cn = 'Señor Barfoo';
		simple.organizer.value = 'mailto:bar@foo.com';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
ORGANIZER;CN=Señor Barfoo:mailto:bar@foo.com
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the organizer', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
ORGANIZER;CN="Señor Foobar":mailto:foo@bar.com
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.organizer = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add a class', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.class = {
			value: 'PUBLIC'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
CLASS:PUBLIC
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the class', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
CLASS:PUBLIC
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.class).toEqual({
			parameters: {},
			type: 'text',
			value: 'PUBLIC'
		});
		simple.class.value = 'CONFIDENTIAL';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
CLASS:CONFIDENTIAL
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the class', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
CLASS:PUBLIC
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.class = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add a description', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.description = {
			value: 'Description 123'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DESCRIPTION:Description 123
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the description', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DESCRIPTION:Description 123
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.description).toEqual({
			parameters: {},
			type: 'text',
			value: 'Description 123'
		});
		simple.description.value = 'description 3.1415926536';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DESCRIPTION:description 3.1415926536
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the description', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DESCRIPTION:description 3.1415926536
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.description = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add a status', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.status = {
			value: 'TENTATIVE'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
STATUS:TENTATIVE
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the status', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
STATUS:TENTATIVE
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.status).toEqual({
			parameters: {},
			type: 'text',
			value: 'TENTATIVE'
		});
		simple.status.value = 'CANCELLED';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
STATUS:CANCELLED
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the status', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
STATUS:CANCELLED
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.status = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add an alarm', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
DTEND;VALUE=DATE:20161006
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20161005
DTSTAMP:20161005T070816Z
END:VEVENT
END:VCALENDAR`;
		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.alarm = [{
			group: -1,
			action: {
				value: 'DISPLAY'
			},
			trigger: {
				type: 'duration',
				value: -60,
				related: 'end'
			}
		}];
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
ACTION:DISPLAY
TRIGGER:-PT1M
END:VALARM
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should add multiple alarm', function() {

	});

	it ('should modify an alarm', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
X-WR-ALARMUID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
UID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
TRIGGER:-PT15H
ATTACH;VALUE=URI:Basso
X-APPLE-LOCAL-DEFAULT-ALARM:TRUE
ACTION:AUDIO
X-APPLE-DEFAULT-ALARM:TRUE
REPEAT:4
DURATION:PT5M
END:VALARM
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.alarm).toEqual([{
			group: 0,
			action: {
				parameters: {},
				type: 'text',
				value: 'AUDIO'
			},
			trigger: {
				parameters: {
					tzid: undefined
				},
				type: 'duration',
				value: -54000,
				related: 'start'
			},
			repeat: {
				parameters: {},
				type: 'integer',
				value: 4
			},
			duration: {
				parameters: {
					tzid: undefined
				},
				type: 'duration',
				value: 300
			},
			attendee: []
		}]);

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
X-WR-ALARMUID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
UID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
TRIGGER:-PT15H
ATTACH:Basso
X-APPLE-LOCAL-DEFAULT-ALARM:TRUE
ACTION;X-NC-GROUP-ID=0:AUDIO
X-APPLE-DEFAULT-ALARM:TRUE
REPEAT:4
DURATION:PT5M
END:VALARM
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify an alarm without altering the others', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
TRIGGER:-PT15H
ATTACH;VALUE=URI:Basso
ACTION:AUDIO
REPEAT:4
DURATION:PT5M
END:VALARM
BEGIN:VALARM
TRIGGER;VALUE=DATE-TIME:19970317T133000Z
ATTACH;VALUE=URI:Basso
ACTION:E-MAIL
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
END:VALARM
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		expect(simple.alarm[1].trigger.value.utc().toISOString()).toEqual('1997-03-17T13:30:00.000Z');
		expect(simple.alarm).toEqual([
			{
				group: 0,
				action: {
					parameters: {},
					type: 'text',
					value: 'AUDIO'
				},
				trigger: {
					parameters: {
						tzid: undefined
					},
					type: 'duration',
					value: -54000,
					related: 'start'
				},
				repeat: {
					parameters: {},
					type: 'integer',
					value: 4
				},
				duration: {
					parameters: {
						tzid: undefined
					},
					type: 'duration',
					value: 300
				},
				attendee: []
			},
			{
				group: 1,
				action: {
					parameters: {},
					type: 'text',
					value: 'E-MAIL'
				},
				trigger: {
					parameters: {
						tzid: undefined
					},
					type: 'date-time',
					value: simple.alarm[1].trigger.value
				},
				repeat: {},
				duration: {},
				attendee: [{
					group: 0,
					parameters: {
						role: undefined,
						rvsp: undefined,
						partstat: undefined,
						cutype: 'INDIVIDUAL',
						cn: 'bar@foo.com',
						'delegated-from': undefined,
						'delegated-to': undefined
					},
					type: 'cal-address',
					value: 'mailto:bar@foo.com'
				}]
			}
		]);

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
TRIGGER:-PT15H
ATTACH:Basso
ACTION;X-NC-GROUP-ID=0:AUDIO
REPEAT:4
DURATION:PT5M
END:VALARM
BEGIN:VALARM
TRIGGER;VALUE=DATE-TIME:19970317T133000Z
ATTACH:Basso
ACTION;X-NC-GROUP-ID=1:E-MAIL
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com;X-NC-GROUP-ID=0:mailto:bar@foo.co
 m
END:VALARM
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete an alarm', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
X-WR-ALARMUID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
UID:3E4958EA-2DA7-43BF-9A32-3B98F5E80B9D
TRIGGER:-PT15H
ATTACH;VALUE=URI:Basso
X-APPLE-LOCAL-DEFAULT-ALARM:TRUE
ACTION:AUDIO
X-APPLE-DEFAULT-ALARM:TRUE
REPEAT:4
DURATION:PT5M
END:VALARM
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.alarm = [];
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
END:VEVENT`.split("\n").join("\r\n"));


	});

	it ('should delete an alarm without altering the others', function() {
		// TODO - add `TRIGGER;VALUE=DATE-TIME:19970317T133000Z` again, is blocked by https://github.com/mozilla-comm/ical.js/issues/260
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
TRIGGER:-PT15H
ATTACH;VALUE=URI:Basso
ACTION:AUDIO
REPEAT:4
DURATION:PT5M
END:VALARM
BEGIN:VALARM
ATTACH;VALUE=URI:Basso
ACTION:E-MAIL
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
END:VALARM
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.alarm.splice(0, 1);
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161005T065602Z
UID:739C62D9-F457-4C75-85C4-4F376CA1E976
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161005T070816Z
DTSTART;VALUE=DATE:20161005
DTEND;VALUE=DATE:20161006
BEGIN:VALARM
ATTACH:Basso
ACTION:E-MAIL
ATTENDEE;CUTYPE=INDIVIDUAL;CN=bar@foo.com:mailto:bar@foo.com
END:VALARM
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should parse DTSTART and DTEND', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161002T105542Z
UID:DF8A5F8D-9037-4FA3-84CC-97FB6D5D0DA9
DTEND;TZID=Europe/Berlin:20161004T113000
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 1
DTSTART;TZID=Europe/Berlin:20161004T090000
DTSTAMP:20161002T105552Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.dtstart.value.toString().substr(0, 24)).toEqual('Tue Oct 04 2016 09:00:00');
		delete simple.dtstart.value;
		expect(simple.dtend.value.toString().substr(0, 24)).toEqual('Tue Oct 04 2016 11:30:00');
		delete simple.dtend.value;

		expect(simple.dtstart).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
		expect(simple.dtend).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
	});

	it ('should parse DTSTART and DURATION', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161002T105555Z
UID:C8E094B8-A7E6-4CF3-9E59-58608B9B61C5
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 2
DTSTART;TZID=Europe/Berlin:20160925T000000
DURATION:P15DT5H0M20S
DTSTAMP:20161002T105633Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.dtstart.value.toString().substr(0, 24)).toEqual('Sun Sep 25 2016 00:00:00');
		delete simple.dtstart.value;
		expect(simple.dtend.value.toString().substr(0, 24)).toEqual('Mon Oct 10 2016 05:00:00');
		delete simple.dtend.value;

		expect(simple.dtstart).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
		expect(simple.dtend).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
	});

	it ('should parse DTSTART only', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161002T105635Z
UID:9D0C33D1-334E-4B46-9E0E-D62C11E60700
TRANSP:OPAQUE
X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC
SUMMARY:Event 3
DTSTART;TZID=Europe/Berlin:20161105T235900
DTSTAMP:20161002T105648Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.dtstart.value.toString().substr(0, 24)).toEqual('Sat Nov 05 2016 23:59:00');
		delete simple.dtstart.value;
		expect(simple.dtend.value.toString().substr(0, 24)).toEqual('Sat Nov 05 2016 23:59:00');
		delete simple.dtend.value;

		expect(simple.dtstart).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
		expect(simple.dtend).toEqual({
			parameters: {
				zone: 'Europe/Berlin'
			},
			type: 'date-time'
		});
	});

	it ('should parse value date', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.dtstart.value.toString().substr(0, 24)).toEqual('Tue Sep 27 2016 00:00:00');
		delete simple.dtstart.value;
		expect(simple.dtend.value.toString().substr(0, 24)).toEqual('Wed Sep 28 2016 00:00:00');
		delete simple.dtend.value;

		expect(simple.dtstart).toEqual({
			parameters: {
				zone: 'floating'
			},
			type: 'date'
		});
		expect(simple.dtend).toEqual({
			parameters: {
				zone: 'floating'
			},
			type: 'date'
		});
	});

	it ('should modify the general date-time information date -> datetime', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		simple.dtstart.parameters.zone = 'Europe/Berlin';
		simple.dtstart.type = 'date-time';
		simple.dtstart.value.add(15, 'hours').add(30, 'minutes');
		simple.dtend.parameters.zone = 'Europe/Berlin';
		simple.dtend.type = 'date-time';
		simple.dtend.value.add(16, 'hours');

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> date remove timezone', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.type = 'date';
		simple.dtend.type = 'date';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;VALUE=DATE:20160927
DTEND;VALUE=DATE:20160928
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> datetime different timezone', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'America/New_York';
		simple.dtend.parameters.zone = 'America/New_York';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=America/New_York:20160927T153000
DTEND;TZID=America/New_York:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> datetime tz to floating', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'floating';
		simple.dtend.parameters.zone = 'floating';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000
DTEND:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> datetime floating to tz', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000
DTEND:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'Europe/Berlin';
		simple.dtend.parameters.zone = 'Europe/Berlin';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> datetime UTC to floating', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000Z
DTEND:20160928T160000Z
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'floating';
		simple.dtend.parameters.zone = 'floating';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000
DTEND:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should modify the general date-time information datetime -> datetime floating to UTC', function() {
		//TODO - fix me
/*		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000
DTEND:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'UTC';
		simple.dtend.parameters.zone = 'UTC';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000Z
DTEND:20160928T160000Z
END:VEVENT`.split("\n").join("\r\n"));*/
	});

	it ('should modify the general date-time information datetime -> datetime tz to UTC', function() {
		//TODO - fix me
/*		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'UTC';
		simple.dtend.parameters.zone = 'UTC';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000Z
DTEND:20160928T160000Z
END:VEVENT`.split("\n").join("\r\n"));*/
	});

	it ('should modify the general date-time information datetime -> datetime UTC to tz', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART:20160927T153000Z
DTEND:20160928T160000Z
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.dtstart.parameters.zone = 'Europe/Berlin';
		simple.dtend.parameters.zone = 'Europe/Berlin';

		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;TZID=Europe/Berlin:20160927T153000
DTEND;TZID=Europe/Berlin:20160928T160000
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should parse the repating information - no end', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=1SU,-1SU
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.repeating).toEqual(true);
		expect(simple.rrule).toEqual({
			count: null,
			freq: 'MONTHLY',
			interval: 2,
			parameters: {
				BYDAY: ['1SU', '-1SU']
			},
			until: null
		});
	});

	it ('should parse the repating information - count', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		expect(simple.rrule).toEqual({
			count: 10,
			freq: 'WEEKLY',
			interval: 1,
			parameters: {},
			until: null
		});
	});

	it ('should parse the repating information - until', function() {
		//TODO - UNTIL is not implemented yet
/*		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;UNTIL=20161012T140000Z;WKST=SU;BYDAY=TU,TH
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		fail('FIX ME');*/
	});

	it ('should add the repeating information', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		simple.rrule = {
			count: 10,
			freq: 'WEEKLY'
		};
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;VALUE=DATE:20160927
DTEND;VALUE=DATE:20160928
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT`.split("\n").join("\r\n"));

	});

	it ('should modify the repeating information', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		//TODO - also test with altered parameters
		//not supported yet though
		simple.rrule = {
			count: 5,
			freq: 'MONTHLY',
			interval: 2
		};

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should not modify the repeating information when the dontTouch flag is set', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);

		simple.rrule = {
			dontTouch: true,
			count: 5,
			freq: 'MONTHLY',
			interval: 2
		};

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the repeating information - with null', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.rrule = null;
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;VALUE=DATE:20160927
DTEND;VALUE=DATE:20160928
END:VEVENT`.split("\n").join("\r\n"));
	});

	it ('should delete the repeating information - with freq none', function() {
		const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
DTEND;VALUE=DATE:20160928
TRANSP:TRANSPARENT
SUMMARY:test
DTSTART;VALUE=DATE:20160927
DTSTAMP:20161012T140135Z
SEQUENCE:0
RRULE:FREQ=WEEKLY;COUNT=10
END:VEVENT
END:VCALENDAR`;

		const root = new ICAL.Component(ICAL.parse(ics));
		const event = root.getFirstSubcomponent('vevent');

		const simple = SimpleEvent(event);
		simple.rrule.freq = 'NONE';
		simple.patch();

		expect(event.toString()).toEqual(`BEGIN:VEVENT
CREATED:20161012T140129Z
UID:22F1E592-FB25-4A9D-AE15-BA2A367EA428
TRANSP:TRANSPARENT
SUMMARY:test
DTSTAMP:20161012T140135Z
SEQUENCE:0
DTSTART;VALUE=DATE:20160927
DTEND;VALUE=DATE:20160928
END:VEVENT`.split("\n").join("\r\n"));
	});
});
