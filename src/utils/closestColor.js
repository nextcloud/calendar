/**
 * @copyright Copyright (c) 2023 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
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

// Code was taken from:
//   - https://github.com/juliuste/closest-css-color
//   - https://github.com/gausie/colour-proximity
//   - https://github.com/gausie/colour-proximity/pull/3

import cssColors from 'css-color-names'
import sortBy from 'lodash/sortBy.js'
import pick from 'lodash/pick.js'
import uniqBy from 'lodash/uniqBy.js'
import { get } from 'color-string'

const uniqColorKeys = uniqBy(Object.keys(cssColors), c => cssColors[c])
const filteredColors = pick(cssColors, uniqColorKeys)

const colors = sortBy(
	Object.keys(filteredColors).map(name => ({
		name,
		hex: filteredColors[name],
	})),
	c => c.hex,
)

const defaults = {
	detailed: false,
}

/**
 * Find the closest CSS color to a given hex color.
 *
 * @param {string} hex Hex color string
 * @param {object} opt Options
 * @param {boolean=} opt.detailed Return color object instead of just the name
 * @return {string|{name: string, hex: string}} Closest color name or object
 */
export default function closestColor(hex, opt = {}) {
	const options = { ...defaults, ...opt }
	const sortedColors = sortBy(colors, c => proximity(hex, c.hex))
	if (options.detailed) {
		return sortedColors[0]
	}
	return sortedColors[0].name
}

/**
 * Calculate the proximity between two colors.
 *
 * @param {string} s1 Hex color string 1
 * @param {string} s2 Hex color string 2
 * @return {number}
 */
function proximity(s1, s2) {
	const c1 = rgb2lab(get.rgb(s1))
	const c2 = rgb2lab(get.rgb(s2))
	return Math.sqrt(
		Math.pow(c1[0] - c2[0], 2)
		+ Math.pow(c1[1] - c2[1], 2)
		+ Math.pow(c1[2] - c2[2], 2)
	)
}

/**
 * @param {number[]} input RGB array
 */
function rgb2lab(input) {
	// This code is adapted from various functions at http://www.easyrgb.com/index.php?X=MATH

	const rgb = [0, 0, 0]
	const xyz = [0, 0, 0]
	const Lab = [0, 0, 0]

	for (let i = 0; i < input.length; i++) {
		let value = input[i] / 255

		if (value > 0.04045) {
			value = Math.pow(((value + 0.055) / 1.055), 2.4)
		} else {
			value = value / 12.92
		}

		rgb[i] = value * 100
	}

	xyz[0] = (rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805) / 95.047 // ref_X =  95.047   Observer= 2°, Illuminant= D65
	xyz[1] = (rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722) / 100.0 // ref_Y = 100.000
	xyz[2] = (rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505) / 108.883 // ref_Z = 108.883

	for (let i = 0; i < 3; i++) {
		let value = xyz[i]
		if (value > 0.008856) {
			value = Math.pow(value, 1 / 3)
		} else {
			value = (7.787 * value) + (16 / 116)
		}
		xyz[i] = value
	}

	Lab[0] = parseFloat(((116 * xyz[1]) - 16).toFixed(3))
	Lab[1] = parseFloat((500 * (xyz[0] - xyz[1])).toFixed(3))
	Lab[2] = parseFloat((200 * (xyz[1] - xyz[2])).toFixed(3))

	return Lab
}
