<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Db;

use ChristophWurst\Nextcloud\Testing\TestCase;
use JsonException;
use OCA\Calendar\Db\AppointmentConfig;

class AppointmentConfigTest extends TestCase {
	public function testUnsetJsonFields(): void {
		$config = new AppointmentConfig();

		$this->assertSame([], $config->getCalendarFreebusyUrisAsArray());
		$this->assertSame([], $config->getAvailabilityAsArray());
		$this->assertSame([], $config->jsonSerialize()['calendarFreeBusyUris']);
		$this->assertNull($config->jsonSerialize()['availability']);
	}

	public function testJsonFieldsRoundTrip(): void {
		$config = new AppointmentConfig();
		$uris = ['personal', 'work'];
		$availability = ['timezoneId' => 'Europe/Berlin', 'slots' => []];

		$this->assertSame($config, $config->setCalendarFreeBusyUrisAsArray($uris));
		$this->assertSame($config, $config->setAvailabilityAsArray($availability));

		$this->assertSame($uris, $config->getCalendarFreebusyUrisAsArray());
		$this->assertSame($availability, $config->getAvailabilityAsArray());
		$this->assertSame($uris, $config->jsonSerialize()['calendarFreeBusyUris']);
		$this->assertSame($availability, $config->jsonSerialize()['availability']);
	}

	/**
	 * @dataProvider jsonDecoders
	 */
	public function testMalformedStoredJsonIsRejected(string $setter, string $reader): void {
		$config = new AppointmentConfig();
		$config->$setter('{invalid');

		$this->expectException(JsonException::class);

		$config->$reader();
	}

	public static function jsonDecoders(): array {
		return [
			'freebusy getter' => ['setCalendarFreebusyUris', 'getCalendarFreebusyUrisAsArray'],
			'availability getter' => ['setAvailability', 'getAvailabilityAsArray'],
			'freebusy serialization' => ['setCalendarFreebusyUris', 'jsonSerialize'],
			'availability serialization' => ['setAvailability', 'jsonSerialize'],
		];
	}

	/**
	 * @dataProvider jsonEncoders
	 */
	public function testInvalidUtf8IsRejected(string $setter): void {
		$config = new AppointmentConfig();

		$this->expectException(JsonException::class);

		$config->$setter(["\xB1\x31"]);
	}

	public static function jsonEncoders(): array {
		return [
			'freebusy' => ['setCalendarFreeBusyUrisAsArray'],
			'availability' => ['setAvailabilityAsArray'],
		];
	}
}
