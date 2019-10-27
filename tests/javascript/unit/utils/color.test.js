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
import {
	generateTextColorForRGBString,
	generateTextColorForRGB,
	uidToHexColor
} from '../../../../src/utils/color.js'

describe('utils/color test suite', () => {

	it('should provide a function to generate a text-color from an rgb string', () => {
		expect(generateTextColorForRGBString('#fff')).toEqual('#000000')
		expect(generateTextColorForRGBString('#000')).toEqual('#FAFAFA')
		expect(generateTextColorForRGBString('#FF00FF')).toEqual('#FAFAFA')
		expect(generateTextColorForRGBString('#00FF00')).toEqual('#000000')
	})

	it('should provide a function to generate a text-color from rgb values', () => {
		expect(generateTextColorForRGB({ red: 255, green: 255, blue: 255 })).toEqual('#000000')
		expect(generateTextColorForRGB({ red: 0, green: 0, blue: 0 })).toEqual('#FAFAFA')
		expect(generateTextColorForRGB({ red: 255, green: 0, blue: 255 })).toEqual('#FAFAFA')
		expect(generateTextColorForRGB({ red: 0, green: 255, blue: 0 })).toEqual('#000000')
	})

	it('should provide a HEX string for a UID', () => {
		expect(uidToHexColor('uid123')).toEqual('#C98879')
		expect(uidToHexColor('')).toEqual('#0082C9')
	})
})
