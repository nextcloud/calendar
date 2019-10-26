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

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {String} rgbString The hex RGB string to get a text color for
 * @returns {String} the matching text color
 */
export function generateTextColorForRGBString(rgbString) {
	const [red, green, blue] = convert.hex.rgb(rgbString.substr(1))
	return generateTextColorForRGB({ red, green, blue })
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
	const brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000)
	return (brightness > 130) ? '#000000' : '#FAFAFA'
}

/**
 * Generates a rgb-hex color based on a string
 *
 * @param {String} uid The string to generate a color from
 * @returns {string} The RGB HEX color
 */
export function uidToHexColor(uid) {
	const color = uidToColor(uid)
	return '#' + convert.rgb.hex(color.r, color.g, color.b)
}
