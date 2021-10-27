<?php

declare(strict_types=1);

/*
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\Interval;
use OCA\Calendar\Service\Appointments\SlotExtrapolator;

class SlotExtrapolatorTest extends TestCase {

	/** @var SlotExtrapolator */
	private $extrapolator;

	protected function setUp(): void {
		parent::setUp();

		$this->extrapolator = new SlotExtrapolator();
	}

	public function testNoAvailability(): void {
		$config = new AppointmentConfig();
		$config->setLength(60);
		$config->setIncrement(15);
		$availabilityIntervals = [];

		$slots = $this->extrapolator->extrapolate($config, $availabilityIntervals);

		self::assertEmpty($slots);
	}

	/**
	 * A half our availability can't fit an hour long appointment
	 */
	public function testNoneFits(): void {
		$config = new AppointmentConfig();
		$config->setLength(60);
		$config->setIncrement(15);
		$availabilityIntervals = [
			new Interval(0, 30 * 60),
		];

		$slots = $this->extrapolator->extrapolate($config, $availabilityIntervals);

		self::assertEmpty($slots);
	}

	/**
	 * An hour long availability fits exactly one hour long appointment
	 */
	public function testExactlyOne(): void {
		$config = new AppointmentConfig();
		$config->setLength(60);
		$config->setIncrement(15);
		$availabilityIntervals = [
			new Interval(0, 60 * 60),
		];

		$slots = $this->extrapolator->extrapolate($config, $availabilityIntervals);

		self::assertCount(1, $slots);
	}

	/**
	 * 1.5h available allow three hour long appointments with 15m increments
	 */
	public function testOverlaps(): void {
		$config = new AppointmentConfig();
		$config->setLength(60);
		$config->setIncrement(15);
		$availabilityIntervals = [
			new Interval(0, 90 * 60),
		];

		$slots = $this->extrapolator->extrapolate($config, $availabilityIntervals);

		self::assertCount(3, $slots);
	}

	/**
	 * More than one availability that fits an appointments means multiple slots
	 */
	public function testMultipleIntervals(): void {
		$config = new AppointmentConfig();
		$config->setLength(60);
		$config->setIncrement(15);
		$availabilityIntervals = [
			new Interval(0, 60 * 60),
			new Interval(100 * 60, 160 * 60),
		];

		$slots = $this->extrapolator->extrapolate($config, $availabilityIntervals);

		self::assertCount(2, $slots);
	}
}
