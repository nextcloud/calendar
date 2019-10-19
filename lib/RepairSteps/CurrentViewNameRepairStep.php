<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
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
namespace OCA\Calendar\RepairSteps;

use OCP\IConfig;
use OCP\IUser;
use OCP\IUserManager;
use OCP\Migration\IOutput;
use OCP\Migration\IRepairStep;

/**
 * Class CurrentViewNameRepairStep
 *
 * @package OCA\Calendar\RepairSteps
 */
class CurrentViewNameRepairStep implements IRepairStep {

	/** @var IUserManager */
	private $userManager;

	/** @var IConfig */
	private $config;

	/**
	 * CurrentViewNameRepairStep constructor.
	 *
	 * @param IUserManager $userManager
	 * @param IConfig $config
	 */
	public function __construct(IUserManager $userManager,
								IConfig $config) {
		$this->userManager = $userManager;
		$this->config = $config;
	}

	/**
	 * @return string
	 */
	public function getName():string {
		return 'Update name of the stored view';
	}

	/**
	 * @param IOutput $output
	 */
	public function run(IOutput $output):void {
		$this->userManager->callForSeenUsers(function(IUser $user) {
			$userId = $user->getUID();
			$savedView = $this->config->getUserValue($userId, 'calendar', 'currentView', null);

			if ($savedView === null) {
				return;
			}
			if (\in_array($savedView, ['timeGridDay', 'timeGridWeek', 'dayGridMonth'], true)) {
				return;
			}

			switch ($savedView) {
				case 'agendaDay':
					$this->config->setUserValue($userId, 'calendar', 'currentView', 'timeGridDay');
					break;

				case 'agendaWeek':
					$this->config->setUserValue($userId, 'calendar', 'currentView', 'timeGridWeek');
					break;

				case 'month':
				default:
					$this->config->setUserValue($userId, 'calendar', 'currentView', 'dayGridMonth');
					break;
			}
		});
	}
}
