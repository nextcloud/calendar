<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Tests\Unit\Service\Appointments;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OC\URLGenerator;
use OCA\Calendar\Db\AppointmentConfig;
use OCA\Calendar\Db\Booking;
use OCA\Calendar\Exception\ServiceException;
use OCA\Calendar\Service\Appointments\MailService;
use OCP\Calendar\ICalendarQuery;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IUser;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Mail\IMessage;
use OCP\Notification\IManager;
use OCP\Notification\INotification;
use PHPUnit\Framework\MockObject\MockObject;
use Psr\Log\LoggerInterface;

class MailServiceTest extends TestCase {
	/** @var mixed|IUserManager|MockObject */
	private $userManager;

	/** @var mixed|IMailer|MockObject */
	private $mailer;

	/** @var mixed|IL10N|MockObject */
	private $l10n;

	/** @var mixed|Defaults|MockObject */
	private $defaults;

	/** @var mixed|MockObject|LoggerInterface */
	private $logger;

	/** @var mixed|URLGenerator|MockObject */
	private $urlGenerator;

	/** @var mixed|IDateTimeFormatter|MockObject */
	private $dateFormatter;

	/** @var mixed|IFactory|MockObject */
	private $lFactory;

	/** @var IManager|MockObject */
	private $notificationManager;

	/** @var MailService */
	private $mailService;
	private IConfig|MockObject $userConfig;

	protected function setUp(): void {
		parent::setUp();

		if (!interface_exists(ICalendarQuery::class)) {
			self::markTestIncomplete();
		}

		$this->userManager = $this->createMock(IUserManager::class);
		$this->mailer = $this->createMock(IMailer::class);
		$this->l10n = $this->createMock(IL10N::class);
		$this->defaults = $this->createMock(Defaults::class);
		$this->logger = $this->createMock(LoggerInterface::class);
		$this->urlGenerator = $this->createMock(URLGenerator::class);
		$this->dateFormatter = $this->createMock(IDateTimeFormatter::class);
		$this->lFactory = $this->createMock(IFactory::class);
		$this->notificationManager = $this->createMock(IManager::class);
		$this->userConfig = $this->createMock(IConfig::class);
		$this->mailService = new MailService(
			$this->mailer,
			$this->userManager,
			$this->l10n,
			$this->defaults,
			$this->logger,
			$this->urlGenerator,
			$this->dateFormatter,
			$this->lFactory,
			$this->notificationManager,
			$this->userConfig
		);
	}

	public function testSendConfirmationEmail(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setReplyTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(10))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::once())
			->method('get');
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn([]);
		$this->logger->expects(self::never())
			->method('warning');
		$this->logger->expects(self::never())
			->method('debug');

		$this->mailService->sendConfirmationEmail($booking, $config);
	}

	public function testSendConfirmationEmailNoUser(): void {
		$booking = new Booking();
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn(null);
		$this->expectException(ServiceException::class);

		$this->mailService->sendConfirmationEmail($booking, $config);
	}

	public function testSendConfirmationEmailMailerException(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setReplyTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(10))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::once())
			->method('get');
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willThrowException(new \Exception(''));
		$this->expectException(ServiceException::class);

		$this->mailService->sendConfirmationEmail($booking, $config);
	}

	public function testSendConfirmationEmailMailerFailed(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setReplyTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(10))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::once())
			->method('get');
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn(['test@test.com']);
		$this->logger->expects(self::once())
			->method('warning');
		$this->logger->expects(self::once())
			->method('debug');
		$this->expectException(ServiceException::class);

		$this->mailService->sendConfirmationEmail($booking, $config);
	}

	public function testSendBookingInformationEmail(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$config->setAvailabilityAsArray(
			[
				'timezoneId' => 'Europe/Berlin',
				'slots' => [
					'MO' => [['start' => 1713153660, 'end' => 1713239940]],
					'TU' => [['start' => 1713153660, 'end' => 1713239940]],
					'WE' => [['start' => 1713153660, 'end' => 1713239940]],
					'TH' => [['start' => 1713153660, 'end' => 1713239940]],
					'FR' => [['start' => 1713153660, 'end' => 1713239940]],
					'SA' => [['start' => 1713153660, 'end' => 1713239940]],
					'SU' => [['start' => 1713153660, 'end' => 1713239940]]
				]
			]
		);
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setReplyTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->mailer->expects(self::once())
			->method('createAttachment');
		$this->l10n->expects(self::exactly(8))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::once())
			->method('get');
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn([]);
		$this->logger->expects(self::never())
			->method('warning');
		$this->logger->expects(self::never())
			->method('debug');

		$this->mailService->sendBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendBookingInformationEmailFailed(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setReplyTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->mailer->expects(self::once())
			->method('createAttachment');
		$this->l10n->expects(self::exactly(8))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::once())
			->method('get');
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn(['test@test.com']);
		$this->logger->expects(self::once())
			->method('warning');
		$this->logger->expects(self::once())
			->method('debug');
		$this->expectException(ServiceException::class);

		$this->mailService->sendBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendBookingInformationOrganizerNotFound(): void {
		$booking = new Booking();
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn(null);
		$this->expectException(ServiceException::class);

		$this->mailService->sendBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendOrganizerBookingInformationEmail(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$config->setAvailabilityAsArray(
			[
				'timezoneId' => 'Europe/Berlin',
				'slots' => [
					'MO' => [['start' => 1713153660, 'end' => 1713239940]],
					'TU' => [['start' => 1713153660, 'end' => 1713239940]],
					'WE' => [['start' => 1713153660, 'end' => 1713239940]],
					'TH' => [['start' => 1713153660, 'end' => 1713239940]],
					'FR' => [['start' => 1713153660, 'end' => 1713239940]],
					'SA' => [['start' => 1713153660, 'end' => 1713239940]],
					'SU' => [['start' => 1713153660, 'end' => 1713239940]]
				]
			]
		);
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$this->userConfig->expects(self::once())
			->method('getUserValue')
			->willReturn('en');
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->mailer->expects(self::once())
			->method('createAttachment');
		$this->l10n->expects(self::exactly(7))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::exactly(2))
			->method('get')
			->willReturn($this->l10n);
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn([]);
		$this->logger->expects(self::never())
			->method('warning');
		$this->logger->expects(self::never())
			->method('debug');

		$this->mailService->sendOrganizerBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendOrganizerBookingInformationEmailDifferentTZ(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('America/Toronto');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$config->setAvailabilityAsArray(
			[
				'timezoneId' => 'Europe/Berlin',
				'slots' => [
					'MO' => [['start' => 1713153660, 'end' => 1713239940]],
					'TU' => [['start' => 1713153660, 'end' => 1713239940]],
					'WE' => [['start' => 1713153660, 'end' => 1713239940]],
					'TH' => [['start' => 1713153660, 'end' => 1713239940]],
					'FR' => [['start' => 1713153660, 'end' => 1713239940]],
					'SA' => [['start' => 1713153660, 'end' => 1713239940]],
					'SU' => [['start' => 1713153660, 'end' => 1713239940]]
				]
			]
		);

		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$this->userConfig->expects(self::once())
			->method('getUserValue')
			->willReturn('en');
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->mailer->expects(self::once())
			->method('createAttachment');
		$this->l10n->expects(self::exactly(7))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::exactly(2))
			->method('get')
			->willReturn($this->l10n);
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->with(self::anything(), self::anything(), self::anything(), new \DateTimeZone('Europe/Berlin'))
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn([]);
		$this->logger->expects(self::never())
			->method('warning');
		$this->logger->expects(self::never())
			->method('debug');

		$this->mailService->sendOrganizerBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendOrganizerBookingInformationEmailFailed(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$config->setAvailabilityAsArray(
			[
				'timezoneId' => 'Europe/Berlin',
				'slots' => [
					'MO' => [['start' => 1713153660, 'end' => 1713239940]],
					'TU' => [['start' => 1713153660, 'end' => 1713239940]],
					'WE' => [['start' => 1713153660, 'end' => 1713239940]],
					'TH' => [['start' => 1713153660, 'end' => 1713239940]],
					'FR' => [['start' => 1713153660, 'end' => 1713239940]],
					'SA' => [['start' => 1713153660, 'end' => 1713239940]],
					'SU' => [['start' => 1713153660, 'end' => 1713239940]]
				]
			]
		);
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn($this->createConfiguredMock(IUser::class, [
				'getEmailAddress' => 'test@test.com',
				'getDisplayName' => 'Test Test'
			]));
		$mailMessage = $this->createMock(IMessage::class);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->willReturn($mailMessage);
		$this->userConfig->expects(self::once())
			->method('getUserValue')
			->willReturn('en');
		$mailMessage->expects(self::once())
			->method('setFrom')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('setTo')
			->willReturn($mailMessage);
		$mailMessage->expects(self::once())
			->method('useTemplate')
			->willReturn($mailMessage);
		$emailTemplate = $this->createMock(IEMailTemplate::class);
		$this->mailer->expects(self::once())
			->method('createEmailTemplate')
			->willReturn($emailTemplate);
		$emailTemplate->expects(self::once())
			->method('addHeader');
		$emailTemplate->expects(self::once())
			->method('setSubject');
		$emailTemplate->expects(self::once())
			->method('addHeading');
		$emailTemplate->expects(self::exactly(5))
			->method('addBodyListItem');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->mailer->expects(self::once())
			->method('createAttachment');
		$this->l10n->expects(self::exactly(7))
			->method('t');
		$this->lFactory->expects(self::once())
			->method('findGenericLanguage')
			->willReturn('en');
		$this->lFactory->expects(self::exactly(2))
			->method('get')
			->willReturn($this->l10n);
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay')
			->willReturn('Test');
		$this->mailer->expects(self::once())
			->method('send')
			->willReturn(['test@test.com']);
		$this->logger->expects(self::once())
			->method('warning');
		$this->logger->expects(self::once())
			->method('debug');
		$this->expectException(ServiceException::class);

		$this->mailService->sendOrganizerBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendOrganizerBookingInformationOrganizerNotFound(): void {
		$booking = new Booking();
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$this->userManager->expects(self::once())
			->method('get')
			->willReturn(null);
		$this->expectException(ServiceException::class);

		$this->mailService->sendOrganizerBookingInformationEmail($booking, $config, 'abc');
	}

	public function testSendOrganizerBookingNotification(): void {
		$booking = new Booking();
		$booking->setEmail('test@test.com');
		$booking->setDisplayName('Test');
		$booking->setStart(time());
		$booking->setTimezone('Europe/Berlin');
		$booking->setDescription('Test');
		$config = new AppointmentConfig();
		$config->setUserId('test');
		$config->setLocation('Test');
		$config->setAvailabilityAsArray(
			[
				'timezoneId' => 'Europe/Berlin',
				'slots' => [
					'MO' => [['start' => 1713153660, 'end' => 1713239940]],
					'TU' => [['start' => 1713153660, 'end' => 1713239940]],
					'WE' => [['start' => 1713153660, 'end' => 1713239940]],
					'TH' => [['start' => 1713153660, 'end' => 1713239940]],
					'FR' => [['start' => 1713153660, 'end' => 1713239940]],
					'SA' => [['start' => 1713153660, 'end' => 1713239940]],
					'SU' => [['start' => 1713153660, 'end' => 1713239940]]
				]
			]
		);
		$notification = $this->createMock(INotification::class);

		$this->lFactory->expects(self::once())
			->method('get')
			->willReturn($this->createMock(IL10N::class));
		$this->dateFormatter->expects(self::once())
			->method('formatDateTimeRelativeDay');
		$this->notificationManager->expects(self::once())
			->method('createNotification')
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setApp')
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setUser')
			->with($config->getUserId())
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setObject')
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setSubject')
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setDateTime')
			->willReturn($notification);
		$notification->expects(self::once())
			->method('setMessage')
			->willReturn($notification);
		$this->notificationManager->expects(self::once())
			->method('notify')
			->with($notification);

		$this->mailService->sendOrganizerBookingInformationNotification($booking, $config);
	}
}
