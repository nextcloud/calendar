/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Code was taken from:
//   - https://github.com/juliuste/closest-css-color
//   - https://github.com/gausie/colour-proximity
//   - https://github.com/gausie/colour-proximity/pull/3

import cssColors from 'css-color-names'
import sortBy from 'lodash/sortBy.js'
import pick from 'lodash/pick.js'
import uniqBy from 'lodash/uniqBy.js'
import colorString from 'color-string'

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
 * Adapted from https://github.com/juliuste/closest-css-color
 *
 * Copyright (c) 2021, Julius Tens
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without
 * fee is hereby granted, provided that the above copyright notice and this permission notice
 * appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS
 * SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE
 * AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
 * NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
 * OF THIS SOFTWARE.
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
 * Adapted from https://github.com/gausie/colour-proximity
 *
 * Copyright (c) 2013, Samuel Gaus
 *
 * @param {string} s1 Hex color string 1
 * @param {string} s2 Hex color string 2
 * @return {number}
 */
function proximity(s1, s2) {
	const c1 = rgb2lab(colorString.get.rgb(s1))
	const c2 = rgb2lab(colorString.get.rgb(s2))
	return Math.sqrt(
		Math.pow(c1[0] - c2[0], 2)
		+ Math.pow(c1[1] - c2[1], 2)
		+ Math.pow(c1[2] - c2[2], 2),
	)
}

/**
 * Adapted from https://github.com/gausie/colour-proximity
 *
 * Copyright (c) 2013, Samuel Gaus
 *
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
