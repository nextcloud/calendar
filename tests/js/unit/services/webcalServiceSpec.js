describe('WebCal Service', function () {
	'use strict';

	var WebCalService, $http, ICalSplitterUtility, WebCalUtility, SplittedICal;

	beforeEach(module('Calendar', function ($provide) {
		ICalSplitterUtility = {};
		ICalSplitterUtility.split = jasmine.createSpy();

		WebCalUtility = {};
		WebCalUtility.fixURL = jasmine.createSpy();
		WebCalUtility.buildProxyURL = jasmine.createSpy();
		WebCalUtility.downgradePossible = jasmine.createSpy();
		WebCalUtility.downgradeURL = jasmine.createSpy();

		SplittedICal = {};
		SplittedICal.isSplittedICal = jasmine.createSpy();

		$provide.value('ICalSplitterUtility', ICalSplitterUtility);
		$provide.value('WebCalUtility', WebCalUtility);
		$provide.value('SplittedICal', SplittedICal);

		spyOn(window, 't').and.callThrough();
	}));

	beforeEach(inject(function (_WebCalService_, $httpBackend) {
		WebCalService = _WebCalService_;
		$http = $httpBackend;
	}));

	afterEach(function() {
		$http.verifyNoOutstandingExpectation();
		$http.verifyNoOutstandingRequest();
	});

	it ('should load the url and verify that is\'s a SplittedICal object', function() {
		$http.expect('GET', 'proxyURL').respond(200, 'icsdata');

		WebCalUtility.fixURL.and.returnValue('foobar123');
		WebCalUtility.buildProxyURL.and.returnValue('proxyURL');
		ICalSplitterUtility.split.and.returnValue({v:'splittedObject'});
		SplittedICal.isSplittedICal.and.returnValue(true);

		WebCalService.get('foobar').then(function(result) {
			expect(result).toEqual({v:'splittedObject'});
		});

		expect(WebCalUtility.fixURL).toHaveBeenCalledWith('foobar');
		expect(WebCalUtility.buildProxyURL).toHaveBeenCalledWith('foobar123');

		expect($http.flush).not.toThrow();

		expect(ICalSplitterUtility.split).toHaveBeenCalledWith('icsdata');
		expect(SplittedICal.isSplittedICal).toHaveBeenCalledWith({v:'splittedObject'});
	});

	it ('should throw an error when it\'s not an SplittedICal object', function() {
		$http.expect('GET', 'proxyURL').respond(200, 'icsdata');

		WebCalUtility.fixURL.and.returnValue('foobar123');
		WebCalUtility.buildProxyURL.and.returnValue('proxyURL');
		ICalSplitterUtility.split.and.returnValue({v:'splittedObject'});
		SplittedICal.isSplittedICal.and.returnValue(false);

		WebCalService.get('foobar').then(function(result) {
			expect(true).toBe(false);
		}).catch(function(reason) {
			expect(reason).toEqual('Please enter a valid WebCal-URL');
		});

		expect(WebCalUtility.fixURL).toHaveBeenCalledWith('foobar');
		expect(WebCalUtility.buildProxyURL).toHaveBeenCalledWith('foobar123');

		expect($http.flush).not.toThrow();

		expect(ICalSplitterUtility.split).toHaveBeenCalledWith('icsdata');
		expect(SplittedICal.isSplittedICal).toHaveBeenCalledWith({v:'splittedObject'});
		expect(t).toHaveBeenCalledWith('calendar', 'Please enter a valid WebCal-URL');
	});

	it ('should fallback to http if possible', function() {
		$http.expect('GET', 'proxyURL').respond(500, null);

		WebCalUtility.buildProxyURL.and.returnValue('proxyURL');







		ICalSplitterUtility.split.and.returnValue({v:'splittedObject'});
		SplittedICal.isSplittedICal.and.returnValue(true);
		WebCalUtility.downgradePossible.and.returnValue(true);
		WebCalUtility.downgradeURL.and.returnValue('newProxyURL');

		WebCalService.get('foobar').then(function(result) {
			expect(true).toBe(false);
		}).catch(function(reason) {
			expect(reason).toEqual('Please enter a valid WebCal-URL');
		});

		expect($http.flush).not.toThrow();

		expect(WebCalUtility.buildProxyURL).toHaveBeenCalledWith('foobar');

		$http.expect('GET', 'newProxyURL').respond(200, 'icsdata');





		expect(ICalSplitterUtility.split).toHaveBeenCalledWith('icsdata');
		expect(SplittedICal.isSplittedICal).toHaveBeenCalledWith({v:'splittedObject'});

		//expect($http.flush).not.toThrow();
	});

	it ('should throw an error when fallback is not possible', function() {

	});
});