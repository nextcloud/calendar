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
		var search = 'hans dieter';

		http.expect('POST', 'fancy-url/autocompletion/attendee', { search: search }).respond(200, [{ foo: 'bar' }]);

		AutoCompletionService.searchAttendee(search).then(function(result) {
			expect(result).toEqual([{ foo: 'bar' }]);
		});

		expect(http.flush).not.toThrow();
	});

	it('should load locations from the server', function() {
		var location = 'place 123';

		http.expect('POST', 'fancy-url/autocompletion/location', { location: location }).respond(200, [{ bar: 'foo' }]);

		AutoCompletionService.searchLocation(location).then(function(result) {
			expect(result).toEqual([{ bar: 'foo' }]);
		});

		expect(http.flush).not.toThrow();
	});

});
