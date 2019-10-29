/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
import convert from 'color-convert'
import { uidToColor } from './uidToColor.js'
import css3Colors from 'css-color-names'
import closestColor from 'closest-css-color'

/**
 * Detect if a color is light or dark
 *
 * @param {Object} data The destructuring object
 * @param {number} data.red Red part of the RGB
 * @param {number} data.green Green part of the RGB
 * @param {number} data.blue Blue part of the RGB
 * @returns {boolean} true if color is light, false if color is dark
 */
export function isLight({ red, green, blue }) {
	const brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000)
	return (brightness > 130)
}

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {String} hexColor The hex color to get a text color for
 * @returns {String} the matching text color
 */
export function generateTextColorForHex(hexColor) {
	return generateTextColorForRGB(hexToRGB(hexColor))
}

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {Object} data The destructuring object
 * @param {number} data.red Red part of the RGB
 * @param {number} data.green Green part of the RGB
 * @param {number} data.blue Blue part of the RGB
 * @returns {string}
 */
export function generateTextColorForRGB({ red, green, blue }) {
	return isLight({ red, green, blue }) ? '#000000' : '#FAFAFA'
}

/**
 * Convert hex string to RGB
 *
 * @param {String} hexColor The hex color to convert
 * @returns {String} the RGB result
 */
export function hexToRGB(hexColor) {
	if (hexColor == null) {
		return { red: 0, green: 0, blue: 0 }
	}
	const [red, green, blue] = convert.hex.rgb(hexColor.substr(1))
	return { red, green, blue }
}

/**
 * Generates a hex color based on RGB string
 *
 * @param {String} uid The string to generate a color from
 * @returns {string} The hex color
 */
export function uidToHexColor(uid) {
	const color = uidToColor(uid)
	return '#' + convert.rgb.hex(color.r, color.g, color.b)
}

/**
 * Detects a color from a given string
 *
 * @param {String} color The color to get the real RGB hex string from
 * @returns {string|boolean|*} String if color detected, boolean if not
 */
export function detectColor(color) {
	if (/^(#)((?:[A-Fa-f0-9]{3}){1,2})$/.test(color)) { // #ff00ff and #f0f
		return color
	} else if (/^((?:[A-Fa-f0-9]{3}){1,2})$/.test(color)) { // ff00ff and f0f
		return '#' + color
	} else if (/^(#)((?:[A-Fa-f0-9]{8}))$/.test(color)) { // #ff00ffff and #f0ff
		return color.substr(0, 7)
	} else if (/^((?:[A-Fa-f0-9]{8}))$/.test(color)) { // ff00ffff and f0ff
		return '#' + color.substr(0, 6)
	}

	return false

}

/**
 * Gets the HEX code for a css3 color name
 *
 * @param {string} colorName The name of the css3 color
 * @returns {string|null} string of HEX if valid color, null if not
 */
export function getHexForColorName(colorName) {
	return css3Colors[colorName] || null
}

/**
 * Gets the closest css3 color name for a given HEX code
 *
 * @param {string} hex The HEX code to get a css3 color name for
 * @returns {string}
 */
export function getClosestCSS3ColorNameForHex(hex) {
	return closestColor(hex)
}
