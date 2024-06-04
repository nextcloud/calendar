<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
use OCA\Calendar\Notification\Notifier;
use OCP\IL10N;
use OCP\IURLGenerator;
use OCP\L10N\IFactory;
use OCP\Notification\INotification;
use PHPUnit\Framework\MockObject\MockObject;

class NotifierTest extends \PHPUnit\Framework\TestCase {
	/** @var Notifier */
	protected $notifier;
	/** @var IFactory|MockObject */
	protected $factory;
	/** @var IURLGenerator|MockObject */
	protected $url;
	/** @var IL10N|MockObject */
	protected $l;

	protected function setUp(): void {
		parent::setUp();

		$this->l = $this->createMock(IL10N::class);
		$this->l->expects($this->any())
			->method('t')
			->willReturnCallback(function ($string, $args) {
				return vsprintf($string, $args);
			});
		$this->factory = $this->createMock(IFactory::class);
		$this->url = $this->createMock(IURLGenerator::class);
		$this->factory->expects($this->any())
			->method('get')
			->willReturn($this->l);

		$this->notifier = new Notifier(
			$this->factory,
			$this->url
		);
	}

	public function testPrepareWrongApp(): void {
		$this->expectException(\InvalidArgumentException::class);

		/** @var INotification|MockObject $notification */
		$notification = $this->createMock(INotification::class);
		$notification->expects($this->once())
			->method('getApp')
			->willReturn('notifications');
		$notification->expects($this->never())
			->method('getSubject');

		$this->notifier->prepare($notification, 'en');
	}

	public function testPrepareWrongSubject(): void {
		$this->expectException(\InvalidArgumentException::class);

		/** @var INotification|MockObject $notification */
		$notification = $this->createMock(INotification::class);
		$notification->expects($this->once())
			->method('getApp')
			->willReturn('calendar');
		$notification->expects($this->once())
			->method('getSubject')
			->willReturn('wrong subject');

		$this->notifier->prepare($notification, 'en');
	}

	public function testPrepare(): void {
		/** @var INotification|MockObject $notification */
		$notification = $this->createMock(INotification::class);
		$notification->setApp('calendar')
			->setUser('test')
			->setObject('booking', '123')
			->setSubject('booking_accepted',
				[
					'type' => 'highlight',
					'id' => 123,
					'name' => 'Test',
					'link' => 'link/to/calendar'
				])
			->setDateTime(new \DateTime())
			->setMessage('booking_accepted_message',
				[
					'type' => 'highlight',
					'id' => 123,
					'display_name' => 'Bob',
					'config_display_name' => 'Test',
					'link' => 'link/to/calendar',
					'email' => 'test@test.com',
					'date_time' => new \DateTime()
				]
			);
		$parameters = [
			'id' => 123,
			'type' => 'highlight',
			'name' => 'Test',
			'link' => 'link/to/calendar'
		];
		$booking = [
			'booking' => $parameters
		];
		$messageParameters = [
			'type' => 'highlight',
			'id' => 123,
			'display_name' => 'Bob',
			'config_display_name' => 'Test',
			'link' => 'link/to/calendar',
			'email' => 'test@test.com',
			'date_time' => new \DateTime()
		];
		$messageRichData = [
			'display_name' => [
				'type' => 'highlight',
				'id' => $messageParameters['id'],
				'name' => $messageParameters['display_name'],
			],
			'email' => [
				'type' => 'highlight',
				'id' => $messageParameters['id'],
				'name' => $messageParameters['email'],
			],
			'date_time' => [
				'type' => 'highlight',
				'id' => $messageParameters['id'],
				'name' => $messageParameters['date_time'],
			],
			'config_display_name' => [
				'type' => 'highlight',
				'id' => $messageParameters['id'],
				'name' => $messageParameters['config_display_name'],
			]
		];

		$this->url->expects($this->once())
			->method('linkToRouteAbsolute')
			->with('calendar.view.index')
			->willReturn('link/to/calendar');
		$notification->expects($this->once())
			->method('getApp')
			->willReturn('calendar');
		$notification->expects($this->once())
			->method('getSubject')
			->willReturn('booking_accepted');
		$notification->expects($this->once())
			->method('getSubjectParameters')
			->willReturn($parameters);
		$this->factory->expects($this->once())
			->method('get')
			->with('calendar', 'de')
			->willReturn($this->l);
		$notification->expects($this->once())
			->method('setRichSubject')
			->with('New booking {booking}', $booking);
		$notification->expects(self::once())
			->method('getMessageParameters')
			->willReturn($messageParameters);
		$notification->expects($this->once())
			->method('setRichMessage')
			->with('{display_name} ({email}) booked the appointment "{config_display_name}" on {date_time}.', $messageRichData);

		$return = $this->notifier->prepare($notification, 'de');
		$this->assertEquals($notification, $return);
	}
}
