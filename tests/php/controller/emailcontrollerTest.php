<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

class EmailControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $userSession;
	private $dummyUser;
	private $config;
	private $mailer;
	private $emailTemplate;
	private $message;
	private $l10n;
	private $defaults;
	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();

		$this->userSession = $this->getMockBuilder('\OCP\IUserSession')
			->disableOriginalConstructor()
			->getMock();
		$this->dummyUser = $this->getMockBuilder('\OCP\IUser')
			->disableOriginalConstructor()
			->getMock();

		$this->config = $this->getMockBuilder('\OCP\IConfig')
			->disableOriginalConstructor()
			->getMock();

		$this->mailer = $this->getMockBuilder('\OCP\Mail\IMailer')
			->disableOriginalConstructor()
			->getMock();
		$this->emailTemplate = $this->getMockBuilder('\OCP\Mail\IEMailTemplate')
			->disableOriginalConstructor()
			->getMock();
		$this->message = $this->getMockBuilder('\OC\Mail\Message')
			->disableOriginalConstructor()
			->getMock();

		$this->l10n = $this->getMockBuilder('OC\L10N\L10N')
			->disableOriginalConstructor()
			->getMock();

		$this->defaults = $this->getMockBuilder('OCP\Defaults')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new EmailController($this->appName, $this->request,
			$this->userSession, $this->config, $this->mailer, $this->l10n, $this->defaults);
	}

	/**
	 * @dataProvider emailPublicLinkProvider
	 */
	public function testEmailPublicLink($validEmailAddress) {
		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));
		$this->dummyUser->expects($this->once())
			->method('getDisplayName')
			->will($this->returnValue('Fancy displayname 42'));

		$this->l10n->expects($this->at(0))
			->method('t')
			->with('%s has published the calendar »%s«', ['Fancy displayname 42', 'Calendarname 1337'])
			->will($this->returnValue('localized_1'));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue('12.0.0'));

		$this->mailer->expects($this->at(0))
			->method('createEMailTemplate')
			->will($this->returnValue($this->emailTemplate));

		$this->emailTemplate->expects($this->at(1))
			->method('addHeader');

		$this->l10n->expects($this->at(1))
			->method('t')
			->with('%s has published the calendar »%s«', ['Fancy displayname 42', 'Calendarname 1337'])
			->will($this->returnValue('localized_2'));
		$this->emailTemplate->expects($this->at(1))
			->method('addHeading')
			->with('localized_2');

		$this->l10n->expects($this->at(2))
			->method('t')
			->with('Hello,')
			->will($this->returnValue('localized_3'));
		$this->emailTemplate->expects($this->at(2))
			->method('addBodyText')
			->with('localized_3');

		$this->l10n->expects($this->at(3))
			->method('t')
			->with('We wanted to inform you that %s has published the calendar »%s«.', ['Fancy displayname 42', 'Calendarname 1337'])
			->will($this->returnValue('localized_4'));
		$this->emailTemplate->expects($this->at(3))
			->method('addBodyText')
			->with('localized_4');

		$this->l10n->expects($this->at(4))
			->method('t')
			->with('Open »%s«', ['Calendarname 1337'])
			->will($this->returnValue('localized_5'));
		$this->emailTemplate->expects($this->at(4))
			->method('addBodyButton')
			->with('localized_5', 'https://url-to-public-calendar');

		$this->l10n->expects($this->at(5))
			->method('t')
			->with('Cheers!')
			->will($this->returnValue('localized_6'));
		$this->emailTemplate->expects($this->at(5))
			->method('addBodyText')
			->with('localized_6');

		$this->emailTemplate->expects($this->at(6))
			->method('addFooter');
		$this->emailTemplate->expects($this->at(7))
			->method('renderHtml')
			->will($this->returnValue('html_body'));
		$this->emailTemplate->expects($this->at(8))
			->method('renderText')
			->will($this->returnValue('text_body'));

		$this->mailer->expects($this->at(1))
			->method('validateMailAddress')
			->with('test@test.tld')
			->will($this->returnValue($validEmailAddress));

		if ($validEmailAddress) {
			$this->config->expects($this->at(1))
				->method('getSystemValue')
				->with('mail_domain', 'domain.org')
				->will($this->returnValue('domain_123'));
			$this->config->expects($this->at(2))
				->method('getSystemValue')
				->with('mail_from_address', 'nextcloud')
				->will($this->returnValue('from_456'));

			$this->mailer->expects($this->at(2))
				->method('createMessage')
				->will($this->returnValue($this->message));

			$this->message->expects($this->at(0))
				->method('setSubject')
				->with('localized_1');
			$this->defaults->expects($this->at(0))
				->method('getName')
				->will($this->returnValue('default_instance_name'));
			$this->message->expects($this->at(1))
				->method('setFrom')
				->with(['from_456@domain_123' => 'default_instance_name']);
			$this->l10n->expects($this->at(6))
				->method('t')
				->with('Recipient')
				->will($this->returnValue('localized_7'));
			$this->message->expects($this->at(2))
				->method('setTo')
				->with(['test@test.tld' => 'localized_7']);
			$this->message->expects($this->at(3))
				->method('setPlainBody')
				->with('text_body');
			$this->message->expects($this->at(4))
				->method('setHtmlBody')
				->with('html_body');

			$this->mailer->expects($this->at(3))
				->method('send')
				->with($this->message);
		}

		$response = $this->controller->sendEmailPublicLink('test@test.tld', 'https://url-to-public-calendar', 'Calendarname 1337');
		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $response);
		$this->assertEquals([], $response->getData());

		if ($validEmailAddress) {
			$this->assertEquals(200, $response->getStatus());
		} else {
			$this->assertEquals(400, $response->getStatus());
		}
	}

	public function emailPublicLinkProvider() {
		return [
			[true],
			[false],
		];
	}
}
