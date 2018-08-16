describe('ICalFactory tests', function () {
	'use strict';

	var ICalFactory, constants;

	beforeEach(module('Calendar', function($provide) {

		constants = {
			version: '42.2.4'
		};

		$provide.value('constants', constants);
	}));

	beforeEach(inject(function (_ICalFactory_) {
		ICalFactory = _ICalFactory_;
	}));

	it ('should return an ICAL object', function() {
		const ical = ICalFactory.new();

		expect(ical.getFirstPropertyValue('version')).toEqual('2.0');
		expect(ical.getFirstPropertyValue('calscale')).toEqual('GREGORIAN');
		expect(ical.getFirstPropertyValue('prodid')).toEqual('-//Nextcloud calendar v42.2.4');
	});

	it ('should return an ICAL object with an event in it', function() {
		const baseTime = new Date(2016, 0, 1);
		jasmine.clock().mockDate(baseTime);

		const uid = 'foobar';

		const ical = ICalFactory.newEvent(uid);
		expect(ical.getFirstPropertyValue('version')).toEqual('2.0');
		expect(ical.getFirstPropertyValue('calscale')).toEqual('GREGORIAN');
		expect(ical.getFirstPropertyValue('prodid')).toEqual('-//Nextcloud calendar v42.2.4');

		const components = ical.getAllSubcomponents();
		expect(components.length).toEqual(1);

		expect(components[0].name).toEqual('vevent');
		expect(components[0].getAllProperties().length).toEqual(5);

		expect(components[0].getFirstPropertyValue('created').toString()).toEqual('2016-01-01T00:00:00');
		expect(components[0].getFirstPropertyValue('dtstamp').toString()).toEqual('2016-01-01T00:00:00');
		expect(components[0].getFirstPropertyValue('last-modified').toString()).toEqual('2016-01-01T00:00:00');
		expect(components[0].getFirstPropertyValue('uid')).toEqual('foobar');
		expect(components[0].getFirstPropertyValue('dtstart').toString()).toEqual('2016-01-01T00:00:00');
	});
});
