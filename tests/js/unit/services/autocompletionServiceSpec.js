describe('AutoCompletion Service', function () {
	'use strict';

	var AutoCompletionService, http;

	beforeEach(module('Calendar'));

	beforeEach(inject(function (_AutoCompletionService_, $httpBackend, $rootScope) {
		AutoCompletionService = _AutoCompletionService_;
		$rootScope.baseUrl = 'fancy-url/';
		http = $httpBackend;
	}));

	afterEach(function() {
		http.verifyNoOutstandingExpectation();
		http.verifyNoOutstandingRequest();
	});

	it('should load attendees from the server', function() {
		http.expect('GET', 'fancy-url/autocompletion/attendee?search=hans+dieter').respond(200, [{ foo: 'bar' }]);

		AutoCompletionService.searchAttendee('hans dieter').then(function(result) {
			expect(result).toEqual([{ foo: 'bar' }]);
		});

		expect(http.flush).not.toThrow();
	});

	it('should load locations from the server', function() {
		http.expect('GET', 'fancy-url/autocompletion/location?location=place+123').respond(200, [{ bar: 'foo' }]);

		AutoCompletionService.searchLocation('place 123').then(function(result) {
			expect(result).toEqual([{ bar: 'foo' }]);
		});

		expect(http.flush).not.toThrow();
	});

});
