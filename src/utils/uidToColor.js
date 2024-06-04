/**
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import md5 from 'md5'

/**
 * This is copied from nextcloud-vue for now, until it is exposed upstream.
 */

export const uidToColor = (uid) => {
	// Normalize hash
	let hash = uid.toLowerCase()

	// Already a md5 hash?
	if (hash.match(/^([0-9a-f]{4}-?){8}$/) === null) {
		hash = md5(hash)
	}

	hash = hash.replace(/[^0-9a-f]/g, '')

	const steps = 6
	const finalPalette = GenColors(steps)

	/**
	 * Convert a string to an integer evenly
	 *
	 * @param {string} hash The string to convert
	 * @param {number} maximum The maximum value
	 * @return {number} The integer calculated
	 */
	function hashToInt(hash, maximum) {
		let finalInt = 0
		const result = []

		// Splitting evenly the string
		for (let i = 0; i < hash.length; i++) {
			// chars in md5 goes up to f, hex:16
			result.push(parseInt(hash.charAt(i), 16) % 16)
		}

		// Adds up all results
		for (const j in result) {
			finalInt += result[j]
		}

		// chars in md5 goes up to f, hex:16
		// make sure we're always using int in our operation
		return parseInt(parseInt(finalInt, 10) % maximum, 10)
	}
	return finalPalette[hashToInt(hash, steps * 3)]
}

/**
 * Color object
 *
 * @param {number} r The red value
 * @param {number} g The green value
 * @param {number} b The blue value
 */
function Color(r, g, b) {
	this.r = r
	this.g = g
	this.b = b
}

/**
 * Calculate the number of steps
 *
 * @param {number} steps The number of steps
 * @param {Array} ends The ends
 * @return {Array} Array containing the number of steps per color
 */
function stepCalc(steps, ends) {
	const step = new Array(3)
	step[0] = (ends[1].r - ends[0].r) / steps
	step[1] = (ends[1].g - ends[0].g) / steps
	step[2] = (ends[1].b - ends[0].b) / steps
	return step
}

/**
 * Create a color palette from two colors
 *
 * @param {number} steps The number of steps the palette has
 * @param {string} color1 The first color
 * @param {string} color2 The second color
 * @return {Array} The created palette array
 */
function mixPalette(steps, color1, color2) {
	const palette = []
	palette.push(color1)
	const step = stepCalc(steps, [color1, color2])
	for (let i = 1; i < steps; i++) {
		const r = parseInt(color1.r + step[0] * i, 10)
		const g = parseInt(color1.g + step[1] * i, 10)
		const b = parseInt(color1.b + step[2] * i, 10)
		palette.push(new Color(r, g, b))
	}
	return palette
}

/**
 * Generate colors from the official nextcloud color
 * You can provide how many colors you want (multiplied by 3)
 * if step = 6
 * 3 colors * 6 will result in 18 generated colors
 *
 * @param {number} [steps] Number of steps to go from a color to another
 * @return {object[]}
 */
function GenColors(steps) {
	if (!steps) {
		steps = 6
	}

	const red = new Color(182, 70, 157)
	const yellow = new Color(221, 203, 85)
	const blue = new Color(0, 130, 201) // Nextcloud blue

	const palette1 = mixPalette(steps, red, yellow)
	const palette2 = mixPalette(steps, yellow, blue)
	const palette3 = mixPalette(steps, blue, red)

	return palette1.concat(palette2).concat(palette3)
}

export default uidToColor
