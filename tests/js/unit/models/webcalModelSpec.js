describe('The webcal factory', function () {
	'use strict';

	var WebCal, $http, Calendar, VEvent, TimezoneService, WebCalService, WebCalUtility, fcAPI;

	beforeEach(module('Calendar', function ($provide) {
		Calendar = jasmine.createSpy().and.returnValue({
			addWarning: jasmine.createSpy(),
			emit: jasmine.createSpy(),
			fcEventSource: {}
		});

		VEvent = jasmine.createSpy().and.returnValue({
			getFcEvent: jasmine.createSpy()
		});

		TimezoneService = {};
		TimezoneService.get = jasmine.createSpy();

		WebCalService = {};
		WebCalService.get = jasmine.createSpy();

		WebCalUtility = {};
		WebCalUtility.fixURL = jasmine.createSpy();

		$provide.value('$http', $http);
		$provide.value('Calendar', Calendar);
		$provide.value('VEvent', VEvent);
		$provide.value('TimezoneService', TimezoneService);
		$provide.value('WebCalService', WebCalService);
		$provide.value('WebCalUtility', WebCalUtility);

		fcAPI = {
			clientEvents: jasmine.createSpy(),
			reportEvents: jasmine.createSpy()
		};
	}));

	beforeEach(inject(function (_WebCal_) {
		WebCal = _WebCal_;
	}));
});