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
use DateTimeImmutable;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\AvailabilityGenerator;
use OCA\Calendar\Service\Appointments\Interval;

class AvailabilityGeneratorTest extends TestCase {

	/** @var AvailabilityGenerator */
	private $generator;

	protected function setUp(): void {
		parent::setUp();

		$this->generator = new AvailabilityGenerator();
	}

	public function testNoAvailabilitySet(): void {
		$config = new AppointmentConfig();
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1, 2);

		self::assertEquals(
			[new Interval(1, 2)],
			$slots,
		);
	}

	public function testSimpleRrule(): void {
		$config = new AppointmentConfig();
		$config->setAvailability('RRULE:FREQ=MINUTELY;INTERVAL=15;WKST=MO;BYDAY=MO;BYHOUR=8,9,10,11');

		$mondayMidnight = (new DateTimeImmutable())->setDate(2021, 11, 1)->setTime(0, 0);
		$sundayMidnight = $mondayMidnight->modify('+7 days');

		$slots = $this->generator->generate($config, $mondayMidnight->getTimestamp(), $sundayMidnight->getTimestamp());

		self::assertCount(5, $slots);
	}
}
