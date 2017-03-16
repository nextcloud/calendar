describe('Timezone Service', function () {
	'use strict';

	let $q, $rootScope;
	let TimezoneService, http, Timezone;

	beforeEach(module('Calendar', function ($provide) {
		Timezone = jasmine.createSpy().and.callFake(function() {
			return {
				data: arguments[0]
			};
		});

		OC.requestToken = 'requestToken42';

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

	beforeEach(inject(function (_TimezoneService_, $httpBackend) {
		TimezoneService = _TimezoneService_;
		http = $httpBackend;
	}));

	afterEach(function () {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});

	it('should should get the current timezone id', function() {
		jstz.determine = jasmine.createSpy().and.returnValues(
			{name: () => 'Europe/Berlin'}, {name: () => 'UTC'}, {name: () => 'Etc/UTC'});

		expect(TimezoneService.current()).toEqual('Europe/Berlin');
		expect(TimezoneService.current()).toEqual('UTC');
		expect(TimezoneService.current()).toEqual('UTC');
	});

	it('should get a timezone and store it locally', function() {
		http.expect('GET', 'fancy-url/timezones/EUROPE/BERLIN.ics').respond(200, '*tzdata*');

		const tzid = 'Europe/Berlin';
		TimezoneService.get(tzid).then(function(result) {
			expect(result.data).toEqual('*tzdata*');
			expect(Timezone.calls.count()).toEqual(3);
			expect(Timezone.calls.argsFor(2)).toEqual(['*tzdata*']);
		});

		expect(http.flush).not.toThrow();

		TimezoneService.get(tzid).then(function(result) {
			expect(result.data).toEqual('*tzdata*');
		});
	});

	it('should not send two requests for the same timezone', function() {
		http.expect('GET', 'fancy-url/timezones/EUROPE/BERLIN.ics').respond(200, '*tzdata*');

		const tzid = 'Europe/Berlin';
		const promise1 = TimezoneService.get(tzid);
		const promise2 = TimezoneService.get(tzid);

		expect(promise1).toEqual(promise2);

		expect(() => http.flush(1)).not.toThrow();
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

		// throw because no pending requests
		expect(http.flush).toThrow();

		expect(called).toEqual(true);

	});

	it('should list all timezones', function() {
		let called = false;

		TimezoneService.listAll().then(function(list) {
			expect(Array.isArray(list));
			expect(list.length).toEqual(436);
			called = true;
		});

		$rootScope.$apply();
		expect(called).toBe(true);
	});
});
