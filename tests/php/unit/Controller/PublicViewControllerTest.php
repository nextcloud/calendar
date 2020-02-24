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

use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use OCP\IURLGenerator;
use ChristophWurst\Nextcloud\Testing\TestCase;

class PublicViewControllerTest extends TestCase {

	/** @var string */
	private $appName;

	/** @var IRequest|\PHPUnit_Framework_MockObject_MockObject */
	private $request;

	/** @var IConfig|\PHPUnit_Framework_MockObject_MockObject */
	private $config;

	/** @var IInitialStateService|\PHPUnit_Framework_MockObject_MockObject */
	private $initialStateService;

	/** @var IURLGenerator|\PHPUnit_Framework_MockObject_MockObject */
	private $urlGenerator;

	/** @var ViewController */
	private $controller;

	protected function setUp():void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->initialStateService = $this->createMock(IInitialStateService::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);

		$this->controller = new PublicViewController($this->appName, $this->request,
			$this->config, $this->initialStateService, $this->urlGenerator);
	}

	public function testPublicIndexWithBranding():void {
		$this->config->expects($this->at(0))
			->method('getAppValue')
			->with('calendar', 'currentView', 'dayGridMonth')
			->willReturn('defaultCurrentView');
		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with('calendar', 'showWeekends', 'yes')
			->willReturn('no');
		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('calendar', 'showWeekNr', 'no')
			->willReturn('yes');
		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('calendar', 'skipPopover', 'yes')
			->willReturn('yes');
		$this->config->expects($this->at(4))
			->method('getAppValue')
			->with('calendar', 'timezone', 'automatic')
			->willReturn('defaultTimezone');

		$this->config->expects($this->at(5))
			->method('getAppValue')
			->with('calendar', 'installed_version')
			->willReturn('1.0.0');

		$this->request->expects($this->at(0))
			->method('getServerProtocol')
			->with()
			->willReturn('protocol');
		$this->request->expects($this->at(1))
			->method('getServerHost')
			->with()
			->willReturn('host123');
		$this->request->expects($this->at(2))
			->method('getRequestUri')
			->with()
			->willReturn('/456');

		$this->urlGenerator->expects($this->at(0))
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->willReturn('imagePath456');
		$this->urlGenerator->expects($this->at(1))
			->method('getAbsoluteURL')
			->with('imagePath456')
			->willReturn('absoluteImagePath456');

		$this->initialStateService->expects($this->at(0))
			->method('provideInitialState')
			->with('calendar', 'app_version', '1.0.0');
		$this->initialStateService->expects($this->at(1))
			->method('provideInitialState')
			->with('calendar', 'first_run', false);
		$this->initialStateService->expects($this->at(2))
			->method('provideInitialState')
			->with('calendar', 'initial_view', 'defaultCurrentView');
		$this->initialStateService->expects($this->at(3))
			->method('provideInitialState')
			->with('calendar', 'show_weekends', false);
		$this->initialStateService->expects($this->at(4))
			->method('provideInitialState')
			->with('calendar', 'show_week_numbers', true);
		$this->initialStateService->expects($this->at(5))
			->method('provideInitialState')
			->with('calendar', 'skip_popover', true);
		$this->initialStateService->expects($this->at(6))
			->method('provideInitialState')
			->with('calendar', 'talk_enabled', false);
		$this->initialStateService->expects($this->at(7))
			->method('provideInitialState')
			->with('calendar', 'timezone', 'defaultTimezone');

		$response = $this->controller->publicIndexWithBranding('');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('public', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}

	public function testPublicIndexForEmbedding():void {
		$this->config->expects($this->at(0))
			->method('getAppValue')
			->with('calendar', 'currentView', 'dayGridMonth')
			->willReturn('defaultCurrentView');
		$this->config->expects($this->at(1))
			->method('getAppValue')
			->with('calendar', 'showWeekends', 'yes')
			->willReturn('no');
		$this->config->expects($this->at(2))
			->method('getAppValue')
			->with('calendar', 'showWeekNr', 'no')
			->willReturn('yes');
		$this->config->expects($this->at(3))
			->method('getAppValue')
			->with('calendar', 'skipPopover', 'yes')
			->willReturn('yes');
		$this->config->expects($this->at(4))
			->method('getAppValue')
			->with('calendar', 'timezone', 'automatic')
			->willReturn('defaultTimezone');

		$this->config->expects($this->at(5))
			->method('getAppValue')
			->with('calendar', 'installed_version')
			->willReturn('1.0.0');

		$this->request->expects($this->at(0))
			->method('getServerProtocol')
			->with()
			->willReturn('protocol');
		$this->request->expects($this->at(1))
			->method('getServerHost')
			->with()
			->willReturn('host123');
		$this->request->expects($this->at(2))
			->method('getRequestUri')
			->with()
			->willReturn('/456');

		$this->urlGenerator->expects($this->at(0))
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->willReturn('imagePath456');
		$this->urlGenerator->expects($this->at(1))
			->method('getAbsoluteURL')
			->with('imagePath456')
			->willReturn('absoluteImagePath456');

		$this->initialStateService->expects($this->at(0))
			->method('provideInitialState')
			->with('calendar', 'app_version', '1.0.0');
		$this->initialStateService->expects($this->at(1))
			->method('provideInitialState')
			->with('calendar', 'first_run', false);
		$this->initialStateService->expects($this->at(2))
			->method('provideInitialState')
			->with('calendar', 'initial_view', 'defaultCurrentView');
		$this->initialStateService->expects($this->at(3))
			->method('provideInitialState')
			->with('calendar', 'show_weekends', false);
		$this->initialStateService->expects($this->at(4))
			->method('provideInitialState')
			->with('calendar', 'show_week_numbers', true);
		$this->initialStateService->expects($this->at(5))
			->method('provideInitialState')
			->with('calendar', 'skip_popover', true);
		$this->initialStateService->expects($this->at(6))
			->method('provideInitialState')
			->with('calendar', 'talk_enabled', false);
		$this->initialStateService->expects($this->at(7))
			->method('provideInitialState')
			->with('calendar', 'timezone', 'defaultTimezone');

		$response = $this->controller->publicIndexForEmbedding('');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('base', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}
}
