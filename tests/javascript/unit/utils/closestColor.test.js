/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Code was taken from:
//   - https://github.com/juliuste/closest-css-color

import closestColor from '../../../../src/utils/closestColor.js'

describe('utils/closestColor test suite', () => {
	it('should calculate the closest color', () => {
		const color1 = closestColor('#fff')
		expect(color1).toBe('white')

		const color2 = closestColor('#a00a0a', { detailed: false })
		expect(color2).toBe('darkred')

		const color3 = closestColor('#1019a6', { detailed: true })
		expect(color3).toEqual({
			name: 'darkblue',
			hex: '#00008b',
		})
	})

	it('should return the same color when given exact CSS color values', () => {
		expect(closestColor('#ffffff')).toBe('white')
		expect(closestColor('#000000')).toBe('black')
		expect(closestColor('#ff0000')).toBe('red')
		expect(closestColor('#00ff00')).toBe('lime')
		expect(closestColor('#0000ff')).toBe('blue')
	})
})
