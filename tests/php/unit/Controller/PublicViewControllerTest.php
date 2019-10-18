<?php
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
use OCP\IRequest;
use OCP\IURLGenerator;
use Test\TestCase;

class PublicViewControllerTest extends TestCase {

	/** @var string */
	private $appName;

	/** @var IRequest|\PHPUnit_Framework_MockObject_MockObject */
	private $request;

	/** @var IConfig|\PHPUnit_Framework_MockObject_MockObject */
	private $config;

	/** @var IURLGenerator|\PHPUnit_Framework_MockObject_MockObject */
	private $urlGenerator;

	/** @var ViewController */
	private $controller;

	protected function setUp():void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->config = $this->createMock(IConfig::class);
		$this->urlGenerator = $this->createMock(IURLGenerator::class);

		$this->controller = new PublicViewController($this->appName, $this->request,
			$this->config, $this->urlGenerator);
	}

	public function testPublicIndexWithBranding():void {
		$this->config->expects($this->at(0))
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

		$response = $this->controller->publicIndexWithBranding('');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'app_version' => '1.0.0',
			'first_run' => false,
			'initial_view' => 'dayGridMonth',
			'show_weekends' => true,
			'show_week_numbers' => false,
			'skip_popover' => true,
			'timezone' => 'automatic',
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('base', $response->getRenderAs());
		$this->assertEquals('public', $response->getTemplateName());
	}

	public function testPublicIndexForEmbedding():void {
		$this->config->expects($this->at(0))
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

		$response = $this->controller->publicIndexForEmbedding('');

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'app_version' => '1.0.0',
			'first_run' => false,
			'initial_view' => 'dayGridMonth',
			'show_weekends' => true,
			'show_week_numbers' => false,
			'skip_popover' => true,
			'timezone' => 'automatic',
			'share_url' => 'protocol://host123/456',
			'preview_image' => 'absoluteImagePath456'
		], $response->getParams());
		$this->assertEquals('base', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}
}
