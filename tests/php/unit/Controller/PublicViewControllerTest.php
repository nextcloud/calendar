<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Thomas Citharel <nextcloud@tcit.fr>
 *
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

use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Services\IInitialState;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IURLGenerator;
use ChristophWurst\Nextcloud\Testing\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

class PublicViewControllerTest extends TestCase {
	private string $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IConfig|MockObject */
	private $config;

	/** @var IInitialState|MockObject */
	private $initialState;

	/** @var IURLGenerator|MockObject */
	private $urlGenerator;

	/** @var ViewController */
	private $controller;

	protected function setUp():void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->initialState = $this->createMock(IInitialState::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);

		$this->controller = new PublicViewController($this->appName, $this->request,
			$this->config, $this->initialState, $this->urlGenerator);
	}

	public function testPublicIndexWithBranding():void {
		$this->config->expects(self::exactly(10))
			->method('getAppValue')
			->willReturnMap([
				['calendar', 'eventLimit', 'yes', 'no'],
				['calendar', 'currentView', 'dayGridMonth', 'defaultCurrentView'],
				['calendar', 'showWeekends', 'yes', 'no'],
				['calendar', 'showWeekNr', 'no', 'yes'],
				['calendar', 'skipPopover', 'yes', 'yes'],
				['calendar', 'timezone', 'automatic', 'defaultTimezone'],
				['calendar', 'slotDuration', '00:30:00', 'defaultSlotDuration'],
				['calendar', 'defaultReminder', 'none', 'defaultDefaultReminder'],
				['calendar', 'showTasks', 'yes', 'yes'],
				['calendar', 'installed_version', null, '1.0.0']
			]);

		$this->request->expects(self::once())
			->method('getServerProtocol')
			->with()
			->willReturn('protocol');
		$this->request->expects(self::once())
			->method('getServerHost')
			->with()
			->willReturn('host123');
		$this->request->expects(self::once())
			->method('getRequestUri')
			->with()
			->willReturn('/456');

		$this->urlGenerator->expects(self::once())
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->willReturn('imagePath456');
		$this->urlGenerator->expects(self::once())
			->method('getAbsoluteURL')
			->with('imagePath456')
			->willReturn('absoluteImagePath456');

		$this->initialState
			->method('provideInitialState')
			->withConsecutive(
				['app_version', '1.0.0'],
				['event_limit', false],
				['first_run', false],
				['initial_view', 'defaultCurrentView'],
				['show_weekends', false],
				['show_week_numbers', true],
				['skip_popover', true],
				['talk_enabled', false],
				['talk_api_version', 'v1'],
				['timezone', 'defaultTimezone'],
				['slot_duration', 'defaultSlotDuration'],
				['default_reminder', 'defaultDefaultReminder'],
				['show_tasks', true],
				['tasks_enabled', false]
			);

		$response = $this->controller->publicIndexWithBranding('');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('public', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}

	public function testRedirectionIfRequestedWithAcceptCalendarHeader(): void {
		$endpoint = 'https://somewhere.net/remote.php';

		$this->request->expects(self::once())->method('getHeader')->with('Accept')->willReturn('text/calendar');
		$this->urlGenerator->expects(self::once())->method('linkTo')->with('', 'remote.php')->willReturn($endpoint);
		$response = $this->controller->publicIndexWithBranding('some-token');
		self::assertInstanceOf(RedirectResponse::class, $response);
		self::assertEquals($endpoint . '/dav/public-calendars/some-token/?export', $response->getRedirectURL());
	}

	public function testPublicIndexForEmbedding():void {
		$this->config->expects(self::any())
			->method('getAppValue')
			->willReturnMap([
				['calendar', 'eventLimit', 'yes', 'yes'],
				['calendar', 'currentView', 'dayGridMonth', 'defaultCurrentView'],
				['calendar', 'showWeekends', 'yes', 'no'],
				['calendar', 'showWeekNr', 'no', 'yes'],
				['calendar', 'skipPopover', 'yes', 'yes'],
				['calendar', 'timezone', 'automatic', 'defaultTimezone'],
				['calendar', 'slotDuration', '00:30:00', 'defaultSlotDuration'],
				['calendar', 'defaultReminder', 'none', 'defaultDefaultReminder'],
				['calendar', 'showTasks', 'yes', 'defaultShowTasks'],
				['calendar', 'installed_version', null, '1.0.0']
			]);
		$this->request->expects(self::once())
			->method('getServerProtocol')
			->with()
			->willReturn('protocol');
		$this->request->expects(self::once())
			->method('getServerHost')
			->with()
			->willReturn('host123');
		$this->request->expects(self::once())
			->method('getRequestUri')
			->with()
			->willReturn('/456');

		$this->urlGenerator->expects(self::once())
			->method('imagePath')
			->with('core', 'favicon-touch.png')
			->willReturn('imagePath456');
		$this->urlGenerator->expects(self::once())
			->method('getAbsoluteURL')
			->with('imagePath456')
			->willReturn('absoluteImagePath456');

		$this->initialState
			->method('provideInitialState')
			->withConsecutive(
				['app_version', '1.0.0'],
				['event_limit', true],
				['first_run', false],
				['initial_view', 'defaultCurrentView'],
				['show_weekends', false],
				['show_week_numbers', true],
				['skip_popover', true],
				['talk_enabled', false],
				['talk_api_version', 'v1'],
				['timezone', 'defaultTimezone'],
				['slot_duration', 'defaultSlotDuration'],
				['default_reminder', 'defaultDefaultReminder'],
				['show_tasks', false],
				['tasks_enabled', false]
			);

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
