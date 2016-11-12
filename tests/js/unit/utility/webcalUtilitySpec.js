describe('WebCalUtility', function () {
	'use strict';

	var WebCalUtility, $rootScope;

	beforeEach(module('Calendar', function ($provide) {
		$rootScope = {};
		$rootScope.baseUrl = 'https://server/apps/calendar/';

		$provide.value('$rootScope', $rootScope);
	}));

	beforeEach(inject(function (_WebCalUtility_) {
		WebCalUtility = _WebCalUtility_;
	}));

	it('should downgrade https urls', function() {
		expect(WebCalUtility.downgradeURL('https://foobar')).toEqual('http://foobar');
		expect(WebCalUtility.downgradeURL('http://foobar')).not.toBeDefined();
	});

	it('should determine if a url can be downgraded', function() {
		expect(WebCalUtility.downgradePossible('https://foobar', true)).toBe(true);
		expect(WebCalUtility.downgradePossible('https://foobar', false)).toBe(false);
		expect(WebCalUtility.downgradePossible('http://foobar', true)).toBe(false);
		expect(WebCalUtility.downgradePossible('http://foobar', false)).toBe(false);
	});

	it('should build the proxy URL correctly', function() {
		expect(WebCalUtility.buildProxyURL('https://foobar')).toEqual('https://server/apps/calendar/proxy?url=https%3A%2F%2Ffoobar');
	});

	it('should fix URLs correctly', function() {
		expect(WebCalUtility.fixURL('http://foobar')).toEqual('http://foobar');
		expect(WebCalUtility.fixURL('https://foobar')).toEqual('https://foobar');
		expect(WebCalUtility.fixURL('webcal://foobar')).toEqual('https://foobar');
		expect(WebCalUtility.fixURL('foobar')).toEqual('https://foobar');
	});

	it('should guess if a downgrade is allowed', function() {
		expect(WebCalUtility.allowDowngrade('https://foobar')).toEqual(false);
		expect(WebCalUtility.allowDowngrade('webcal://foobar')).toEqual(true);
		expect(WebCalUtility.allowDowngrade('true://foobar')).toEqual(true);
		expect(WebCalUtility.allowDowngrade('foobar')).toEqual(true);
	});
});
