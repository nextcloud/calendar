<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author 2023 Anna Larch <anna.larch@gmx.net>
 * @copyright 2023 Anna Larch <anna.larch@gmx.net>
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
namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Service\Appointments\TimezoneGenerator;
use Sabre\VObject\Component\VTimeZone;
use Sabre\VObject\TimeZoneUtil;

class TimezoneGeneratorTest extends TestCase {

	protected TimezoneGenerator $timezoneGenerator;
	protected function setUp(): void {
		$this->timezoneGenerator = new TimezoneGenerator();
	}

	/**
	 * @dataProvider providerDaylightSaving
	 */
	public function testWithDaylightSaving($timezone, $daytime, $standard, $msTimezoneId): void {
		/** @var VTimeZone $generated */
		$generated = $this->timezoneGenerator->generateVtimezone($timezone, 1640991600, 1672527600);

		$this->assertEquals($timezone, $generated->TZID->getValue());
		$this->assertNotNull($generated->DAYLIGHT);
		$this->assertCount($daytime, $generated->DAYLIGHT->getIterator());
		$this->assertNotNull($generated->STANDARD);
		$this->assertCount($standard, $generated->STANDARD->getIterator());
		$this->assertEquals($generated->{'X-MICROSOFT-CDO-TZID'}->getValue(), $msTimezoneId);
	}

	/**
	 * @dataProvider providerNoDaylightSaving
	 */
	public function testNoDaylightSaving($timezone, $daytime, $standard, $msTimezoneId): void {
		/** @var VTimeZone $generated */
		$generated = $this->timezoneGenerator->generateVtimezone($timezone, 1640991600, 1672527600);

		$this->assertEquals($timezone, $generated->TZID->getValue());
		$this->assertNull($generated->DAYLIGHT);
		$this->assertNull($generated->STANDARD);
		$this->assertEquals($generated->{'X-MICROSOFT-CDO-TZID'}->getValue(), $msTimezoneId);
	}

	public function testInvalid(): void {
		/** @var VTimeZone $generated */
		$generated = $this->timezoneGenerator->generateVtimezone('Nonsense', 1640991600, 1672527600);

		$this->assertNull($generated);
	}

	public function providerDaylightSaving(): array {
		$microsoftExchangeMap = array_flip(TimeZoneUtil::$microsoftExchangeMap);
		return [
			['Europe/Berlin', 3, 3, $microsoftExchangeMap['Europe/Berlin']],
			['Europe/London', 3, 3, $microsoftExchangeMap['Europe/London']],
			['Australia/Adelaide', 3, 3, $microsoftExchangeMap['Australia/Adelaide']],
		];
	}

	public function providerNoDaylightSaving(): array {
		$microsoftExchangeMap = array_flip(TimeZoneUtil::$microsoftExchangeMap);
		return [
			['Pacific/Midway', null, null, $microsoftExchangeMap['Pacific/Midway']],
			['Asia/Singapore', null, null, $microsoftExchangeMap['Asia/Singapore']],
		];
	}


}
