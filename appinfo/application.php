<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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

use OCA\Calendar\Controller;

use OCP\AppFramework\App;
use OCP\AppFramework\IAppContainer;

class Application extends App {

	/**
	 * @param array $params
	 */
	public function __construct($params=[]) {
		parent::__construct('calendar', $params);
		$container = $this->getContainer();

		$container->registerService('ContactController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$contacts = $c->getServer()->getContactsManager();

			return new Controller\ContactController($c->getAppName(), $request, $contacts);
		});
		$container->registerService('SettingsController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$config = $c->getServer()->getConfig();
			$userSession = $c->getServer()->getUserSession();

			return new Controller\SettingsController($c->getAppName(), $request, $userSession, $config);
		});
		$container->registerService('ViewController', function(IAppContainer $c) {
			$request = $c->query('Request');

			return new Controller\ViewController($c->getAppName(), $request);
		});
	}

	/**
	 * register navigation entry
	 */
	public function registerNavigation() {
		$appName = $this->getContainer()->getAppName();
		$server = $this->getContainer()->getServer();

		$server->getNavigationManager()->add(array(
			'id' => $appName,
			'order' => 10,
			'href' => $server->getURLGenerator()
				->linkToRoute('calendar.view.index'),
			'icon' => $server->getURLGenerator()
				->imagePath($appName, 'calendar.svg'),
			'name' => $server->getL10N($appName)->t('Calendar'),
		));
	}
}
