describe('ColorUtilityService', function () {
	'use strict';

	var colorUtilityService;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			colorUtilityService = $injector.get('ColorUtilityService');
		});
	});

	//TODO - can we add some js variable via bash to see what core branch we use?
	/*
	it ('should return a list of default colors', inject(function() {
		expect(colorUtilityService.colors).toEqual([]);
	}));
	*/

	it('should return an appropriate text color for a given background color', function() {
		expect(colorUtilityService.generateTextColorFromRGB(0,0,0)).toEqual('#FAFAFA');
		expect(colorUtilityService.generateTextColorFromRGB(255,255,255)).toEqual('#000000');
	});

	it ('should extract RGB codes from HEX string', inject(function() {
		expect(colorUtilityService.extractRGBFromHexString('#000')).toEqual({r:0,g:0,b:0});
		expect(colorUtilityService.extractRGBFromHexString('#fff')).toEqual({r:255,g:255,b:255});
		expect(colorUtilityService.extractRGBFromHexString('#e9e8e7')).toEqual({r:233,g:232,b:231});
		expect(colorUtilityService.extractRGBFromHexString('#e9e8e7bb')).toEqual({r:233,g:232,b:231});
	}));

	it ('should ensure to return two digits', inject(function() {
		expect(colorUtilityService._ensureTwoDigits('1')).toEqual('01');
		expect(colorUtilityService._ensureTwoDigits('42')).toEqual('42');
	}));

	it ('should convert RGB to HEX properly', inject(function() {
		expect(colorUtilityService.rgbToHex(0,0,0)).toEqual('#000000');
		expect(colorUtilityService.rgbToHex(123,0,0)).toEqual('#7b0000');
		expect(colorUtilityService.rgbToHex(0,123,0)).toEqual('#007b00');
		expect(colorUtilityService.rgbToHex(0,0,123)).toEqual('#00007b');
		expect(colorUtilityService.rgbToHex(255,255,255)).toEqual('#ffffff');
	}));

	it ('should return a random color', inject(function() {
		expect(colorUtilityService.randomColor()).toMatch(/^#([0-9a-f]{6})$/i);
		//expect(colorUtilityService.randomColor()).not.toEqual(colorUtilityService.randomColor());
	}));
});
