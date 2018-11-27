<?php
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
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
namespace OCA\Calendar\AppInfo;

use OCP\AppFramework\App;

class Application extends App {

	/**
	 * @param array $params
	 */
	public function __construct(array $params=[]) {
		parent::__construct('calendar', $params);
	}

	/**
	 * register navigation entry
	 */
	public function registerNavigation() {
		$appName = $this->getContainer()->getAppName();
		$server = $this->getContainer()->getServer();

		$server->getNavigationManager()->add(function() use ($appName, $server) {
			return [
				'id' => $appName,
				'order' => 5,
				'href' => $server->getURLGenerator()
					->linkToRoute('calendar.view.index'),
				'icon' => $server->getURLGenerator()
					->imagePath($appName, 'calendar.svg'),
				'name' => $server->getL10N($appName)->t('Calendar'),
			];
		});
	}
}
