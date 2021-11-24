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
use DateTimeZone;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Service\Appointments\AvailabilityGenerator;
use OCA\Calendar\Service\Appointments\Interval;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\Calendar\ICalendarQuery;
use PHPUnit\Framework\MockObject\MockObject;

class AvailabilityGeneratorTest extends TestCase {

	/** @var ITimeFactory|MockObject */
	private $timeFactory;

	/** @var AvailabilityGenerator */
	private $generator;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->timeFactory = $this->createMock(ITimeFactory::class);

		$this->generator = new AvailabilityGenerator(
			$this->timeFactory,
		);
	}

	public function testNoAvailabilitySet(): void {
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 3600, 2 * 3600);

		self::assertEquals(
			[new Interval(1 * 3600, 2 * 3600)],
			$slots,
		);
	}

	public function testNoAvailabilitySetRoundToFive(): void {
		$config = new AppointmentConfig();
		$config->setLength(47 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, (int)2.8 * 3600, 4 * 3600);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 300);
	}

	public function testNoAvailabilitySetRoundWithIncrement(): void {
		$config = new AppointmentConfig();
		$config->setLength(90 * 60);
		$config->setIncrement(60 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 5400, 2 * 5400);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 5400);
	}

	public function testNoAvailabilitySetRoundWithPrettyNumbers(): void {
		$config = new AppointmentConfig();
		$config->setLength(90 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 5400 + 1, 2 * 5400 + 1);

		self::assertCount(1, $slots);
		self::assertEquals($slots[0]->getStart(), 2 * 5400);
		self::assertEquals(0, $slots[0]->getStart() % 5400);
	}

	public function testNoAvailabilitySetRoundWithFourtyMinutes(): void {
		$config = new AppointmentConfig();
		$config->setLength(40 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 2400, 2 * 2400);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 2400);
	}

	public function testNoAvailabilitySetRoundWithFourtyMinutesNotPretty(): void {
		$config = new AppointmentConfig();
		$config->setLength(40 * 60);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 2400 + 1, 2 * 2400 + 1);

		self::assertCount(1, $slots);
		self::assertEquals($slots[0]->getStart(), 2 * 2400);
		self::assertEquals(0, $slots[0]->getStart() % 2400);
	}

	public function testNoAvailabilityButEndDate(): void {
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(null);
		$config->setEnd(10 * 3600);

		$slots = $this->generator->generate($config, 4 * 3600, 15 * 3600);

		self::assertEquals(
			[new Interval(4 * 3600, 10 * 3600)],
			$slots,
		);
	}

	public function testNoAvailabilityAfterEndDate(): void {
		$this->timeFactory->method('getTime')
			->willReturn(15 * 3600);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(null);
		$config->setEnd(10 * 3600);

		$slots = $this->generator->generate($config, 13 * 3600, 15 * 3600);

		self::assertEmpty($slots);
	}

	public function testSimpleRule(): void {
		$dateTime = new DateTimeImmutable();
		$tz = new DateTimeZone('Europe/Vienna');
		$startTimestamp = $dateTime
			->setTimezone($tz)
			->setDate(2021, 11, 22)
			->setTime(8, 0)->getTimestamp();
		$endTimestamp = $dateTime
			->setTimezone($tz)
			->setTime(17, 0)->getTimestamp();
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'TU' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'WE' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'TH' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'FR' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'SA' => [],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$wednesdayMidnight = (new DateTimeImmutable())->setDate(2021, 11, 3)->setTime(0, 0);
		$thursdayMidnight = $wednesdayMidnight->modify('+1 day');

		$slots = $this->generator->generate($config, $wednesdayMidnight->getTimestamp(), $thursdayMidnight->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testViennaComplexRule(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(12, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'TU' => [
					[
						'start' => $dateTime->setTime(8, 30)->getTimestamp(),
						'end' => $dateTime->setTime(11, 45)->getTimestamp(),
					]
				],
				'WE' => [
					[
						'start' => $dateTime->setTime(13, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					]
				],
				'TH' => [
					[
						'start' => $dateTime->setTime(19, 0)->getTimestamp(),
						'end' => $dateTime->setTime(23, 59)->getTimestamp(),
					]
				],
				'FR' => [
					[
						'start' => $dateTime->setTime(6, 0)->getTimestamp(),
						'end' => $dateTime->setTime(8, 0)->getTimestamp(),
					]
				],
				'SA' => [
					[
						'start' => $dateTime->setTime(1, 52)->getTimestamp(),
						'end' => $dateTime->setTime(17, 0)->getTimestamp(),
					]
				],
				'SU' => [],
			]
		], JSON_THROW_ON_ERROR));
		$mondayMidnight = (new DateTimeImmutable())->setDate(2021, 11, 1)->setTime(0, 0);
		$sundayMidnight = $mondayMidnight->modify('+1 days');

		$slots = $this->generator->generate($config, $mondayMidnight->getTimestamp(), $sundayMidnight->getTimestamp());

		self::assertCount(2, $slots);
	}

	public function testViennaComplexRuleWithLunch(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(12, 0)->getTimestamp(),
					]
				],
				'TU' => [
					[
						'start' => $dateTime->setTime(8, 30)->getTimestamp(),
						'end' => $dateTime->setTime(11, 45)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'WE' => [
					[
						'start' => $dateTime->setTime(13, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					]
				],
				'TH' => [
					[
						'start' => $dateTime->setTime(19, 0)->getTimestamp(),
						'end' => $dateTime->setTime(23, 59)->getTimestamp(),
					]
				],
				'FR' => [
					[
						'start' => $dateTime->setTime(6, 0)->getTimestamp(),
						'end' => $dateTime->setTime(8, 0)->getTimestamp(),
					]
				],
				'SA' => [
					[
						'start' => $dateTime->setTime(1, 52)->getTimestamp(),
						'end' => $dateTime->setTime(17, 0)->getTimestamp(),
					]
				],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$mondayMidnight = (new DateTimeImmutable())->setDate(2021, 11, 1)->setTime(0, 0);
		$sundayMidnight = $mondayMidnight->modify('+1 days');

		$slots = $this->generator->generate($config, $mondayMidnight->getTimestamp(), $sundayMidnight->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testForAuckland(): void {
		$tz = new DateTimeZone('Pacific/Auckland');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$startTimestamp = $dateTime->setTimezone($tz)->setDate(2021, 11, 22)->setTime(8, 0)->getTimestamp();
		$endTimestamp = $dateTime->setTime(17, 0)->getTimestamp();
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'TU' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'WE' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'TH' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'FR' => [
					[
						'start' => $startTimestamp,
						'end' => $endTimestamp,
					]
				],
				'SA' => [],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$wednesdayMidnight = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 3)->setTime(0, 0);
		$thursdayMidnight = $wednesdayMidnight->modify('+1 day');

		$slots = $this->generator->generate($config, $wednesdayMidnight->getTimestamp(), $thursdayMidnight->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testAucklandComplexRule(): void {
		$tz = new DateTimeZone('Pacific/Auckland');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(12, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'TU' => [
					[
						'start' => $dateTime->setTime(8, 30)->getTimestamp(),
						'end' => $dateTime->setTime(11, 45)->getTimestamp(),
					]
				],
				'WE' => [
					[
						'start' => $dateTime->setTime(13, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					]
				],
				'TH' => [
					[
						'start' => $dateTime->setTime(19, 0)->getTimestamp(),
						'end' => $dateTime->setTime(23, 59)->getTimestamp(),
					]
				],
				'FR' => [
					[
						'start' => $dateTime->setTime(6, 0)->getTimestamp(),
						'end' => $dateTime->setTime(8, 0)->getTimestamp(),
					]
				],
				'SA' => [
					[
						'start' => $dateTime->setTime(1, 52)->getTimestamp(),
						'end' => $dateTime->setTime(17, 0)->getTimestamp(),
					]
				],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$wednesdayMidnight = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 1)->setTime(0, 0);
		$thursdayMidnight = $wednesdayMidnight->modify('+1 day');

		$slots = $this->generator->generate($config, $wednesdayMidnight->getTimestamp(), $thursdayMidnight->getTimestamp());

		self::assertCount(2, $slots);
	}

	public function testAucklandAndViennaComplexRule(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(12, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'TU' => [
					[
						'start' => $dateTime->setTime(8, 30)->getTimestamp(),
						'end' => $dateTime->setTime(11, 45)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'WE' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(15, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'TH' => [
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(19, 0)->getTimestamp(),
						'end' => $dateTime->setTime(23, 59)->getTimestamp(),
					]
				],
				'FR' => [
					[
						'start' => $dateTime->setTime(6, 0)->getTimestamp(),
						'end' => $dateTime->setTime(8, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(10, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					]
				],
				'SA' => [
					[
						'start' => $dateTime->setTime(1, 52)->getTimestamp(),
						'end' => $dateTime->setTime(17, 0)->getTimestamp(),
					]
				],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$auckland = new DateTimeZone('Pacific/Auckland');
		$wednesdayMidnight = (new DateTimeImmutable())->setTimezone($auckland)->setDate(2021, 11, 3)->setTime(0, 0);
		$thursdayMidnight = $wednesdayMidnight->modify('+1 day');

		$slots = $this->generator->generate($config, $wednesdayMidnight->getTimestamp(), $thursdayMidnight->getTimestamp());

		self::assertCount(2, $slots);
	}

	public function testAucklandAndViennaComplexRuleNoResult(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setAvailability(json_encode([
			'timezoneId' => $tz->getName(),
			'slots' => [
				'MO' => [
					[
						'start' => $dateTime->setTime(8, 0)->getTimestamp(),
						'end' => $dateTime->setTime(12, 0)->getTimestamp(),
					],
					[
						'start' => $dateTime->setTime(14, 0)->getTimestamp(),
						'end' => $dateTime->setTime(18, 0)->getTimestamp(),
					]
				],
				'TU' => [
					[
						'start' => $dateTime->setTime(8, 30)->getTimestamp(),
						'end' => $dateTime->setTime(11, 45)->getTimestamp(),
					]
				],
				'WE' => [
					[
						'start' => $dateTime->setTime(13, 0)->getTimestamp(),
						'end' => $dateTime->setTime(14, 0)->getTimestamp(),
					]
				],
				'TH' => [
					[
						'start' => $dateTime->setTime(19, 0)->getTimestamp(),
						'end' => $dateTime->setTime(23, 59)->getTimestamp(),
					]
				],
				'FR' => [
					[
						'start' => $dateTime->setTime(6, 0)->getTimestamp(),
						'end' => $dateTime->setTime(8, 0)->getTimestamp(),
					]
				],
				'SA' => [
					[
						'start' => $dateTime->setTime(1, 52)->getTimestamp(),
						'end' => $dateTime->setTime(17, 0)->getTimestamp(),
					]
				],
				'SU' => []
			]
		], JSON_THROW_ON_ERROR));
		$auckland = new DateTimeZone('Pacific/Auckland');
		$wednesdayMidnight = (new DateTimeImmutable())->setTimezone($auckland)->setDate(2021, 11, 3)->setTime(0, 0);
		$thursdayMidnight = $wednesdayMidnight->modify('+1 day');

		$slots = $this->generator->generate($config, $wednesdayMidnight->getTimestamp(), $thursdayMidnight->getTimestamp());
		self::assertCount(0, $slots);
	}
}
