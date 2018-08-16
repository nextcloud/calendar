describe('Timezone Service', function () {
	'use strict';

	let $q, $rootScope;
	let TimezoneService, Timezone, TimezoneDataProvider;

	beforeEach(module('Calendar', function ($provide) {
		Timezone = jasmine.createSpy().and.callFake(function() {
			return {
				data: arguments[0]
			};
		});

		TimezoneDataProvider = {
			aliases: {
				"Africa/Asmera": {
					"aliasTo": "Africa/Asmara"
				},
				"Africa/Timbuktu": {
					"aliasTo": "Africa/Bamako"
				},
				"Etc/UTC": {
					"aliasTo": "UTC"
				},
				"W. Europe Standard Time": {
					"aliasTo": "Europe/Berlin"
				},
				"Z": {
					"aliasTo": "UTC"
				}
			},
			zones: {
				"America/New_York": {
					"ics": "BEGIN:VTIMEZONE\r\nTZID:America/New_York\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:-0500\r\nTZOFFSETTO:-0400\r\nTZNAME:EDT\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:-0400\r\nTZOFFSETTO:-0500\r\nTZNAME:EST\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE",
					"latitude": "+0404251",
					"longitude": "-0740023"
				},
				"Europe/Berlin": {
					"ics": "BEGIN:VTIMEZONE\r\nTZID:Europe/Berlin\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nTZNAME:CEST\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nTZNAME:CET\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE",
					"latitude": "+0523000",
					"longitude": "+0132200"
				},
				"Europe/Busingen": {
					"ics": "BEGIN:VTIMEZONE\r\nTZID:Europe/Busingen\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nTZNAME:CEST\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nTZNAME:CET\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE",
					"latitude": "+0474200",
					"longitude": "+0084100"
				},
				"Europe/Vienna": {
					"ics": "BEGIN:VTIMEZONE\r\nTZID:Europe/Vienna\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nTZNAME:CEST\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nTZNAME:CET\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE",
					"latitude": "+0481300",
					"longitude": "+0162000"
				}
			}
		};

		$provide.value('TimezoneDataProvider', TimezoneDataProvider);
		$provide.value('Timezone', Timezone);
	}));

	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;
		$rootScope.baseUrl = 'fancy-url/';

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}
	}));

	beforeEach(inject(function (_TimezoneService_) {
		TimezoneService = _TimezoneService_;
	}));

	it('should should get the current timezone id', function() {
		jstz.determine = jasmine.createSpy().and.returnValues(
			{name: () => 'Europe/Berlin'}, {name: () => 'UTC'}, {name: () => 'Etc/UTC'});

		expect(TimezoneService.getDetected()).toEqual('Europe/Berlin');
		expect(TimezoneService.getDetected()).toEqual('UTC');
		expect(TimezoneService.getDetected()).toEqual('UTC');
	});

	it('should get a timezone', function() {
		const tzid = 'Europe/Berlin';
		let called = false;

		TimezoneService.get(tzid).then(function(result) {
			expect(Timezone.calls.count()).toEqual(1);
			expect(Timezone.calls.argsFor(0)).toEqual([`BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`.split("\n").join("\r\n")]);
			called = true;
		});

		$rootScope.$apply();

		expect(called).toEqual(true);
	});

	it('should not send requests for unknown timezones', function() {
		let called = false;

		const tzid = 'Europe/New_York';
		TimezoneService.get(tzid).then(function(result) {
			fail('not supposed to succeed');
		}).catch(function(reason) {
			called = true;
			expect(reason).toEqual('Unknown timezone');
		});

		$rootScope.$apply();

		expect(called).toEqual(true);

	});

	it('should list all timezones', function() {
		let called = false;

		TimezoneService.listAll().then(function(list) {
			expect(Array.isArray(list));
			expect(list.length).toEqual(7);
			called = true;
		});

		$rootScope.$apply();
		expect(called).toBe(true);
	});
});
