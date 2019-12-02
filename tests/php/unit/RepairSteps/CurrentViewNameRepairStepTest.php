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
namespace OCA\Calendar\RepairSteps;

use OCP\IConfig;
use OCP\IUser;
use OCP\IUserManager;
use OCP\Migration\IOutput;
use ChristophWurst\Nextcloud\Testing\TestCase;

class CurrentViewNameRepairStepTest extends TestCase {

	/** @var IUserManager|\PHPUnit_Framework_MockObject_MockObject */
	private $userManager;

	/** @var IConfig|\PHPUnit_Framework_MockObject_MockObject */
	private $config;

	/** @var CurrentViewNameRepairStep */
	private $repairStep;

	protected function setUp():void {
		parent::setUp();

		$this->userManager = $this->createMock(IUserManager::class);
		$this->config = $this->createMock(IConfig::class);

		$this->repairStep = new CurrentViewNameRepairStep($this->userManager,
			$this->config);
	}

	public function testGetName():void {
		$this->assertEquals('Update name of the stored view', $this->repairStep->getName());
	}

	public function testRun():void {
		$this->userManager->expects($this->once())
			->method('callForSeenUsers')
			->with($this->callback(function($fn) {
				$user1 = $this->createMock(IUser::class);
				$user1->method('getUID')->willReturn('user1');

				$user2 = $this->createMock(IUser::class);
				$user2->method('getUID')->willReturn('user2');

				$user3 = $this->createMock(IUser::class);
				$user3->method('getUID')->willReturn('user3');

				$user4 = $this->createMock(IUser::class);
				$user4->method('getUID')->willReturn('user4');

				$user5 = $this->createMock(IUser::class);
				$user5->method('getUID')->willReturn('user5');

				$user6 = $this->createMock(IUser::class);
				$user6->method('getUID')->willReturn('user6');

				$user7 = $this->createMock(IUser::class);
				$user7->method('getUID')->willReturn('user7');

				$user8 = $this->createMock(IUser::class);
				$user8->method('getUID')->willReturn('user8');

				$fn($user1);
				$fn($user2);
				$fn($user3);
				$fn($user4);
				$fn($user5);
				$fn($user6);
				$fn($user7);
				$fn($user8);

				return true;
			}));

		$this->config->expects($this->at(0))
			->method('getUserValue')
			->with('user1', 'calendar', 'currentView', null)
			->willReturn('agendaDay');
		$this->config->expects($this->at(1))
			->method('setUserValue')
			->with('user1', 'calendar', 'currentView', 'timeGridDay');

		$this->config->expects($this->at(2))
			->method('getUserValue')
			->with('user2', 'calendar', 'currentView', null)
			->willReturn('agendaWeek');
		$this->config->expects($this->at(3))
			->method('setUserValue')
			->with('user2', 'calendar', 'currentView', 'timeGridWeek');

		$this->config->expects($this->at(4))
			->method('getUserValue')
			->with('user3', 'calendar', 'currentView', null)
			->willReturn('month');
		$this->config->expects($this->at(5))
			->method('setUserValue')
			->with('user3', 'calendar', 'currentView', 'dayGridMonth');

		$this->config->expects($this->at(6))
			->method('getUserValue')
			->with('user4', 'calendar', 'currentView', null)
			->willReturn('otherView');
		$this->config->expects($this->at(7))
			->method('setUserValue')
			->with('user4', 'calendar', 'currentView', 'dayGridMonth');

		$this->config->expects($this->at(8))
			->method('getUserValue')
			->with('user5', 'calendar', 'currentView', null)
			->willReturn(null);

		$this->config->expects($this->at(9))
			->method('getUserValue')
			->with('user6', 'calendar', 'currentView', null)
			->willReturn('timeGridDay');

		$this->config->expects($this->at(10))
			->method('getUserValue')
			->with('user7', 'calendar', 'currentView', null)
			->willReturn('timeGridWeek');

		$this->config->expects($this->at(11))
			->method('getUserValue')
			->with('user8', 'calendar', 'currentView', null)
			->willReturn('dayGridMonth');

		$output = $this->createMock(IOutput::class);
		$output->expects($this->never())
			->method($this->anything());

		$this->repairStep->run($output);
	}
}
