<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
namespace OCA\Calendar\Utility;

class ColorTest extends \PHPUnit_Framework_TestCase {

	/**
	 * @dataProvider hexProvider
	 */
	public function testHexRegex($color, $matches) {
		$this->assertSame($matches, preg_match(ColorUtility::HEX, $color));
	}


	public function hexProvider() {
		return [
			['#000000', 1],
			['#FFFFFF', 1],
			['#FF00FF', 1],
			['#9999EE', 1],
			['000000', 0],
			['#FFFFFF00', 0],
			['#GGZZHH', 0],
		];
	}


	/**
	 * @dataProvider rgbProvider
	 */
	public function testRgbRegex($color, $matches) {
		$this->assertSame($matches, preg_match(ColorUtility::RGB, $color));
	}


	public function rgbProvider() {
		return [
			['rgb(0,0,0)', 1],
			['rgb(0, 0, 0)', 1],
			['rgb(255,255,255)', 1],
			['rgb(256,256,256)', 0],
			['rgb(FF,0,0)', 0],
			['rgb (0, 0, 0)', 0],
			['rgb(0 ,0 ,0)', 0],
		];
	}


	/**
	 * @dataProvider rgbaProvider
	 */
	public function testRgbaRegex($color, $matches) {
		$this->assertSame($matches, preg_match(ColorUtility::RGBA, $color));
	}


	public function rgbaProvider() {
		return [
			['rgba(0,0,0,1)', 1],
			['rgba(0,0,0,1.0)', 1],
			['rgba(0,0,0,0)', 1],
			['rgba(0,0,0,0.0)', 1],
			['rgba(0,0,0,0)', 1],
			['rgba(255,255,255,0.973739847227371)', 1],
			['rgba(256,0,0,0)', 0],
			['rgb(FF,0,0, 0)', 0],
			['rgba (0, 0, 0, 0)', 0],
			['rgba(0 ,0 ,0 ,0)', 0],
		];
	}


	/**
	 * @dataProvider isValidProvider
	 */
	public function testIsValid($color, $matches) {
		$this->assertSame($matches, ColorUtility::isValid($color));
	}


	public function isValidProvider() {
		$values = array_merge(
			$this->hexProvider(),
			$this->rgbProvider(),
			$this->rgbaProvider()
		);

		return array_map(function($array) {
			$array[1] = ($array[1] === 1) ? true : false;
			return $array;
		}, $values);
	}


	/**
	 * @dataProvider getHexProvider
	 */
	public function testGetHEX($toConvert, $expected) {
		$this->assertSame($expected, ColorUtility::getHEX($toConvert));
	}


	public function getHexProvider() {
		return [
			['rgba(255,255,255,0.5)', '#FFFFFF'],
			['rgb(63,166,51)', '#3FA633'],
			['#123456', '#123456'],
		];
	}


	/**
	 * @dataProvider getRGBProvider
	 */
	public function testGetRGB($toConvert, $expected) {
		$this->assertSame($expected, ColorUtility::getRGB($toConvert));
	}


	public function getRGBProvider() {
		return [
			['#FFFFFF', 'rgb(255,255,255)'],
			['#3FA633', 'rgb(63,166,51)'],
			['rgba(255,42,255,0.5)', 'rgb(255,42,255)'],
		];
	}


	/**
	 * @dataProvider getRGBAProvider
	 */
	public function testGetRGBA($toConvert, $expected) {
		$this->assertSame($expected, ColorUtility::getRGBA($toConvert));
	}


	public function getRGBAProvider() {
		return [
			['#FFFFFF', 'rgba(255,255,255,1.0)'],
			['#3FA633', 'rgba(63,166,51,1.0)'],
			['rgb(255,42,255)', 'rgba(255,42,255,1.0)'],
		];
	}
}