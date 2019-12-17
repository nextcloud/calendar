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

use OCP\App\IAppManager;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IRequest;
use ChristophWurst\Nextcloud\Testing\TestCase;

class ViewControllerTest extends TestCase {

	/** @var string */
	private $appName;

	/** @var IRequest|\PHPUnit_Framework_MockObject_MockObject */
	private $request;

	/** @var IAppManager|\PHPUnit_Framework_MockObject_MockObject */
	private $appManager;

	/** @var IConfig|\PHPUnit_Framework_MockObject_MockObject */
	private $config;

	/** @var string */
	private $userId;

	/** @var ViewController */
	private $controller;

	protected function setUp():void {
		$this->appName = 'calendar';
		$this->request = $this->createMock(IRequest::class);
		$this->appManager = $this->createMock(IAppManager::class);
		$this->config = $this->createMock(IConfig::class);
		$this->userId = 'user123';

		$this->controller = new ViewController($this->appName, $this->request,
			$this->config, $this->appManager, $this->userId);
	}

	public function testIndex():void {
		$this->config->expects($this->at(0))
			->method('getAppValue')
			->with('calendar', 'installed_version')
			->willReturn('1.0.0');
		$this->config->expects($this->at(1))
			->method('getUserValue')
			->with('user123', 'calendar', 'firstRun', 'yes')
			->willReturn('yes');
		$this->config->expects($this->at(2))
			->method('getUserValue')
			->with('user123', 'calendar', 'currentView', 'dayGridMonth')
			->willReturn('timeGridWeek');
		$this->config->expects($this->at(3))
			->method('getUserValue')
			->with('user123', 'calendar', 'showWeekends', 'yes')
			->willReturn('yes');
		$this->config->expects($this->at(4))
			->method('getUserValue')
			->with('user123', 'calendar', 'showWeekNr', 'no')
			->willReturn('yes');
		$this->config->expects($this->at(5))
			->method('getUserValue')
			->with('user123', 'calendar', 'skipPopover', 'no')
			->willReturn('yes');
		$this->config->expects($this->at(6))
			->method('getUserValue')
			->with('user123', 'calendar', 'timezone', 'automatic')
			->willReturn('Europe/Berlin');
		$this->appManager->expects($this->at(0))
			->method('isEnabledForUser')
			->with('spreed')
			->willReturn(true);

		$response = $this->controller->index();

		$this->assertInstanceOf(TemplateResponse::class, $response);
		$this->assertEquals([
			'app_version' => '1.0.0',
			'first_run' => true,
			'initial_view' => 'timeGridWeek',
			'show_weekends' => true,
			'show_week_numbers' => true,
			'skip_popover' => true,
			'talk_enabled' => true,
			'timezone' => 'Europe/Berlin',
		], $response->getParams());
		$this->assertEquals('user', $response->getRenderAs());
		$this->assertEquals('main', $response->getTemplateName());
	}
}
