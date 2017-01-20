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
	private $config;
	private $userSession;
	private $mailer;
	private $l10n;
	private $defaults;

	private $dummyUser;

	private $controller;

	public function setUp() {
		$this->appName = 'calendar';
		$this->request = $this->getMockBuilder('\OCP\IRequest')
			->disableOriginalConstructor()
			->getMock();
		$this->config = $this->getMockBuilder('\OCP\IConfig')
			->disableOriginalConstructor()
			->getMock();
		$this->userSession = $this->getMockBuilder('\OCP\IUserSession')
			->disableOriginalConstructor()
			->getMock();

		$this->dummyUser = $this->getMockBuilder('OCP\IUser')
			->disableOriginalConstructor()
			->getMock();

		$this->mailer = $this->getMockBuilder('\OCP\Mail\IMailer')
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
	 * @dataProvider indexEmailPublicLink
	 */
	public function testEmailPublicLink($to, $url, $name) {

		$this->userSession->expects($this->exactly(1))
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$actual = $this->controller->sendEmailPublicLink($to, $url, $name);

		$this->assertInstanceOf('OCP\AppFramework\Http\JSONResponse', $actual);

	}

	public function indexEmailPublicLink() {
		return [
			['test@test.tld', 'myurl.tld', 'user123'],
			['testtesttld', 'myurl.tld', 'user123'],
		];
	}
}
