<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
use Psr\Log\LoggerInterface;

class AvailabilityGeneratorTest extends TestCase {
	private ITimeFactory|MockObject $timeFactory;
	private MockObject|LoggerInterface $logger;
	private AvailabilityGenerator $generator;
	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->timeFactory = $this->createMock(ITimeFactory::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->generator = new AvailabilityGenerator(
			$this->timeFactory,
			$this->logger,
		);
	}

	public function testNoAvailabilitySet(): void {
		$config = new AppointmentConfig();
		$config->setLength(60 * 60);
		$config->setIncrement(300);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 3600, 2 * 3600);

		self::assertEquals(
			[new Interval(1 * 3600, 2 * 3600)],
			$slots,
		);
	}

	public function testNoAvailabilitySetRoundToFive(): void {
		$config = new AppointmentConfig();
		$config->setLength(2820);
		$config->setIncrement(900);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 3610, 4 * 3600);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 900);
		self::assertEquals(4500, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundWithSpecificTimes(): void {
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(900);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1637837100, 1637840700);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 900);
		self::assertEquals(3600, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(1637837100, 1637840700)],
			$slots,
		);
	}

	public function testNoAvailabilitySetRoundWithRealLifeTimes(): void {
		$config = new AppointmentConfig();
		$config->setLength(900);
		$config->setIncrement(3600);
		$config->setAvailability(null);

		$sdate = new \DateTime('2024-03-04 10:00');
		$edate = new \DateTime('2024-03-04 10:15');

		$slots = $this->generator->generate($config, $sdate->getTimestamp(), $edate->getTimestamp());

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(900, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(1709546400, 1709547300)],
			$slots,
		);
	}

	public function testNoAvailabilityQuarterHourIncrementsFourtyFiveMinutesLenght(): void {
		$config = new AppointmentConfig();
		$config->setLength(2700); // 45 minutes
		$config->setIncrement(900); // 15 minutes
		$config->setAvailability(null);

		$this->timeFactory->expects(self::once())
			->method('getTime')
			->willReturn(1709546400);

		$sdate = new \DateTime('2024-03-04 10:00');
		$edate = new \DateTime('2024-03-04 10:45');

		$slots = $this->generator->generate($config, $sdate->getTimestamp(), $edate->getTimestamp());

		self::assertCount(1, $slots);
		self::assertEquals(0, ($slots[0]->getStart() % $config->getIncrement()));
		self::assertEquals(45 * 60, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(1709546400, 1709549100)],
			$slots,
		);
	}

	public function testNoAvailabilityZeroTo2700QuarterHourIncrementsFourtyFiveMinutesLenght(): void {
		$config = new AppointmentConfig();
		$config->setLength(2700); // 45 minutes
		$config->setIncrement(900); // 15 minutes
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 0, 2700);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 2700);
		self::assertEquals(45 * 60, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(0, 45 * 60)],
			$slots,
		);
	}


	public function testNoAvailabilitySetRoundWithRealLifeTimesUgly(): void {
		$config = new AppointmentConfig();
		$config->setLength(900);
		$config->setIncrement(3600);
		$config->setAvailability(null);

		$sdate = new \DateTime('2024-03-04 09:50');
		$edate = new \DateTime('2024-03-04 10:15');

		$slots = $this->generator->generate($config, $sdate->getTimestamp(), $edate->getTimestamp());

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(900, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(1709546400, 1709547300)],
			$slots,
		);
	}

	public function testNoAvailabilitySetRoundWithRealLifeTimesUglyTwo(): void {
		$config = new AppointmentConfig();
		$config->setLength(900);
		$config->setIncrement(3600);
		$config->setAvailability(null);

		$sdate = new \DateTime('2024-03-04 09:01');
		$edate = new \DateTime('2024-03-04 10:15');

		$slots = $this->generator->generate($config, $sdate->getTimestamp(), $edate->getTimestamp());

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(900, ($slots[0]->getEnd() - $slots[0]->getStart()));
		self::assertEquals(
			[new Interval(1709546400, 1709547300)],
			$slots,
		);
	}

	public function testNoAvailabilitySetRoundWithIncrementForHalfHour(): void {
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(3600);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 1800, 3 * 3600);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(3600, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundWithIncrementForTwoHours(): void {
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(7200);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 1800, 3 * 3600);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(7200, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundWithIncrementForFullHour(): void {
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(3600);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 3600, 2 * 3600);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 3600);
		self::assertEquals(3600, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundToPrettyNumbers(): void {
		$config = new AppointmentConfig();
		$config->setLength(3550);
		$config->setIncrement(300);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 3550 + 1, 2 * 3550 + 1);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 300);
		self::assertEquals(3600, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundWithFourtyMinutes(): void {
		$config = new AppointmentConfig();
		$config->setLength(2400);
		$config->setIncrement(600);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 2400, 2 * 2400);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 600);
		self::assertEquals(2400, $slots[0]->getStart());
	}

	public function testNoAvailabilitySetRoundWithFourtyMinutesNotPretty(): void {
		$config = new AppointmentConfig();
		$config->setLength(2400);
		$config->setIncrement(300);
		$config->setAvailability(null);

		$slots = $this->generator->generate($config, 1 * 2400 + 1, 2 * 2400 + 1);

		self::assertCount(1, $slots);
		self::assertEquals(0, $slots[0]->getStart() % 300);
		self::assertEquals(2700, $slots[0]->getStart());
	}

	public function testNoAvailabilityButEndDate(): void {
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(300);
		$config->setAvailability(null);
		$config->setEnd(10 * 3600);

		$slots = $this->generator->generate($config, 4 * 3600, 15 * 3600);

		self::assertEquals(
			[new Interval(4 * 3600, 10 * 3600)],
			$slots,
		);
		self::assertEquals(4 * 3600, $slots[0]->getStart());
	}

	public function testNoAvailabilityAfterEndDate(): void {
		$this->timeFactory->method('getTime')
			->willReturn(15 * 3600);
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(3600);
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
		$config->setLength(3600);
		$config->setIncrement(3600);
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

	public function testSimpleRuleUgly(): void {
		$dateTime = new DateTimeImmutable();
		$tz = new DateTimeZone('Europe/Vienna');
		$startTimestamp = $dateTime
			->setTimezone($tz)
			->setDate(2021, 11, 22)
			->setTime(8, 10)->getTimestamp();
		$endTimestamp = $dateTime
			->setTimezone($tz)
			->setTime(17, 0)->getTimestamp();
		$config = new AppointmentConfig();
		$config->setLength(900);
		$config->setIncrement(3600);
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
		$start = (new DateTimeImmutable())->setDate(2021, 11, 3)->setTime(9, 0);
		$end = $start->modify('+15 minutes');

		$slots = $this->generator->generate($config, $start->getTimestamp(), $end->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testSimpleRuleUglyTwo(): void {
		$dateTime = new DateTimeImmutable();
		$tz = new DateTimeZone('Europe/Vienna');
		$startTimestamp = $dateTime
			->setTimezone($tz)
			->setDate(2021, 11, 22)
			->setTime(8, 10)->getTimestamp();
		$endTimestamp = $dateTime
			->setTimezone($tz)
			->setTime(17, 0)->getTimestamp();
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(900);
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
		$start = (new DateTimeImmutable())->setDate(2021, 11, 3)->setTime(9, 15);
		$end = $start->modify('+1 hour');

		$slots = $this->generator->generate($config, $start->getTimestamp(), $end->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testSimpleRuleUglyEqual(): void {
		$dateTime = new DateTimeImmutable();
		$tz = new DateTimeZone('Europe/Vienna');
		$startTimestamp = $dateTime
			->setTimezone($tz)
			->setDate(2021, 11, 22)
			->setTime(8, 10)->getTimestamp();
		$endTimestamp = $dateTime
			->setTimezone($tz)
			->setTime(17, 0)->getTimestamp();
		$config = new AppointmentConfig();
		$config->setLength(900);
		$config->setIncrement(900);
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
		$start = (new DateTimeImmutable())->setDate(2021, 11, 3)->setTime(9, 15);
		$end = $start->modify('+15 minutes');

		$slots = $this->generator->generate($config, $start->getTimestamp(), $end->getTimestamp());

		self::assertCount(1, $slots);
	}

	public function testViennaComplexRule(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(3600);
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
		$config->setLength(3600);
		$config->setIncrement(3600);
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
		$config->setLength(3600);
		$config->setIncrement(3600);
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
		$config->setLength(3600);
		$config->setIncrement(3600);

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
		$config->setLength(3600);
		$config->setIncrement(3600);
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
		$config->setLength(3600);
		$config->setIncrement(3600);
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

	public function testViennaComplexRuleForBooking(): void {
		$tz = new DateTimeZone('Europe/Vienna');
		$dateTime = (new DateTimeImmutable())->setTimezone($tz)->setDate(2021, 11, 22);
		$config = new AppointmentConfig();
		$config->setLength(3600);
		$config->setIncrement(3600);
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
						'start' => $dateTime->setTime(13, 10)->getTimestamp(),
						'end' => $dateTime->setTime(16, 0)->getTimestamp(),
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
		$mondayMidnight = (new DateTimeImmutable())->setDate(2021, 11, 13)->setTime(13, 10);
		$sundayMidnight = $mondayMidnight->modify('+1 hour');

		$slots = $this->generator->generate($config, $mondayMidnight->getTimestamp(), $sundayMidnight->getTimestamp());

		self::assertCount(1, $slots);
	}
}
