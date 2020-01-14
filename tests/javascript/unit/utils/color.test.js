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
	generateTextColorForHex,
	generateTextColorForRGB,
	hexToRGB,
	isLight,
	uidToHexColor,
	detectColor
} from '../../../../src/utils/color.js'

describe('utils/color test suite', () => {

	it('should provide a function to generate a text-color from an rgb string', () => {
		expect(generateTextColorForHex('#fff')).toEqual('#000000')
		expect(generateTextColorForHex('#000')).toEqual('#FAFAFA')
		expect(generateTextColorForHex('#FF00FF')).toEqual('#FAFAFA')
		expect(generateTextColorForHex('#00FF00')).toEqual('#000000')
	})

	it('should provide a function to generate a text-color from rgb values', () => {
		expect(generateTextColorForRGB({ red: 255, green: 255, blue: 255 })).toEqual('#000000')
		expect(generateTextColorForRGB({ red: 0, green: 0, blue: 0 })).toEqual('#FAFAFA')
		expect(generateTextColorForRGB({ red: 255, green: 0, blue: 255 })).toEqual('#FAFAFA')
		expect(generateTextColorForRGB({ red: 0, green: 255, blue: 0 })).toEqual('#000000')
	})

	it('should determine whether a color is light', () => {
		expect(isLight({ red: 255, green: 255, blue: 255 })).toEqual(true);
		expect(isLight({ red: 0, green: 0, blue: 0 })).toEqual(false);
	})

	it('should provide a RGB object for a hex string', () => {
		expect(hexToRGB('#C98879')).toEqual({ red: 201, green: 136, blue: 121 })
	})

	it('should provide a HEX string for a UID', () => {
		expect(uidToHexColor('uid123')).toEqual('#C98879')
		expect(uidToHexColor('')).toEqual('#0082C9')
	})

	it('should detect the color of a color string', () => {
		expect(detectColor('#ffff00')).toEqual('#ffff00')
		expect(detectColor('ffff00')).toEqual('#ffff00')
		expect(detectColor('#ffff00AB')).toEqual('#ffff00')
		expect(detectColor('ffff00AB')).toEqual('#ffff00')
		expect(detectColor('undefined-color')).toEqual(false)
	})
})
