<?php
declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2019 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\Controller;

use OCP\AppFramework\Http\JSONResponse;
use OCP\Defaults;
use OCP\IConfig;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IUserSession;
use OCP\Mail\IEMailTemplate;
use OCP\Mail\IMailer;
use OCP\Mail\IMessage;
use ChristophWurst\Nextcloud\Testing\TestCase;

class EmailControllerTest extends TestCase {

	/** @var string */
	private $appName;

	/** @var IRequest|\PHPUnit_Framework_MockObject_MockObject */
	private $request;

	/** @var IConfig|\PHPUnit_Framework_MockObject_MockObject */
	private $config;

	/** @var Defaults|\PHPUnit_Framework_MockObject_MockObject */
	private $defaults;

	/** @var IL10N|\PHPUnit_Framework_MockObject_MockObject */
	private $l10n;

	/** @var IMailer|\PHPUnit_Framework_MockObject_MockObject */
	private $mailer;

	/** @var IUserSession|\PHPUnit_Framework_MockObject_MockObject */
	private $userSession;

	/** @var IURLGenerator|\PHPUnit_Framework_MockObject_MockObject */
	private $urlGenerator;

	/** @var IUser|\PHPUnit_Framework_MockObject_MockObject */
	private $user;

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

		$this->user = $this->createMock(IUser::class);
		$this->user->method('getDisplayName')->willReturn('User Displayname 123');

		$this->l10n->expects($this->any())
			->method('t')
			->willReturnCallback(function($string, $args) {
				return 'TRANSLATED: ' . vsprintf($string, $args);
			});

		$this->controller = new EmailController($this->appName,
			$this->request, $this->userSession, $this->config,
			$this->mailer, $this->l10n, $this->defaults,
			$this->urlGenerator);
	}

	public function testSendUserSessionExpired():void {
		$this->userSession->expects($this->at(0))
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
		$this->userSession->expects($this->at(0))
			->method('getUser')
			->with()
			->willReturn($this->user);

		$this->mailer->expects($this->at(0))
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
		$this->userSession->expects($this->at(0))
			->method('getUser')
			->with()
			->willReturn($this->user);

		$this->mailer->expects($this->at(0))
			->method('validateMailAddress')
			->with('foo@bar.com')
			->willReturn(true);

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('mail_domain', 'domain.org')
			->willReturn('testdomain.org');
		$this->config->expects($this->at(1))
			->method('getSystemValue')
			->with('mail_from_address', 'nextcloud')
			->willReturn('nextcloud123');

		$this->defaults->expects($this->at(0))
			->method('getName')
			->with()
			->willReturn('Example Cloud Inc.');

		$this->urlGenerator->expects($this->at(0))
			->method('linkToRouteAbsolute')
			->with('calendar.view.public_index_with_branding', [
				'token' => 'token123'
			])
			->willReturn('http://publicURL123');

		$template = $this->createMock(IEMailTemplate::class);
		$template->expects($this->at(0))
			->method('setSubject')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects($this->at(1))
			->method('addHeader')
			->with()
			->willReturn($template);
		$template->expects($this->at(2))
			->method('addHeading')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects($this->at(3))
			->method('addBodyText')
			->with('TRANSLATED: Hello,')
			->willReturn($template);
		$template->expects($this->at(4))
			->method('addBodyText')
			->with('TRANSLATED: We wanted to inform you that User Displayname 123 has published the calendar »calendar name 456«.')
			->willReturn($template);
		$template->expects($this->at(5))
			->method('addBodyButton')
			->with('TRANSLATED: Open »calendar name 456«', 'http://publicURL123')
			->willReturn($template);
		$template->expects($this->at(6))
			->method('addBodyText')
			->with('TRANSLATED: Cheers!')
			->willReturn($template);
		$template->expects($this->at(7))
			->method('addFooter')
			->with()
			->willReturn($template);

		$message = $this->createMock(IMessage::class);
		$message->expects($this->at(0))
			->method('setFrom')
			->with(['nextcloud123@testdomain.org' => 'Example Cloud Inc.'])
			->willReturn($message);
		$message->expects($this->at(1))
			->method('setTo')
			->with(['foo@bar.com' => 'foo@bar.com'])
			->willReturn($message);
		$message->expects($this->at(2))
			->method('useTemplate')
			->with($template)
			->willReturn($message);

		$this->mailer->expects($this->at(1))
			->method('createEMailTemplate')
			->with('calendar.PublicShareNotification', [
				'displayname' => 'User Displayname 123',
				'calendar_name' => 'calendar name 456',
				'calendar_url' => 'http://publicURL123',
			])
			->willReturn($template);
		$this->mailer->expects($this->at(2))
			->method('createMessage')
			->with()
			->willReturn($message);
		$this->mailer->expects($this->at(3))
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
		$this->userSession->expects($this->at(0))
			->method('getUser')
			->with()
			->willReturn($this->user);

		$this->mailer->expects($this->at(0))
			->method('validateMailAddress')
			->with('foo@bar.com')
			->willReturn(true);

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('mail_domain', 'domain.org')
			->willReturn('testdomain.org');
		$this->config->expects($this->at(1))
			->method('getSystemValue')
			->with('mail_from_address', 'nextcloud')
			->willReturn('nextcloud123');

		$this->defaults->expects($this->at(0))
			->method('getName')
			->with()
			->willReturn('Example Cloud Inc.');

		$this->urlGenerator->expects($this->at(0))
			->method('linkToRouteAbsolute')
			->with('calendar.view.public_index_with_branding', [
				'token' => 'token123'
			])
			->willReturn('http://publicURL123');

		$template = $this->createMock(IEMailTemplate::class);
		$template->expects($this->at(0))
			->method('setSubject')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects($this->at(1))
			->method('addHeader')
			->with()
			->willReturn($template);
		$template->expects($this->at(2))
			->method('addHeading')
			->with('TRANSLATED: User Displayname 123 has published the calendar »calendar name 456«')
			->willReturn($template);
		$template->expects($this->at(3))
			->method('addBodyText')
			->with('TRANSLATED: Hello,')
			->willReturn($template);
		$template->expects($this->at(4))
			->method('addBodyText')
			->with('TRANSLATED: We wanted to inform you that User Displayname 123 has published the calendar »calendar name 456«.')
			->willReturn($template);
		$template->expects($this->at(5))
			->method('addBodyButton')
			->with('TRANSLATED: Open »calendar name 456«', 'http://publicURL123')
			->willReturn($template);
		$template->expects($this->at(6))
			->method('addBodyText')
			->with('TRANSLATED: Cheers!')
			->willReturn($template);
		$template->expects($this->at(7))
			->method('addFooter')
			->with()
			->willReturn($template);

		$message = $this->createMock(IMessage::class);
		$message->expects($this->at(0))
			->method('setFrom')
			->with(['nextcloud123@testdomain.org' => 'Example Cloud Inc.'])
			->willReturn($message);
		$message->expects($this->at(1))
			->method('setTo')
			->with(['foo@bar.com' => 'foo@bar.com'])
			->willReturn($message);
		$message->expects($this->at(2))
			->method('useTemplate')
			->with($template)
			->willReturn($message);

		$this->mailer->expects($this->at(1))
			->method('createEMailTemplate')
			->with('calendar.PublicShareNotification', [
				'displayname' => 'User Displayname 123',
				'calendar_name' => 'calendar name 456',
				'calendar_url' => 'http://publicURL123',
			])
			->willReturn($template);
		$this->mailer->expects($this->at(2))
			->method('createMessage')
			->with()
			->willReturn($message);
		$this->mailer->expects($this->at(3))
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
