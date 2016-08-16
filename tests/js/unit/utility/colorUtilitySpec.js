describe('ColorUtility shared tests', function () {
	'use strict';

	var ColorUtility;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			spyOn(window, 'hslToRgb').and.callThrough();
			spyOn(Math, 'random').and.callThrough();
			spyOn(Math, 'floor').and.callThrough();
			ColorUtility = $injector.get('ColorUtility');
		});
	});

	it('should return an appropriate text color for a given background color', function () {
		expect(ColorUtility.generateTextColorFromRGB(0, 0, 0)).toEqual('#FAFAFA');
		expect(ColorUtility.generateTextColorFromRGB(255, 255, 255)).toEqual('#000000');
	});

	it('should extract RGB codes from HEX string', function () {
		//short RGB
		expect(ColorUtility.extractRGBFromHexString('#000')).toEqual({
			r: 0,
			g: 0,
			b: 0
		});
		expect(ColorUtility.extractRGBFromHexString('#fff')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		expect(ColorUtility.extractRGBFromHexString('#zzz')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		//regular RGB(A)
		expect(ColorUtility.extractRGBFromHexString('#e9e8e7')).toEqual({
			r: 233,
			g: 232,
			b: 231
		});
		expect(ColorUtility.extractRGBFromHexString('#e9e8ez')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		expect(ColorUtility.extractRGBFromHexString('#e9e8e7bb')).toEqual({
			r: 233,
			g: 232,
			b: 231
		});
		expect(ColorUtility.extractRGBFromHexString('#e9e8e7ez')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		//fallback color
		expect(ColorUtility.extractRGBFromHexString(null)).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		expect(ColorUtility.extractRGBFromHexString('asd')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
		expect(ColorUtility.extractRGBFromHexString('#e9e8e7bbdd')).toEqual({
			r: 255,
			g: 255,
			b: 255
		});
	});

	it('should ensure to return two digits', function () {
		expect(ColorUtility._ensureTwoDigits('1')).toEqual('01');
		expect(ColorUtility._ensureTwoDigits('42')).toEqual('42');
	});

	it('should convert RGB to HEX properly', function () {
		expect(ColorUtility.rgbToHex(0, 0, 0)).toEqual('#000000');
		expect(ColorUtility.rgbToHex(123, 0, 0)).toEqual('#7b0000');
		expect(ColorUtility.rgbToHex(0, 123, 0)).toEqual('#007b00');
		expect(ColorUtility.rgbToHex(0, 0, 123)).toEqual('#00007b');
		expect(ColorUtility.rgbToHex(255, 255, 255)).toEqual('#ffffff');

		expect(ColorUtility.rgbToHex([0, 0, 0])).toEqual('#000000');
		expect(ColorUtility.rgbToHex([123, 0, 0])).toEqual('#7b0000');
		expect(ColorUtility.rgbToHex([0, 123, 0])).toEqual('#007b00');
		expect(ColorUtility.rgbToHex([0, 0, 123])).toEqual('#00007b');
		expect(ColorUtility.rgbToHex([255, 255, 255])).toEqual('#ffffff');
	});

	it('should call forward the call to hslToRgb', function () {
		expect(ColorUtility._hslToRgb(6, 70, 68));
		expect(hslToRgb).toHaveBeenCalledWith(6, 0.7, 0.68);

		expect(ColorUtility._hslToRgb([6, 77, 68]));
		expect(hslToRgb).toHaveBeenCalledWith(6, 0.77, 0.68);
	});
});

describe('ColorUtility <9.1', function () {
	'use strict';

	var ColorUtility;

	beforeEach(function () {
		module('Calendar');

		inject(function ($injector) {
			spyOn(window, 'hslToRgb').and.callThrough();
			spyOn(Math, 'random').and.callThrough();
			spyOn(Math, 'floor').and.callThrough();
			ColorUtility = $injector.get('ColorUtility');
		});
	});

	it ('should return a random color for <9.1', function() {
		delete String.prototype.toHsl;
		expect(ColorUtility.randomColor()).toMatch(/^#([0-9a-f]{6})$/i);
		expect(Math.random).toHaveBeenCalled();
		expect(Math.floor).toHaveBeenCalled();
	});

	it ('should provide a list of default colors for <9.1', function() {
		delete String.prototype.toHsl;
		expect(ColorUtility.colors).toEqual(['#31CC7C', '#317CCC', '#FF7A66', '#F1DB50', '#7C31CC', '#CC317C', '#3A3B3D', '#CACBCD']);
	});
});

describe('ColorUtility >=9.1', function () {
	'use strict';

	var ColorUtility;

	it ('should provide a list of default colors for >=9.1', function () {
		module('Calendar');

		inject(function ($injector) {
			spyOn(window, 'hslToRgb').and.callThrough();
			spyOn(Math, 'random').and.callThrough();
			spyOn(Math, 'floor').and.callThrough();
			String.prototype.toHsl = jasmine.createSpy().and.returnValues([6, 70, 68], [30, 70, 68], [60, 70, 68], [118, 70, 68], [169, 70, 68], [194, 70, 68], [228, 70, 68], [281, 70, 68], [315, 70, 68]);
			ColorUtility = $injector.get('ColorUtility');
		});

		expect(ColorUtility.colors).toEqual(['#e78074', '#e7ad74', '#e7e774', '#78e774', '#74e7d2', '#74cce7', '#748be7', '#c274e7', '#e774ca']);
		const all = String.prototype.toHsl.calls.all();
		expect(all[0].object.toString()).toEqual('15');
		expect(all[1].object.toString()).toEqual('9');
		expect(all[2].object.toString()).toEqual('4');
		expect(all[3].object.toString()).toEqual('b');
		expect(all[4].object.toString()).toEqual('6');
		expect(all[5].object.toString()).toEqual('11');
		expect(all[6].object.toString()).toEqual('74');
		expect(all[7].object.toString()).toEqual('f');
		expect(all[8].object.toString()).toEqual('57');
	});

	it ('should return a random color for >=9.1', function() {
		module('Calendar');

		inject(function ($injector) {
			spyOn(window, 'hslToRgb').and.callThrough();
			spyOn(Math, 'random').and.callThrough();
			spyOn(Math, 'floor').and.callThrough();
			String.prototype.toHsl = jasmine.createSpy();
			ColorUtility = $injector.get('ColorUtility');
		});

		expect(ColorUtility.randomColor()).toMatch(/^#([0-9a-f]{6})$/i);
		expect(Math.random).toHaveBeenCalled();
		expect(String.prototype.toHsl).toHaveBeenCalled();
		expect(hslToRgb).toHaveBeenCalled();
	});
});
