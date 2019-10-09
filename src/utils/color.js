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

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {String} rgbString The hex RGB string to get a text color for
 * @returns {String} the matching text color
 */
export function generateTextColorForRGBString(rgbString) {
	const [red, green, blue] = convert.hex.rgb(rgbString.substr(1))
	const brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000)
	return (brightness > 130) ? '#000000' : '#FAFAFA'
}

/**
 * returns a random color
 *
 * @returns {String}
 */
export function getRandomColor() {
	const red = Math.floor(Math.random() * 256)
	const green = Math.floor(Math.random() * 256)
	const blue = Math.floor(Math.random() * 256)

	return '#' + convert.rgb.hex(red, green, blue)
}

/**
 * Gets the default color of the nextcloud instance
 *
 * @returns {string}
 * @deprecated
 */
export function getDefaultColor() {
	return '#1483C6'
}
