describe('Settings Service', function () {
	'use strict';

	var SettingsService, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function (_SettingsService_, $httpBackend, $rootScope) {
		SettingsService = _SettingsService_;
		$rootScope.baseUrl = 'fancy-url/';
		http = $httpBackend;
	}));

	afterEach(function() {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});

	it ('should set the view', function() {
		http.expect('POST', 'fancy-url/config', {
			'key': 'view',
			'value': 'foobar'
		}).respond(200, {value: 'month'});

		SettingsService.setView('foobar').then(function(result) {
			expect(result).toBe(true);
		});

		expect(http.flush).not.toThrow();
	});

	it ('should get the view', function() {
		http.expect('GET', 'fancy-url/config?key=view').respond(200, {value: 'month'});

		SettingsService.getView().then(function(result) {
			expect(result).toEqual('month');
		});

		expect(http.flush).not.toThrow();
	});

	it ('should set the skipPopover value', function() {
		http.expect('POST', 'fancy-url/config', {
			'key': 'skipPopover',
			'value': 'yes'
		}).respond(200, {value: 'yes'});

		SettingsService.setSkipPopover('yes').then(function(result) {
			expect(result).toBe(true);
		});

		expect(http.flush).not.toThrow();
	});

	it ('should get the skipPopover value', function() {
		http.expect('GET', 'fancy-url/config?key=skipPopover').respond(200, {value: 'no'});

		SettingsService.getSkipPopover().then(function(result) {
			expect(result).toEqual('no');
		});

		expect(http.flush).not.toThrow();
	});

	it ('should set the showWeekNr value', function() {
		http.expect('POST', 'fancy-url/config', {
			'key': 'showWeekNr',
			'value': 'yes'
		}).respond(200, {value: 'yes'});

		SettingsService.setShowWeekNr('yes').then(function(result) {
			expect(result).toBe(true);
		});

		expect(http.flush).not.toThrow();
	});

	it ('should get the showWeekNr value', function() {
		http.expect('GET', 'fancy-url/config?key=showWeekNr').respond(200, {value: 'no'});

		SettingsService.getShowWeekNr().then(function(result) {
			expect(result).toEqual('no');
		});

		expect(http.flush).not.toThrow();
	});

	it ('should tell the server about the first run', function() {
		http.expect('POST', 'fancy-url/config', {
			'key': 'firstRun'
		}).respond(200, {value: 'yes'});

		let called = false;
		SettingsService.passedFirstRun().then(function(result) {
			called = true;
		});

		expect(http.flush).not.toThrow();
		expect(called).toEqual(true);
	});

	it ('should set the timezone value', function() {
		http.expect('POST', 'fancy-url/config', {
			'key': 'timezone',
			'value': 'Europe/Berlin'
		}).respond(200, {});

		SettingsService.setTimezone('Europe/Berlin').then(function(result) {
			expect(result).toBe(true);
		});

		expect(http.flush).not.toThrow();
	});

	it ('should get the timezone value', function() {
		http.expect('GET', 'fancy-url/config?key=timezone').respond(200, {value: 'Europe/Berlin'});

		SettingsService.getTimezone().then(function(result) {
			expect(result).toEqual('Europe/Berlin');
		});

		expect(http.flush).not.toThrow();
	});
});
