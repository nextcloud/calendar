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
