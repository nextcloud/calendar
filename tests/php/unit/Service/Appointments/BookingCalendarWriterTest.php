<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Service\Appointments\BookingCalendarWriter;
use OCA\Calendar\Service\Appointments\TimezoneGenerator;
use OCP\Calendar\ICreateFromString;
use OCP\Calendar\IManager;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IUser;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use Sabre\VObject\Component\VCalendar;

class BookingCalendarWriterTest extends TestCase {
	public function testWriteUsesMinimalCalendarForAppointmentAndBuffers(): void {
		$config = new AppointmentConfig();
		$config->setUserId('organizer');
		$config->setTargetCalendarUri('personal');
		$config->setPreparationDuration(300);
		$config->setFollowupDuration(600);
		$booking = new Booking();
		$calendar = $this->createMock(ICreateFromString::class);
		$manager = $this->createMock(IManager::class);
		$manager->method('getCalendarsForPrincipal')
			->with('principals/users/organizer', ['personal'])
			->willReturn([$calendar]);
		$userManager = $this->createMock(IUserManager::class);
		$userManager->method('get')->with('organizer')->willReturn($this->createMock(IUser::class));
		$l10nFactory = $this->createMock(IFactory::class);
		$l10nFactory->method('get')->willReturn($this->createMock(IL10N::class));
		$appointment = new VCalendar(['VEVENT' => ['SUMMARY' => 'Appointment']]);
		$preparation = new VCalendar(['VEVENT' => ['SUMMARY' => 'Preparation']]);
		$followup = new VCalendar(['VEVENT' => ['SUMMARY' => 'Followup']]);
		$writer = $this->getMockBuilder(BookingCalendarWriter::class)
			->setConstructorArgs([
				$this->createMock(IConfig::class),
				$manager,
				$userManager,
				$l10nFactory,
				$this->createMock(TimezoneGenerator::class),
			])
			->onlyMethods(['generateAppointment', 'generatePreAppointment', 'generatePostAppointment'])
			->getMock();
		$writer->method('generateAppointment')->willReturn($appointment);
		$writer->method('generatePreAppointment')->willReturn($preparation);
		$writer->method('generatePostAppointment')->willReturn($followup);
		$written = [];
		$calendar->expects($this->never())->method('createFromString');
		$calendar->expects($this->exactly(3))->method('createFromStringMinimal')
			->willReturnCallback(function (string $name, string $data) use (&$written): void {
				$this->assertMatchesRegularExpression('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.ics$/', $name);
				$written[] = $data;
			});

		$result = $writer->write($config, $booking);

		$this->assertSame($appointment->serialize(), $result);
		$this->assertSame([$appointment->serialize(), $preparation->serialize(), $followup->serialize()], $written);
	}
}
