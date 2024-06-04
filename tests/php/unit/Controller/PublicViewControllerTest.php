<?php

declare(strict_types=1);
/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
namespace OCA\Calendar\Controller;

use ChristophWurst\Nextcloud\Testing\TestCase;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Http\Template\PublicTemplateResponse;
use OCP\IConfig;
use OCP\IInitialStateService;
use OCP\IRequest;
use OCP\IURLGenerator;
use PHPUnit\Framework\MockObject\MockObject;

class PublicViewControllerTest extends TestCase {
	/** @var string */
	private $appName;

	/** @var IRequest|MockObject */
	private $request;

	/** @var IConfig|MockObject */
	private $config;

	/** @var IInitialStateService|MockObject */
	private $initialStateService;

	/** @var IURLGenerator|MockObject */
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
		$this->config->expects(self::exactly(11))
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
				['dav', 'allow_calendar_link_subscriptions', 'yes', 'defaultCanSubscribeLink'],
				['calendar', 'installed_version', '', '1.0.0']
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

		$this->initialStateService->expects(self::exactly(17))
			->method('provideInitialState')
			->withConsecutive(
				['calendar', 'app_version', '1.0.0'],
				['calendar', 'event_limit', false],
				['calendar', 'first_run', false],
				['calendar', 'initial_view', 'defaultCurrentView'],
				['calendar', 'show_weekends', false],
				['calendar', 'show_week_numbers', true],
				['calendar', 'skip_popover', true],
				['calendar', 'talk_enabled', false],
				['calendar', 'talk_api_version', 'v1'],
				['calendar', 'timezone', 'defaultTimezone'],
				['calendar', 'slot_duration', 'defaultSlotDuration'],
				['calendar', 'default_reminder', 'defaultDefaultReminder'],
				['calendar', 'show_tasks', true],
				['calendar', 'tasks_enabled', false],
				['calendar', 'hide_event_export', false],
				['calendar', 'can_subscribe_link', 'defaultCanSubscribeLink'],
				['calendar', 'show_resources', false],
			);

		$response = $this->controller->publicIndexWithBranding('');

		$this->assertInstanceOf(PublicTemplateResponse::class, $response);
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
		$this->config->expects(self::exactly(11))
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
				['dav', 'allow_calendar_link_subscriptions', 'yes', 'defaultCanSubscribeLink'],
				['calendar', 'installed_version', '', '1.0.0']
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

		$this->initialStateService->expects(self::exactly(18))
			->method('provideInitialState')
			->withConsecutive(
				['calendar', 'app_version', '1.0.0'],
				['calendar', 'event_limit', true],
				['calendar', 'first_run', false],
				['calendar', 'initial_view', 'defaultCurrentView'],
				['calendar', 'show_weekends', false],
				['calendar', 'show_week_numbers', true],
				['calendar', 'skip_popover', true],
				['calendar', 'talk_enabled', false],
				['calendar', 'talk_api_version', 'v1'],
				['calendar', 'timezone', 'defaultTimezone'],
				['calendar', 'slot_duration', 'defaultSlotDuration'],
				['calendar', 'default_reminder', 'defaultDefaultReminder'],
				['calendar', 'show_tasks', false],
				['calendar', 'tasks_enabled', false],
				['calendar', 'hide_event_export', false],
				['calendar', 'can_subscribe_link', 'defaultCanSubscribeLink'],
				['calendar', 'show_resources', false],
				['calendar', 'is_embed', true],
			);

		$response = $this->controller->publicIndexForEmbedding('');

		$this->assertInstanceOf(PublicTemplateResponse::class, $response);
		$this->assertEquals([
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('public', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}
}
