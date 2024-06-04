/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import convert from 'color-convert'
import { uidToColor } from './uidToColor.js'
import css3Colors from 'css-color-names'
import closestColor from './closestColor.js'

/**
 * Detect if a color is light or dark
 *
 * @param {object} data The destructuring object
 * @param {number} data.red Red part of the RGB
 * @param {number} data.green Green part of the RGB
 * @param {number} data.blue Blue part of the RGB
 * @return {boolean} true if color is light, false if color is dark
 */
export function isLight({ red, green, blue }) {
	const brightness = (((red * 299) + (green * 587) + (blue * 114)) / 1000)
	return (brightness > 130)
}

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {string} hexColor The hex color to get a text color for
 * @return {string} the matching text color
 */
export function generateTextColorForHex(hexColor) {
	return generateTextColorForRGB(hexToRGB(hexColor))
}

/**
 * Get a text-color that's readable on a given background color
 *
 * @param {object} data The destructuring object
 * @param {number} data.red Red part of the RGB
 * @param {number} data.green Green part of the RGB
 * @param {number} data.blue Blue part of the RGB
 * @return {string}
 */
export function generateTextColorForRGB({ red, green, blue }) {
	return isLight({ red, green, blue }) ? '#000000' : '#FAFAFA'
}

/**
 * Convert hex string to RGB
 *
 * @param {string} hexColor The hex color to convert
 * @return {string} the RGB result
 */
export function hexToRGB(hexColor) {
	if (hexColor == null) {
		return { red: 0, green: 0, blue: 0 }
	}
	const [red, green, blue] = convert.hex.rgb(hexColor.slice(1))
	return { red, green, blue }
}

/**
 * Generates a hex color based on RGB string
 *
 * @param {string} uid The string to generate a color from
 * @return {string} The hex color
 */
export function uidToHexColor(uid) {
	const color = uidToColor(uid)
	return '#' + convert.rgb.hex(color.r, color.g, color.b)
}

/**
 * Detects a color from a given string
 *
 * @param {string} color The color to get the real RGB hex string from
 * @return {string|boolean|*} String if color detected, boolean if not
 */
export function detectColor(color) {
	if (/^(#)((?:[A-Fa-f0-9]{3}){1,2})$/.test(color)) { // #ff00ff and #f0f
		return color
	} else if (/^((?:[A-Fa-f0-9]{3}){1,2})$/.test(color)) { // ff00ff and f0f
		return '#' + color
	} else if (/^(#)((?:[A-Fa-f0-9]{8}))$/.test(color)) { // #ff00ffff and #f0ff
		return color.slice(0, 7)
	} else if (/^((?:[A-Fa-f0-9]{8}))$/.test(color)) { // ff00ffff and f0ff
		return '#' + color.slice(0, 6)
	}

	return false

}

/**
 * Gets the HEX code for a css3 color name
 *
 * @param {string} colorName The name of the css3 color
 * @return {string | null} string of HEX if valid color, null if not
 */
export function getHexForColorName(colorName) {
	return css3Colors[colorName] || null
}

/**
 * Gets the closest css3 color name for a given HEX code
 *
 * @param {string} hex The HEX code to get a css3 color name for
 * @return {string}
 */
export function getClosestCSS3ColorNameForHex(hex) {
	return closestColor(hex)
}
