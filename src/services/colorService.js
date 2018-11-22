/**
 * @copyright Copyright (c) 2018 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/** @type String [] */
const colors = []

/**
 * get the appropriate text color to be used on top of an rgb value
 *
 * @param {Number|String} red decimal value for red
 * @param {Number} green decimal value for green
 * @param {Number} blue decimal value for blue
 * @returns {string}
 */
export function generateTextColorFromRGB(red, green, blue) {
	if (typeof red === 'string') {
		const { r, g, b } = extractRGBFromHexString(red)
		red = r
		green = g
		blue = b
	}

	const brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000)
	return (brightness > 130) ? '#000000' : '#FAFAFA'
}

/**
 * returns a random color
 *
 * @returns {String}
 */
export function randomColor() {
	if (typeof String.prototype.toRgb === 'function') {
		const { r, g, b } = Math.random().toString().toRgb()
		return rgbToHex(r, g, b)
	} else {
		return colors[Math.floor(Math.random() * colors.length)]
	}
}

/**
 * extracts decimal rgb values from a hexadecimal string
 *
 * @param {String} colorString the hex rgb string
 * @returns {{red: Number, green: Number, blue: Number}}
 */
export function extractRGBFromHexString(colorString) {
	const fallbackColor = { red: 255, green: 255, blue: 255 }
	let matchedString

	if (typeof colorString !== 'string') {
		return fallbackColor
	}

	switch (colorString.length) {
	case 4: {
		matchedString = colorString.match(/^#([0-9a-f]{3})$/i)
		return (Array.isArray(matchedString) && matchedString[1])
			? ({
				red: parseInt(matchedString[1].charAt(0), 16) * 0x11,
				green: parseInt(matchedString[1].charAt(1), 16) * 0x11,
				blue: parseInt(matchedString[1].charAt(2), 16) * 0x11
			})
			: fallbackColor
	}

	case 7:
	case 9: {
		const regex = new RegExp('^#([0-9a-f]{' + (colorString.length - 1) + '})$', 'i')
		matchedString = colorString.match(regex)
		return (Array.isArray(matchedString) && matchedString[1])
			? ({
				red: parseInt(matchedString[1].substr(0, 2), 16),
				green: parseInt(matchedString[1].substr(2, 2), 16),
				blue: parseInt(matchedString[1].substr(4, 2), 16)
			})
			: fallbackColor
	}

	default:
		return fallbackColor
	}
}

/**
 *
 * @param {String[]|String} red Value from 0 to 255
 * @param {String} green Value from 0 to 255
 * @param {String} blue Value from 0 to 255
 * @returns {string}
 */
export function rgbToHex(red, green, blue) {
	if (Array.isArray(red)) {
		[red, green, blue] = red
	}

	return [
		'#',
		('0' + parseInt(red, 10).toString(16)).slice(-2),
		('0' + parseInt(green, 10).toString(16)).slice(-2),
		('0' + parseInt(blue, 10).toString(16)).slice(-2)
	].join('')
}

// initialize default colors
if (typeof String.prototype.toRgb === 'function') {
	['15', '9', '4', 'b', '6', '11', '74', 'f', '57'].forEach((hashValue) => {
		const { r, g, b } = hashValue.toRgb()
		colors.push(rgbToHex(r, g, b))
	})
} else {
	colors.push(
		'#31CC7C',
		'#317CCC',
		'#FF7A66',
		'#F1DB50',
		'#7C31CC',
		'#CC317C',
		'#3A3B3D',
		'#CACBCD'
	)
}
