<?php

declare(strict_types=1);

/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

namespace OCA\Calendar\Tests\Unit\Listener;

use ChristophWurst\Nextcloud\Testing\TestCase;
use DateTime;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Events\BeforeAppointmentBookedEvent;
use OCA\Calendar\Listener\AppointmentBookedListener;
use OCP\IUser;
use OCP\Talk\IConversation;
use OCP\Talk\IConversationOptions;

class AppointmentBookedListenerTest extends TestCase {
	public function testTalkRoomUsesBookingMeetingDates(): void {
		$start = new DateTime('2026-11-18T10:00:00Z');
		$end = new DateTime('2026-11-18T10:30:00Z');
		$config = new AppointmentConfig();
		$config->setUserId('organizer');
		$config->setName('Consultation');
		$config->setCreateTalkRoom(true);
		$booking = new Booking();
		$booking->setDisplayName('Visitor');
		$booking->setStart($start->getTimestamp());
		$booking->setEnd($end->getTimestamp());
		$organizer = $this->createMock(IUser::class);
		$options = $this->createMock(IConversationOptions::class);
		$options->expects($this->once())->method('setPublic');
		$options->expects($this->once())->method('setMeetingDate')->with($start, $end);
		$conversation = $this->createMock(IConversation::class);
		$conversation->method('getAbsoluteUrl')->willReturn('https://cloud.example.com/call/token');
		$service = $this->createServiceMock(AppointmentBookedListener::class);
		$service->getParameter('userManager')->method('get')->with('organizer')->willReturn($organizer);
		$service->getParameter('l10n')->method('t')->willReturn('Consultation with Visitor');
		$service->getParameter('timeFactory')->method('getDateTime')
			->willReturnCallback(fn (string $time): DateTime => new DateTime($time));
		$broker = $service->getParameter('broker');
		$broker->method('hasBackend')->willReturn(true);
		$broker->method('newConversationOptions')->willReturn($options);
		$broker->expects($this->once())->method('createConversation')
			->with('Consultation with Visitor', [$organizer], $options)
			->willReturn($conversation);

		$service->getService()->handle(new BeforeAppointmentBookedEvent($booking, $config));

		$this->assertSame('https://cloud.example.com/call/token', $booking->getTalkUrl());
	}
}
