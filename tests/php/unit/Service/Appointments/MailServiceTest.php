<?php

declare(strict_types=1);

/**
 * Calendar App
 *
 * @copyright 2021 anna.larch@gmx.net <Anna Larch>
 *
 * @author anna.larch@gmx.net <Anna Larch>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
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
use OCP\IDateTimeFormatter;
use OCP\IL10N;
use OCP\IUser;
use OCP\IUserManager;
use OCP\L10N\IFactory;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Mail\IMessage;
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

	/** @var MailService */
	private $mailService;

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
		$this->mailService = new MailService(
			$this->mailer,
			$this->userManager,
			$this->l10n,
			$this->defaults,
			$this->logger,
			$this->urlGenerator,
			$this->dateFormatter,
			$this->lFactory,
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
		$emailTemplate->expects(self::exactly(4))
			->method('addBodyListItem')
			->with($booking->getDisplayName(), '');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(9))
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
		$emailTemplate->expects(self::exactly(4))
			->method('addBodyListItem')
			->with($booking->getDisplayName(), '');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(9))
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
		$emailTemplate->expects(self::exactly(4))
			->method('addBodyListItem')
			->with($booking->getDisplayName(), '');
		$emailTemplate->expects(self::once())
			->method('addBodyButton');
		$emailTemplate->expects(self::exactly(2))
			->method('addBodyText');
		$emailTemplate->expects(self::once())
			->method('addFooter');
		$this->mailer->expects(self::once())
			->method('createEmailTemplate');
		$this->l10n->expects(self::exactly(9))
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
}
