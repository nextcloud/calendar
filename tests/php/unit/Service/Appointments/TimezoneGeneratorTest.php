<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
		$this->assertNotNull($generated->STANDARD);
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
			['Europe/Berlin', 3, 4, $microsoftExchangeMap['Europe/Berlin']],
			['Europe/London', 3, 4, $microsoftExchangeMap['Europe/London']],
			['Australia/Adelaide', 4, 3, $microsoftExchangeMap['Australia/Adelaide']],
		];
	}

	public function providerNoDaylightSaving(): array {
		$microsoftExchangeMap = array_flip(TimeZoneUtil::$microsoftExchangeMap);
		return [
			['Pacific/Midway', null, 1, $microsoftExchangeMap['Pacific/Midway']],
			['Asia/Singapore', null, 1, $microsoftExchangeMap['Asia/Singapore']],
		];
	}


}
