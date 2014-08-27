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
namespace OCA\Calendar;

use OC\AppFramework\Http\Request;
use OCP\AppFramework\IAppContainer;
use OCP\Calendar\ObjectType;
use OCP\Share;
use OCP\Util;

use OCA\Calendar\Utility\BackendUtility;

class App extends \OCP\AppFramework\App {

	public function __construct($params = array()) {
		parent::__construct('calendar', $params);

		/*
		 * We need to overwrite the request initializer,
		 * because Request automatically reads php://input and
		 * you can't rewind php://input ...
		 */
		$this->getContainer('ServerContainer')->registerService('Request', function($c) {
			if (isset($c['urlParams'])) {
				$urlParams = $c['urlParams'];
			} else {
				$urlParams = array();
			}

			if (\OC::$session->exists('requesttoken')) {
				$requesttoken = \OC::$session->get('requesttoken');
			} else {
				$requesttoken = false;
			}

			if (defined('PHPUNIT_RUN') && PHPUNIT_RUN
			&& in_array('fakeinput', stream_get_wrappers())) {
				$stream = 'fakeinput://data';
			} else {
				$stream = 'data://text/plain;base64,';
			}

			return new Request(
				array(
					'get' => $_GET,
					'post' => $_POST,
					'files' => $_FILES,
					'server' => $_SERVER,
					'env' => $_ENV,
					'cookies' => $_COOKIE,
					'method' => (isset($_SERVER) && isset($_SERVER['REQUEST_METHOD']))
						? $_SERVER['REQUEST_METHOD']
						: null,
					'urlParams' => $urlParams,
					'requesttoken' => $requesttoken,
				), $stream
			);
		});


		/* Controller */
		$this->getContainer()->registerService('BackendController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$bds = $c->query('backends');

			return new Controller\BackendController($c, $request, $bds);
		});
		$this->getContainer()->registerService('CalendarController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$cbl = $c->query('CalendarRequestBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new Controller\CalendarController($c, $request, $cbl, $obl);
		});
		$this->getContainer()->registerService('ObjectController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$obl = $c->query('ObjectRequestBusinessLayer');
			$cbl = $c->query('CalendarBusinessLayer');

			return new Controller\ObjectController($c, $request, $obl, $cbl, ObjectType::ALL);
		});
		$this->getContainer()->registerService('EventController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$obl = $c->query('ObjectRequestBusinessLayer');
			$cbl = $c->query('CalendarBusinessLayer');

			return new Controller\ObjectController($c, $request, $obl, $cbl, ObjectType::EVENT);
		});
		$this->getContainer()->registerService('JournalController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$obl = $c->query('ObjectRequestBusinessLayer');
			$cbl = $c->query('CalendarBusinessLayer');

			return new Controller\ObjectController($c, $request, $obl, $cbl, ObjectType::JOURNAL);
		});
		$this->getContainer()->registerService('TodoController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$obl = $c->query('ObjectRequestBusinessLayer');
			$cbl = $c->query('CalendarBusinessLayer');

			return new Controller\ObjectController($c, $request, $obl, $cbl, ObjectType::TODO);
		});
		$this->getContainer()->registerService('ScanController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$cbl = $c->query('CalendarCacheBusinessLayer');
			$obl = $c->query('ObjectCacheBusinessLayer');

			return new Controller\ScanController($c, $request, $cbl, $obl);
		});
		$this->getContainer()->registerService('SettingsController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$set = $c->query('settings');

			return new Controller\SettingsController($c, $request, $set);
		});
		$this->getContainer()->registerService('SubscriptionController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$sbl = $c->query('SubscriptionBusinessLayer');
			$bds = $c->query('backends');

			return new Controller\SubscriptionController($c, $request, $sbl, $bds);
		});
		$this->getContainer()->registerService('TimezoneController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$tbl = $c->query('TimezoneBusinessLayer');

			return new Controller\TimezoneController($c, $request, $tbl);
		});
		$this->getContainer()->registerService('ViewController', function(IAppContainer $c) {
			$request = $c->query('Request');

			return new Controller\ViewController($c, $request);
		});


		/* BusinessLayer */
		$this->getContainer()->registerService('CalendarBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$cmp = $c->query('CalendarMapper');
			$obl = $c->query('ObjectBusinessLayer');

			return new BusinessLayer\CalendarBusinessLayer($bds, $cmp, $obl);
		});
		$this->getContainer()->registerService('CalendarCacheBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$cmp = $c->query('CalendarMapper');

			return new BusinessLayer\CalendarCacheBusinessLayer($bds, $cmp);
		});
		$this->getContainer()->registerService('CalendarRequestBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$cmp = $c->query('CalendarMapper');
			$obl = $c->query('ObjectBusinessLayer');

			return new BusinessLayer\CalendarRequestBusinessLayer($bds, $cmp, $obl);
		});
		$this->getContainer()->registerService('ObjectBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$omp = $c->query('ObjectMapper');

			return new BusinessLayer\ObjectBusinessLayer($bds, $omp);
		});
		$this->getContainer()->registerService('ObjectRequestBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$omp = $c->query('ObjectMapper');

			return new BusinessLayer\ObjectRequestBusinessLayer($bds, $omp);
		});
		$this->getContainer()->registerService('ObjectBusinessLayerWithoutSharing', function(IAppContainer $c) {
			$bds = $c->query('backendsWithoutSharing');
			$omp = $c->query('ObjectMapper');

			return new BusinessLayer\ObjectBusinessLayer($bds, $omp);
		});
		$this->getContainer()->registerService('ObjectCacheBusinessLayer', function(IAppContainer $c) {
			$bds = $c->query('backends');
			$omp = $c->query('ObjectMapper');

			return new BusinessLayer\ObjectCacheBusinessLayer($bds, $omp);
		});
		$this->getContainer()->registerService('SubscriptionBusinessLayer', function(IAppContainer $c) {
			$mapper = $c->query('SubscriptionMapper');

			return new BusinessLayer\SubscriptionBusinessLayer($mapper);
		});
		$this->getContainer()->registerService('TimezoneBusinessLayer', function(IAppContainer $c) {
			$mapper = $c->query('TimezoneMapper');

			return new BusinessLayer\TimezoneBusinessLayer($mapper);
		});


		/* Mappers */
		$this->getContainer()->registerService('BackendMapper', function(IAppContainer $c) {
			return new Db\BackendMapper($c);
		});
		$this->getContainer()->registerService('CalendarMapper', function(IAppContainer $c) {
			return new Db\CalendarMapper($c);
		});
		$this->getContainer()->registerService('ObjectMapper', function(IAppContainer $c) {
			return new Db\ObjectMapper($c);
		});
		$this->getContainer()->registerService('TimezoneMapper', function(IAppContainer $c) {
			return new Db\TimezoneMapper($c);
		});
		$this->getContainer()->registerService('SubscriptionMapper', function(IAppContainer $c) {
			return new Db\SubscriptionMapper($c);
		});


		/* Default backend config and backend initialization */
		$this->getContainer()->registerParameter('fallbackBackendConfig', array(
			array (
				'backend' => 'org.ownCloud.local',
				'classname' => '\\OCA\\Calendar\\Backend\\Local',
				'arguments' => array(),
				'enabled' => true,
			),
			/*array (
				'backend' => 'org.ownCloud.caldav',
				'classname' => '\\OCA\\Calendar\\Backend\\CalDAV',
				'arguments' => array(),
				'enabled' => true,
			),*/
			array (
				'backend' => 'org.ownCloud.contact',
				'classname' => '\\OCA\\Calendar\\Backend\\Contact',
				'arguments' => array(),
				'enabled' => true,
			),
			/*array (
				'backend' => 'org.ownCloud.files',
				'classname' => '\\OCA\\Calendar\\Backend\\Files',
				'arguments' => array(),
				'enabled' => true,
			),*/
			array (
				'backend' => 'org.ownCloud.sharing',
				'classname' => '\\OCA\\Calendar\\Backend\\Sharing',
				'arguments' => array(),
				'enabled' => true,
			),
			array (
				'backend' => 'org.ownCloud.webcal',
				'classname' => '\\OCA\\Calendar\\Backend\\WebCal',
				'arguments' => array(),
				'enabled' => true,
			),
		));

		$this->getContainer()->registerParameter('settings', array(
			'view' => array(
				'configKey' => 'currentView',
				'options' => array(
					'agendaDay',
					'agendaWeek',
					'month',
				),
				'default' => 'month'
			),
			'timeFormat' => array(
				'configKey' => 'timeformat',
				'options' => array(
					'ampm',
					'24'
				),
				'default' => '24'
			),
			'firstDayOfWeek' => array(
				'configKey' => 'firstday',
				'options' => array(
					'6',
					'0',
					'1'
				),
				'default' => '1'
			),
		));


		$this->getContainer()->registerService('backends', function(IAppContainer $c) {
			/** @var Db\BackendMapper $mapper */
			$mapper = $c->query('BackendMapper');
			$backends = $mapper->findAll();
			return BackendUtility::setup($c, $backends);
		});


		$this->getContainer()->registerService('backendsWithoutSharing', function(IAppContainer $c) {
			/** @var Db\BackendMapper $mapper */
			$mapper = $c->query('BackendMapper');
			$backends = $mapper->findAll();
			$backends->removeByProperty('backend', 'org.ownCloud.sharing');
			return BackendUtility::setup($c, $backends);

		});
	}


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


	public function registerCron() {
		/*
		$c = $this->getContainer();
		//$c->addRegularTask('OCA\Calendar\Backgroundjob\Task', 'run');
		*/
	}


	public function registerHooks() {
		//Calendar-internal hooks
		Util::connectHook('OCP\Calendar', 'postCreateObject',
			'\OCA\Calendar\Util\HookUtility', 'createObject');
		Util::connectHook('OCP\Calendar', 'postUpdateObject',
			'\OCA\Calendar\Util\HookUtility', 'updateObject');
		Util::connectHook('OCP\Calendar', 'postDeleteObject',
			'\OCA\Calendar\Util\HookUtility', 'deleteObject');

		//Sharing hooks
		Util::connectHook('OCP\Share', 'post_shared',
			'\OCA\Calendar\Util\HookUtility', 'share');
		Util::connectHook('OCP\Share', 'post_unshare',
			'\OCA\Calendar\Util\HookUtility', 'unshare');

		//User hooks
		Util::connectHook('OC_User', 'post_createUser',
			'\OCA\Calendar\Util\HookUtility', 'createUser');
		Util::connectHook('OC_User', 'post_createUser',
			'\OCA\Calendar\Util\HookUtility', 'deleteUser');
	}


	public function registerProviders() {
		/* \OC_Search::registerProvider('\OCA\Calendar\SearchProvider'); */
		Share::registerBackend('calendar', '\OCA\Calendar\Share\Calendar');
		Share::registerBackend('event', '\OCA\Calendar\Share\Event');
	}
}
