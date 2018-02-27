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

class ViewControllerTest extends \PHPUnit_Framework_TestCase {

	private $appName;
	private $request;
	private $config;
	private $userSession;
	private $urlGenerator;

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

		$this->urlGenerator = $this->getMockBuilder('OCP\IURLGenerator')
			->disableOriginalConstructor()
			->getMock();

		$this->controller = new ViewController($this->appName, $this->request,
			$this->userSession, $this->config, $this->urlGenerator);
	}

	/**
	 * @dataProvider indexDataProvider
	 */
	public function testIndex($serverVersion, $isIE, $shareeActions, $shareeCanEdit) {
		$this->request->expects($this->once())
			->method('isUserAgent')
			->with(['/(MSIE)|(Trident)/'])
			->will($this->returnValue($isIE));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue($serverVersion));

		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('theming', 'color', '#0082C9')
			->will($this->returnValue('#ff00ff'));

		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('core', 'shareapi_allow_links', 'yes')
			->will($this->returnValue('yes'));

		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->dummyUser->expects($this->once())
			->method('getEMailAddress')
			->will($this->returnValue('test@bla.com'));

		$this->config->expects($this->at(4))
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', null)
			->will($this->returnValue('someView'));

		$this->config->expects($this->at(5))
			->method('getUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->returnValue('someSkipPopoverValue'));

		$this->config->expects($this->at(6))
			->method('getUserValue')
			->with('user123', $this->appName, 'showWeekNr', 'no')
			->will($this->returnValue('someShowWeekNrValue'));

		$this->config->expects($this->at(7))
			->method('getUserValue')
			->with('user123', $this->appName, 'firstRun', null)
			->will($this->returnValue('someFirstRunValue'));

		$this->config->expects($this->at(8))
			->method('getUserValue')
			->with('user123', $this->appName, 'timezone', 'automatic')
			->will($this->returnValue('Australia/Adelaide'));

		$actual = $this->controller->index();

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'initialView' => 'someView',
			'emailAddress' => 'test@bla.com',
			'skipPopover' => 'someSkipPopoverValue',
			'weekNumbers' => 'someShowWeekNrValue',
			'firstRun' => 'someFirstRunValue',
			'canSharePublicLink' => 'yes',
			'defaultColor' => '#ff00ff',
			'isPublic' => false,
			'isEmbedded' => false,
			'isIE' => $isIE,
			'token' => '',
			'shareeCanEditShares' => $shareeActions,
			'shareeCanEditCalendarProperties' => $shareeCanEdit,
			'timezone' => 'Australia/Adelaide',
		], $actual->getParams());
		$this->assertEquals('main', $actual->getTemplateName());
	}

	public function indexDataProvider() {
		return [
			['11.0.1', false, 'yes', 'no'],
			['11.0.1', true, 'yes', 'no'],
			['12.0.0', false, 'no', 'yes'],
			['12.0.0', true, 'no', 'yes'],
		];
	}

	public function testIndexNoMonthFallback() {
		$this->request->expects($this->once())
			->method('isUserAgent')
			->with(['/(MSIE)|(Trident)/'])
			->will($this->returnValue(false));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue('12.0.0'));

		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->dummyUser->expects($this->once())
			->method('getEMailAddress')
			->will($this->returnValue('test@bla.com'));

		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('theming', 'color', '#0082C9')
			->will($this->returnValue('#ff00ff'));

		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('core', 'shareapi_allow_links', 'yes')
			->will($this->returnValue('no'));

		$this->config->expects($this->at(4))
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', null)
			->will($this->returnValue(null));

		$this->config->expects($this->at(5))
			->method('getUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->returnValue('someSkipPopoverValue'));

		$this->config->expects($this->at(6))
			->method('getUserValue')
			->with('user123', $this->appName, 'showWeekNr', 'no')
			->will($this->returnValue('someShowWeekNrValue'));

		$this->config->expects($this->at(7))
			->method('getUserValue')
			->with('user123', $this->appName, 'firstRun', null)
			->will($this->returnValue('someFirstRunValue'));

		$this->config->expects($this->at(8))
			->method('getUserValue')
			->with('user123', $this->appName, 'timezone', 'automatic')
			->will($this->returnValue('Australia/Adelaide'));

		$actual = $this->controller->index();

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'initialView' => 'month',
			'emailAddress' => 'test@bla.com',
			'skipPopover' => 'someSkipPopoverValue',
			'weekNumbers' => 'someShowWeekNrValue',
			'firstRun' => 'someFirstRunValue',
			'defaultColor' => '#ff00ff',
			'isPublic' => false,
			'isEmbedded' => false,
			'isIE' => false,
			'token' => '',
			'shareeCanEditShares' => 'no',
			'shareeCanEditCalendarProperties' => 'yes',
			'canSharePublicLink' => 'no',
			'timezone' => 'Australia/Adelaide',
		], $actual->getParams());
		$this->assertEquals('main', $actual->getTemplateName());
	}

	/**
	 * @dataProvider indexFirstRunDetectionProvider
	 */
	public function testIndexFirstRunDetection($initialView, $expectedFirstRun, $expectsSetRequest) {
		$this->request->expects($this->once())
			->method('isUserAgent')
			->with(['/(MSIE)|(Trident)/'])
			->will($this->returnValue(false));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue('9.1.0.0'));

		$this->userSession->expects($this->once())
			->method('getUser')
			->will($this->returnValue($this->dummyUser));

		$this->dummyUser->expects($this->once())
			->method('getUID')
			->will($this->returnValue('user123'));

		$this->dummyUser->expects($this->once())
			->method('getEMailAddress')
			->will($this->returnValue('test@bla.com'));

		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('theming', 'color', '#0082C9')
			->will($this->returnValue('#ff00ff'));

		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('core', 'shareapi_allow_links', 'yes')
			->will($this->returnValue('no'));

		$this->config->expects($this->at(4))
			->method('getUserValue')
			->with('user123', $this->appName, 'currentView', null)
			->will($this->returnValue($initialView));

		$this->config->expects($this->at(5))
			->method('getUserValue')
			->with('user123', $this->appName, 'skipPopover', 'no')
			->will($this->returnValue('someSkipPopoverValue'));

		$this->config->expects($this->at(6))
			->method('getUserValue')
			->with('user123', $this->appName, 'showWeekNr', 'no')
			->will($this->returnValue('someShowWeekNrValue'));

		$this->config->expects($this->at(7))
			->method('getUserValue')
			->with('user123', $this->appName, 'firstRun', null)
			->will($this->returnValue(null));

		$this->config->expects($this->at(8))
			->method('getUserValue')
			->with('user123', $this->appName, 'timezone', 'automatic')
			->will($this->returnValue('Australia/Adelaide'));


		if ($expectsSetRequest) {
			$this->config->expects($this->at(9))
				->method('setUserValue')
				->with('user123');
		}

		$actual = $this->controller->index();

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'initialView' => $initialView ? 'someRandominitialView' : 'month',
			'emailAddress' => 'test@bla.com',
			'skipPopover' => 'someSkipPopoverValue',
			'weekNumbers' => 'someShowWeekNrValue',
			'firstRun' => $expectedFirstRun,
			'defaultColor' => '#ff00ff',
			'isPublic' => false,
			'isEmbedded' => false,
			'isIE' => false,
			'token' => '',
			'shareeCanEditShares' => 'yes',
			'shareeCanEditCalendarProperties' => 'no',
			'canSharePublicLink' => 'no',
			'timezone' => 'Australia/Adelaide',
		], $actual->getParams());
		$this->assertEquals('main', $actual->getTemplateName());
	}

	public function indexFirstRunDetectionProvider() {
		return [
			[null, 'yes', false],
			['someRandominitialView', 'no', true],
		];
	}

	/**
	 * @dataProvider indexPublicDataProvider
	 */
	public function testPublicIndex($serverVersion, $isIE, $shareeActions, $shareeCanEdit) {
		$this->request->expects($this->once())
			->method('isUserAgent')
			->with(['/(MSIE)|(Trident)/'])
			->will($this->returnValue($isIE));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue($serverVersion));

		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('theming', 'color', '#0082C9')
			->will($this->returnValue('#ff00ff'));

		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('core', 'shareapi_allow_links', 'yes')
			->will($this->returnValue('no'));

		$this->request->expects($this->at(1))
			->method('getServerProtocol')
			->will($this->returnValue('fancy_protocol'));

		$this->request->expects($this->at(2))
			->method('getServerHost')
			->will($this->returnValue('nextcloud-host.tld'));

		$this->request->expects($this->at(3))
			->method('getRequestUri')
			->will($this->returnValue('/request/uri/123/42'));

		$this->urlGenerator->expects($this->at(0))
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->will($this->returnValue('/core/img/foo'));

		$this->urlGenerator->expects($this->at(1))
			->method('getAbsoluteURL')
			->with('/core/img/foo')
			->will($this->returnValue('fancy_protocol://foo.bar/core/img/foo'));

		$this->urlGenerator->expects($this->at(2))
			->method('linkTo')
			->with('', 'remote.php')
			->will($this->returnValue('remote.php'));

		$this->urlGenerator->expects($this->at(3))
			->method('getAbsoluteURL')
			->with('remote.php/dav/public-calendars/fancy_token_123?export')
			->will($this->returnValue('fancy_protocol://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export'));

		$this->request->expects($this->at(4))
			->method('getServerProtocol')
			->will($this->returnValue('fancy_protocol'));

		$actual = $this->controller->publicIndexForEmbedding('fancy_token_123');

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'initialView' => 'month',
			'emailAddress' => '',
			'skipPopover' => 'no',
			'weekNumbers' => 'no',
			'isPublic' => true,
			'isEmbedded' => true,
			'shareURL' => 'fancy_protocol://nextcloud-host.tld/request/uri/123/42',
			'previewImage' => 'fancy_protocol://foo.bar/core/img/foo',
			'firstRun' => 'no',
			'isIE' => $isIE,
			'defaultColor' => '#ff00ff',
			'webcalURL' => 'webcal://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export',
			'downloadURL' => 'fancy_protocol://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export',
			'token' => 'fancy_token_123',
			'shareeCanEditShares' => $shareeActions,
			'shareeCanEditCalendarProperties' => $shareeCanEdit,
			'canSharePublicLink' => 'no',
			'timezone' => 'automatic',
		], $actual->getParams());
		$this->assertEquals('main', $actual->getTemplateName());
	}

	/**
	 * @dataProvider indexPublicDataProvider
	 */
	public function testPublicIndexWithBranding($serverVersion, $isIE, $shareeActions, $shareeCanEdit) {
		$this->request->expects($this->once())
			->method('isUserAgent')
			->with(['/(MSIE)|(Trident)/'])
			->will($this->returnValue($isIE));

		$this->config->expects($this->at(0))
			->method('getSystemValue')
			->with('version')
			->will($this->returnValue($serverVersion));

		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with($this->appName, 'installed_version')
			->will($this->returnValue('42.13.37'));

		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('theming', 'color', '#0082C9')
			->will($this->returnValue('#ff00ff'));

		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('core', 'shareapi_allow_links', 'yes')
			->will($this->returnValue('no'));

		$this->request->expects($this->at(1))
			->method('getServerProtocol')
			->will($this->returnValue('fancy_protocol'));

		$this->request->expects($this->at(2))
			->method('getServerHost')
			->will($this->returnValue('nextcloud-host.tld'));

		$this->request->expects($this->at(3))
			->method('getRequestUri')
			->will($this->returnValue('/request/uri/123/42'));

		$this->urlGenerator->expects($this->at(0))
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->will($this->returnValue('/core/img/foo'));

		$this->urlGenerator->expects($this->at(1))
			->method('getAbsoluteURL')
			->with('/core/img/foo')
			->will($this->returnValue('fancy_protocol://foo.bar/core/img/foo'));

		$this->urlGenerator->expects($this->at(2))
			->method('linkTo')
			->with('', 'remote.php')
			->will($this->returnValue('remote.php'));

		$this->urlGenerator->expects($this->at(3))
			->method('getAbsoluteURL')
			->with('remote.php/dav/public-calendars/fancy_token_123?export')
			->will($this->returnValue('fancy_protocol://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export'));

		$this->request->expects($this->at(4))
			->method('getServerProtocol')
			->will($this->returnValue('fancy_protocol'));

		$actual = $this->controller->publicIndexWithBranding('fancy_token_123');

		$this->assertInstanceOf('OCP\AppFramework\Http\TemplateResponse', $actual);
		$this->assertEquals([
			'appVersion' => '42.13.37',
			'initialView' => 'month',
			'emailAddress' => '',
			'skipPopover' => 'no',
			'weekNumbers' => 'no',
			'isPublic' => true,
			'isEmbedded' => false,
			'shareURL' => 'fancy_protocol://nextcloud-host.tld/request/uri/123/42',
			'previewImage' => 'fancy_protocol://foo.bar/core/img/foo',
			'firstRun' => 'no',
			'isIE' => $isIE,
			'defaultColor' => '#ff00ff',
			'webcalURL' => 'webcal://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export',
			'downloadURL' => 'fancy_protocol://foo.bar/remote.php/dav/public-calendars/fancy_token_123?export',
			'token' => 'fancy_token_123',
			'shareeCanEditShares' => $shareeActions,
			'shareeCanEditCalendarProperties' => $shareeCanEdit,
			'canSharePublicLink' => 'no',
			'timezone' => 'automatic',
		], $actual->getParams());
		$this->assertEquals('public', $actual->getTemplateName());
	}

	public function indexPublicDataProvider() {
		return [
			['11.0.0', false, 'yes', 'no'],
			['11.0.0', true, 'yes', 'no'],
			['12.0.0', false, 'no', 'yes'],
			['12.0.0', true, 'no', 'yes'],
		];
	}
}
