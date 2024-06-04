/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import {
	generateTextColorForHex,
	generateTextColorForRGB,
	hexToRGB,
	isLight,
	uidToHexColor,
	detectColor,
	getHexForColorName,
	getClosestCSS3ColorNameForHex
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

	it('should get a hex code for a color-name', () => {
		expect(getHexForColorName('chocolate')).toEqual('#d2691e')
		expect(getHexForColorName('darkblue')).toEqual('#00008b')
		expect(getHexForColorName('foo')).toEqual(null)
	})

	it('should get the closest css color name for a given hex code', () => {
		expect(getClosestCSS3ColorNameForHex('#d2691e')).toEqual('chocolate')
		expect(getClosestCSS3ColorNameForHex('#d2699f')).toEqual('palevioletred')
		expect(getClosestCSS3ColorNameForHex('#ff0000')).toEqual('red')
	})
})
