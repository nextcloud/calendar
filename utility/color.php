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

class ColorUtility extends Utility {

	/**
	 * @var string
	 */
	const HEX = '/(^#([0-9a-fA-F]{2}){3}$)|(^#([0-9a-fA-F]{1}){3}$)/';


	/**
	 * @var string
	 */
	const RGB = '/^rgb\((([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5])),\s*(([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5])),\s*(([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5]))\)$/';


	/**
	 * @var string
	 */
	const RGBA = '/^rgba\((([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5])),\s*(([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5])),\s*(([0-1]?[0-9]?[0-9])|([2][0-4][0-9])|(25[0-5]))(,(([1])|([0])|([1]\.[0]*)|(\s*[0]+\.\d+)))*\)$/';


	/**
	 * check if color is valid
	 * @param string $color
	 * @return bool
	 */
	public static function isValid($color) {
		$regexs = array(
			self::HEX,
			self::RGB,
			self::RGBA
		);

		foreach($regexs as $regex) {
			if (preg_match($regex, $color) === 1) {
				return true;
			}
		}

		return false;
	}


	/**
	 * get HEX string for color
	 * @param string $color
	 * @return string
	 */
	public static function getHEX($color) {
		if (preg_match(self::HEX, $color) === 1) {
			return $color;
		}

		$colors = self::extractColors($color);
		if ($colors === null) {
			return null;
		}

		$colors = array_slice($colors, 0, 3);
		$colors = array_map(function($c) {
			return strtoupper(strval(dechex($c)));
		}, $colors);

		$colorCode  = '#';
		$colorCode .= implode('', $colors);

		return $colorCode;
	}


	/**
	 * get RGB string for color
	 * @param string $color
	 * @return string
	 */
	public static function getRGB($color) {
		if (preg_match(self::RGB, $color) === 1) {
			return $color;
		}

		$colors = self::extractColors($color);
		if ($colors === null) {
			return null;
		}

		$colors = array_slice($colors, 0, 3);
		$colors = self::getColorStrings($colors);

		$colorCode  = 'rgb(';
		$colorCode .= implode(',', $colors);
		$colorCode .= ')';

		return $colorCode;
	}


	/**
	 * get RGBA string for color
	 * @param string $color
	 * @return string
	 */
	public static function getRGBA($color) {
		if (preg_match(self::RGBA, $color) === 1) {
			return $color;
		}

		$colors = self::extractColors($color);
		if ($colors === null) {
			return null;
		}

		$colors = self::getColorStrings($colors);

		$colorCode  = 'rgba(';
		$colorCode .= implode(',', $colors);
		$colorCode .= ')';

		return $colorCode;
	}


	/**
	 * extract red, green, blue, alpha values from string
	 * @param string $color
	 * @return array
	 */
	private static function extractColors($color) {
		$defaultAlpha = 1.0;

		if (preg_match(self::HEX, $color) === 1) {
			if (strlen($color) === 4) {
				$color = substr($color, 1, 3);

				return array(
					hexdec($color[0].$color[0]),
					hexdec($color[1].$color[1]),
					hexdec($color[2].$color[2]),
					$defaultAlpha
				);
			} elseif (strlen($color) === 7) {
				$color = substr($color, 1, 6);

				return array(
					hexdec(substr($color, 0, 2)),
					hexdec(substr($color, 2, 2)),
					hexdec(substr($color, 4, 2)),
					$defaultAlpha
				);
			}
		} elseif (preg_match(self::RGB, $color) === 1) {
			$color = str_replace('rgb(', '', $color);
			$color = str_replace(')', '', $color);

			$colors = explode(',', $color);
			$colors = array_map(function($c) {
				return intval(trim($c));
			}, $colors);
			$colors[] = $defaultAlpha;

			return $colors;
		} elseif (preg_match(self::RGBA, $color) === 1) {
			$color = str_replace('rgba(', '', $color);
			$color = str_replace(')', '', $color);

			$colors = explode(',', $color);
			for ($i = 0; $i < 4; $i++) {
				$colors[$i] = trim($colors[$i]);

				if ($i < 3) {
					$colors[$i] = intval($colors[$i]);
				} else {
					$colors[$i] = floatval($colors[$i]);
				}
			}

			return $colors;
		}

		return null;
	}


	/**
	 * @param array $colors
	 * @return array
	 */
	private static function getColorStrings($colors) {
		for ($i = 0; $i < 4; $i++) {
			if ($i < 3) {
				$c = intval($colors[$i]);
				$c = $c % 256;

				$colors[$i] = sprintf('%d', $c);
			} else {
				if (isset($colors[$i])) {
					$c = floatval($colors[$i]);
					if ($c < 0.0 || $c > 1.0) {
						$c = 1.0;
					}

					$colors[$i] = sprintf('%2.1f', $c);
				}
			}
		}

		return $colors;
	}
}