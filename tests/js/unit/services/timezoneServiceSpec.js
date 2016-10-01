describe('Timezone Service', function () {
	'use strict';

	var TimezoneService, http, $rootScope, Timezone;

	beforeEach(module('Calendar', function ($provide) {
		Timezone = jasmine.createSpy().and.callFake(function() {
			return {
				data: arguments[0]
			};
		});

		OC.requestToken = 'requestToken42';

		$provide.value('Timezone', Timezone);
	}));


	beforeEach(inject(function (_TimezoneService_, $httpBackend, _$rootScope_) {
		TimezoneService = _TimezoneService_;
		$rootScope = _$rootScope_;
		$rootScope.baseUrl = 'fancy-url/';
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

	it('should list all timezones', function() {
		let called = false;

		TimezoneService.listAll().then(function(list) {
			expect(Array.isArray(list));
			expect(list.length).toEqual(436);
			called = true;
		});

		window.setTimeout(function() {
			expect(called).toBe(true);
		}, 100);
	});
});
