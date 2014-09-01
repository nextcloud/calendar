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

class UtilityTest extends \PHPUnit_Framework_TestCase {


	/**
	 * @dataProvider slugifyProvider
	 */
	public function testSlugify($input, $expected) {
		$this->assertSame($expected, Utility::slugify($input));
	}


	public function slugifyProvider() {
		return [
			['test', 'test'],
			['test ', 'test'],
			['test 1', 'test-1'],
			['te!@#$%^&*()_+st', 'te-st'],
			['äöü', 'aou'],
		];
	}


	public function testSlugifyEmptyInput() {
		$this->assertNotEmpty(Utility::slugify(''));
	}
}
