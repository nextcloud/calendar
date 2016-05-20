/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @author John Molakvoæ
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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

app.service('ColorUtilityService', function() {
	'use strict';

	var self = this;

	/**
	 * List of default colors
	 * @type {string[]}
	 */
	this.colors = [];

	if (typeof String.prototype.toHsl === 'function') {
		//0 40 80 120 160 200 240 280 320
		var hashValues = ['15', '9', '4', 'b', '6', '11', '74', 'f', '57'];
		angular.forEach(hashValues, function(hashValue) {
			var hsl = hashValue.toHsl();
			var hslColor = hslToRgb(hsl[0], hsl[1], hsl[2]);
			self.colors.push(self.rgbToHex(hslColor));
		});
	} else {
		this.colors = [
			'#31CC7C',
			'#317CCC',
			'#FF7A66',
			'#F1DB50',
			'#7C31CC',
			'#CC317C',
			'#3A3B3D',
			'#CACBCD'
		];
	}

	/**
	 * generate an appropriate text color based on background color
	 * @param red
	 * @param green
	 * @param blue
	 * @returns {string}
	 */
	this.generateTextColorFromRGB = function(red, green, blue) {
		var brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000);
		return (brightness > 130) ? '#000000' : '#FAFAFA';
	};

	/**
	 * extract decimal values from hex rgb string
	 * @param colorString
	 * @returns {*}
	 */
	this.extractRGBFromHexString = function(colorString) {
		var fallbackColor = {
			r: 255,
			g: 255,
			b: 255
		}, matchedString;

		switch (colorString.length) {
			case 4:
				matchedString = colorString.match(/^#([0-9a-f]{3})$/i)[1];
				return (matchedString) ? {
					r: parseInt(matchedString.charAt(0), 16) * 0x11,
					g: parseInt(matchedString.charAt(1), 16) * 0x11,
					b: parseInt(matchedString.charAt(2), 16) * 0x11
				} : fallbackColor;

			case 7:
			case 9:
				var regex = new RegExp('^#([0-9a-f]{' + (colorString.length - 1) + '})$', 'i');
				matchedString = colorString.match(regex)[1];
				return (matchedString) ? {
					r: parseInt(matchedString.substr(0, 2), 16),
					g: parseInt(matchedString.substr(2, 2), 16),
					b: parseInt(matchedString.substr(4, 2), 16)
				} : fallbackColor;

			default:
				return fallbackColor;
		}
	};

	/**
	 * Make sure string for Hex always uses two digits
	 * @param str
	 * @returns {string}
	 * @private
	 */
	this._ensureTwoDigits = function(str) {
		return str.length === 1 ? '0' + str : str;
	};

	/**
	 * convert three Numbers to rgb hex string
	 * @param r
	 * @param g
	 * @param b
	 * @returns {string}
	 */
	this.rgbToHex = function(r, g, b) {
		if(Array.isArray(r)) {
			g = r[1];
			b = r[2];
			r = r[0];
		}

		return '#' + this._ensureTwoDigits(parseInt(r, 10).toString(16)) +
			this._ensureTwoDigits(parseInt(g, 10).toString(16)) +
			this._ensureTwoDigits(parseInt(b, 10).toString(16));
	};

	/**
	 * generates a random color
	 * @returns {string}
	 */
	this.randomColor = function() {
		if (typeof String.prototype.toHsl === 'function') {
			var hsl = Math.random().toString().toHsl();
			return self.rgbToHex(hslToRgb(hsl[0], hsl[1], hsl[2]));
		} else {
			return self.colors[Math.floor(Math.random() * self.colors.length)];
		}
	};
});
