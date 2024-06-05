/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Code was taken from:
//   - https://github.com/juliuste/closest-css-color

import closestColor from '../../../../src/utils/closestColor.js'
import cssColors from 'css-color-names'
import uniqBy from 'lodash/uniqBy.js'
import pick from 'lodash/pick.js'

describe('utils/closestColor test suite', () => {
	it('should calculate the closest color', () => {
		const uniqColorKeys = uniqBy(Object.keys(cssColors), c => cssColors[c])
		const filteredColors = pick(cssColors, uniqColorKeys)

		const color1 = closestColor('#fff')
		expect(color1).toBe('white')

		const color2 = closestColor('#a00a0a', { detailed: false })
		expect(color2).toBe('darkred')

		const color3 = closestColor('#1019a6', { detailed: true })
		expect(color3).toEqual({
			name: 'darkblue',
			hex: '#00008b',
		})

		for (const color of Object.keys(filteredColors)) {
			expect(closestColor(filteredColors[color])).toBe(color)
		}
	})
})
