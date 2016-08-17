describe('ICalFactory tests', function () {
	'use strict';

	var ICalFactory, spy;

	beforeEach(function () {
		module('Calendar');

		const elemMock = {
			attr: function(name) {
				return name === 'data-appVersion' ? '42.2.4' : null;
			}
		};

		spy = spyOn(angular, 'element').and.returnValue(elemMock);

		inject(function ($injector) {
			ICalFactory = $injector.get('ICalFactory');
		});
	});

	afterEach(function(){
		spy.and.callThrough();
	});

	it ('should return an ICAL object', function() {
		const ical = ICalFactory.new();

		expect(ical.getFirstPropertyValue('version')).toEqual('2.0');
		expect(ical.getFirstPropertyValue('calscale')).toEqual('GREGORIAN');
		expect(ical.getFirstPropertyValue('prodid')).toEqual('-//ownCloud calendar v42.2.4');
	});
});