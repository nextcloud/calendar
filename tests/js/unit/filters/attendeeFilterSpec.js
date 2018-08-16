describe('The attendeeFilter filter', function () {
	'use strict';

	var filter;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			filter = $injector.get('$filter')('attendeeFilter');
		});
	});

	it('should be able to handle null', function() {
		expect(filter(null)).toEqual('');
	});

	it('should be able to handle undefined', function() {
		expect(filter()).toEqual('');
	});

	it('should be able to handle empty object', function() {
		expect(filter({})).toEqual('');
	});

	it('should display the CN if available', function() {
		expect(filter({
			parameters: {
				cn: 'Jon Doe'
			},
			value: 'Not Jon Doe'
		})).toEqual('Jon Doe');
	});

	it('should show the properties value if no CN is given', function() {
		expect(filter({
			parameters: {
				foo: 'Not Jon Doe'
			},
			value: 'Jon Doe'
		})).toEqual('Jon Doe');
	});

	it('should show the properties value without MAILTO: if no CN is given', function() {
		expect(filter({
			parameters: {
				foo: 'Not Jon Doe'
			},
			value: 'MAILTO:Jon Doe'
		})).toEqual('Jon Doe');
	});
});

