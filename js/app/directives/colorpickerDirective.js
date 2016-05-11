/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2016 John Molakvoæ <fremulon@protonmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* https://github.com/kayellpeee/hsl_rgb_converter
 * expected hue range: [0, 360)
 * expected saturation range: [0, 1]
 * expected lightness range: [0, 1]
 */
var hslToRgb = function(hue, saturation, lightness) {
	'use strict';
	// based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
	if(Array.isArray(hue)) {
		[hue, saturation, lightness] = hue;
	}
	if (hue === undefined) {
		return [0, 0, 0];
	}
	saturation /= 100;
	lightness /= 100;

	var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
	var huePrime = hue / 60;
	var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

	huePrime = Math.floor(huePrime);
	var red;
	var green;
	var blue;

	if (huePrime === 0) {
		red = chroma;
		green = secondComponent;
		blue = 0;
	} else if (huePrime === 1) {
		red = secondComponent;
		green = chroma;
		blue = 0;
	} else if (huePrime === 2) {
		red = 0;
		green = chroma;
		blue = secondComponent;
	} else if (huePrime === 3) {
		red = 0;
		green = secondComponent;
		blue = chroma;
	} else if (huePrime === 4) {
		red = secondComponent;
		green = 0;
		blue = chroma;
	} else if (huePrime === 5) {
		red = chroma;
		green = 0;
		blue = secondComponent;
	}

	var lightnessAdjustment = lightness - (chroma / 2);
	red += lightnessAdjustment;
	green += lightnessAdjustment;
	blue += lightnessAdjustment;

	return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];

};

/*
 * Convert rgb array to hex string
 */
var rgbToHex = function(r, g, b) {
	'use strict';
	if(Array.isArray(r)) {
		[r, g, b] = r;
	}
	return '#' + parseInt(r, 10).toString(16) + parseInt(g, 10).toString(16) + parseInt(b, 10).toString(16);
};


/*
 * Generate a random colour with the core generator
 */
var randColour = function() {
	'use strict';
	return rgbToHex(hslToRgb(Math.random().toString().toHsl()));
};

/**
 * Directive: Colorpicker
 * Description: Colorpicker for the Calendar app.
 */


app.directive('colorpicker', function() {
	'use strict';
	var listofcolours = [
		'#31CC7C',
		'#317CCC',
		'#FF7A66',
		'#F1DB50',
		'#7C31CC',
		'#CC317C',
		'#3A3B3D',
		'#CACBCD'
	];
	if (typeof String.prototype.toHsl === 'function') {
		var hsl = "";
		var hslcolour = "";
		//		  0    40   80   120  160  200   240  280  320
		listofcolours = ["15", "9", "4", "b", "6", "11", "74", "f", "57"];
		listofcolours.forEach(function(hash, index) {
			hsl = hash.toHsl();
			hslcolour = hslToRgb(hsl);
			listofcolours[index] = rgbToHex(hslcolour);
		});
	}
	return {
		scope: {
			selected: '=',
			customizedColors: '=colors'
		},
		restrict: 'AE',
		templateUrl: OC.filePath('calendar', 'templates', 'colorpicker.html'),
		link: function(scope, element, attr) {
			scope.colors = scope.customizedColors || listofcolours;
			scope.selected = scope.selected || scope.colors[0];
			scope.random = "#000000";

			scope.randomizeColour = function() {
				scope.random = randColour();
				scope.pick(scope.random);
			};

			scope.pick = function(color) {
				scope.selected = color;
			};

		}
	};

});
