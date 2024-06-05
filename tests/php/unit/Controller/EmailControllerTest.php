<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserManager;
use OCP\IUserSession;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Mail\IMessage;
use PHPUnit\Framework\MockObject\MockObject;

class EmailControllerTest extends TestCase {
	/** @var string */
	private $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IConfig|MockObject */
	private $config;

	/** @var Defaults|MockObject */
	private $defaults;

	/** @var IL10N|MockObject */
	private $l10n;

	/** @var IMailer|MockObject */
	private $mailer;

	/** @var IUserSession|MockObject */
	private $userSession;

	/** @var IURLGenerator|MockObject */
	private $urlGenerator;

	/** @var IUser|MockObject */
	private $user;

	/** @var IUserManager|MockObject */
	private $userManager;

	/** @var EmailController */
	private $controller;

	protected function setUp():void {
		parent::setUp();

		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->defaults = $this->createMock(Defaults::class);
		$this->l10n = $this->createMock(IL10N::class);
		$this->mailer = $this->createMock(IMailer::class);
		$this->userSession = $this->createMock(IUserSession::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);
		$this->userManager = $this->createMock(IUserManager::class);

		$this->user = $this->createMock(IUser::class);
		$this->user->method('getUID')->willReturn('123');
		$this->userManager->method('getDisplayName')->willReturn('User Displayname 123');

		$this->l10n->expects($this->any())
			->method('t')
			->willReturnCallback(function ($string, $args) {
				return 'TRANSLATED: ' . vsprintf($string, $args);
			});

		$this->controller = new EmailController($this->appName,
			$this->request, $this->userSession, $this->config,
			$this->mailer, $this->l10n, $this->defaults,
			$this->urlGenerator,
			$this->userManager);
	}

	public function testSendUserSessionExpired():void {
		$this->userSession->expects(self::once(0))
			->method('getUser')
			->with()
			->willReturn(null);

		$this->mailer->expects($this->never())
			->method($this->anything());
		$this->urlGenerator->expects($this->never())
			->method($this->anything());

		$response = $this->controller->sendEmailPublicLink('foo@bar.com', 'token123', 'calendarHome');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			'message' => 'TRANSLATED: User-Session unexpectedly expired'
		], $response->getData());
		$this->assertEquals(401, $response->getStatus());
	}

	public function testSendInvalidEmailAddress():void {
		$this->userSession->expects(self::once())
			->method('getUser')
			->with()
			->willReturn($this->user);

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with('foo@bar.com')
			->willReturn(false);

		$this->urlGenerator->expects($this->never())
			->method($this->anything());

		$response = $this->controller->sendEmailPublicLink('foo@bar.com', 'token123', 'calendarHome');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			'message' => 'TRANSLATED: Provided email-address is not valid'
		], $response->getData());
		$this->assertEquals(400, $response->getStatus());
	}

	public function testSendWithMailerError() {
		$this->userSession->expects(self::once())
			->method('getUser')
			->willReturn($this->user);

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with('foo@bar.com')
			->willReturn(true);

		$this->config->expects(self::exactly(2))
			->method('getSystemValue')
			->willReturnMap([
				['mail_domain', 'domain.org', 'testdomain.org'],
				['mail_from_address', 'nextcloud', 'nextcloud123'],
			]);

		$this->defaults->expects(self::once())
			->method('getName')
			->with()
			->willReturn('Example Cloud Inc.');

		$this->urlGenerator->expects(self::once())
			->method('linkToRouteAbsolute')
			->with('calendar.publicView.public_index_with_branding', [
				'token' => 'token123'
			])
			->willReturn('http://publicURL123');

		$template = $this->createMock(IEMailTemplate::class);
		$template->expects(self::once())
			->method('setSubject')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects(self::once())
			->method('addHeader')
			->with()
			->willReturn($template);
		$template->expects(self::once())
			->method('addHeading')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects(self::exactly(3))
			->method('addBodyText')
			->withConsecutive(
				['TRANSLATED: Hello,'],
				['TRANSLATED: We wanted to inform you that User Displayname 123 has published the calendar »calendar name 456«.'],
				['TRANSLATED: Cheers!']
			)
			->willReturnSelf();
		$template->expects(self::once())
			->method('addBodyButton')
			->with('TRANSLATED: Open »calendar name 456«', 'http://publicURL123')
			->willReturnSelf();
		$template->expects(self::once())
			->method('addFooter')
			->with()
			->willReturnSelf();

		$message = $this->createMock(IMessage::class);
		$message->expects(self::once())
			->method('setFrom')
			->with(['nextcloud123@testdomain.org' => 'Example Cloud Inc.'])
			->willReturn($message);
		$message->expects(self::once())
			->method('setTo')
			->with(['foo@bar.com' => 'foo@bar.com'])
			->willReturn($message);
		$message->expects(self::once())
			->method('useTemplate')
			->with($template)
			->willReturn($message);

		$this->mailer->expects(self::once())
			->method('createEMailTemplate')
			->with('calendar.PublicShareNotification', [
				'displayname' => 'User Displayname 123',
				'calendar_name' => 'calendar name 456',
				'calendar_url' => 'http://publicURL123',
			])
			->willReturn($template);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->with()
			->willReturn($message);
		$this->mailer->expects(self::once())
			->method('send')
			->with($message)
			->willThrowException(new \Exception('123'));

		$response = $this->controller->sendEmailPublicLink('foo@bar.com', 'token123', 'calendar name 456');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			'message' => 'TRANSLATED: Unexpected error sending email. Please contact your administrator.'
		], $response->getData());
		$this->assertEquals(500, $response->getStatus());
	}

	public function testSendMailerSuccess() {
		$this->userSession->expects(self::once())
			->method('getUser')
			->with()
			->willReturn($this->user);

		$this->mailer->expects(self::once())
			->method('validateMailAddress')
			->with('foo@bar.com')
			->willReturn(true);

		$this->config->expects(self::exactly(2))
			->method('getSystemValue')
			->willReturnMap([
				['mail_domain', 'domain.org', 'testdomain.org'],
				['mail_from_address', 'nextcloud', 'nextcloud123'],
			]);

		$this->defaults->expects(self::once())
			->method('getName')
			->with()
			->willReturn('Example Cloud Inc.');

		$this->urlGenerator->expects(self::once())
			->method('linkToRouteAbsolute')
			->with('calendar.publicView.public_index_with_branding', [
				'token' => 'token123'
			])
			->willReturn('http://publicURL123');

		$template = $this->createMock(IEMailTemplate::class);
		$template->expects(self::once())
			->method('setSubject')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects(self::once())
			->method('addHeader')
			->with()
			->willReturn($template);
		$template->expects(self::once())
			->method('addHeading')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects(self::exactly(3))
			->method('addBodyText')
			->withConsecutive(
				['TRANSLATED: Hello,'],
				['TRANSLATED: We wanted to inform you that User Displayname 123 has published the calendar »calendar name 456«.'],
				['TRANSLATED: Cheers!']
			)
			->willReturnSelf();
		$template->expects(self::once())
			->method('addBodyButton')
			->with('TRANSLATED: Open »calendar name 456«', 'http://publicURL123')
			->willReturn($template);
		$template->expects(self::once())
			->method('addFooter')
			->with()
			->willReturn($template);

		$message = $this->createMock(IMessage::class);
		$message->expects(self::once())
			->method('setFrom')
			->with(['nextcloud123@testdomain.org' => 'Example Cloud Inc.'])
			->willReturn($message);
		$message->expects(self::once())
			->method('setTo')
			->with(['foo@bar.com' => 'foo@bar.com'])
			->willReturn($message);
		$message->expects(self::once())
			->method('useTemplate')
			->with($template)
			->willReturn($message);

		$this->mailer->expects(self::once())
			->method('createEMailTemplate')
			->with('calendar.PublicShareNotification', [
				'displayname' => 'User Displayname 123',
				'calendar_name' => 'calendar name 456',
				'calendar_url' => 'http://publicURL123',
			])
			->willReturn($template);
		$this->mailer->expects(self::once())
			->method('createMessage')
			->with()
			->willReturn($message);
		$this->mailer->expects(self::once())
			->method('send')
			->with($message);

		$response = $this->controller->sendEmailPublicLink('foo@bar.com', 'token123', 'calendar name 456');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$this->assertEquals([
			'message' => 'TRANSLATED: Successfully sent email to foo@bar.com'
		], $response->getData());
		$this->assertEquals(200, $response->getStatus());
	}
}
