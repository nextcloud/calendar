<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar;

use \OCP\AppFramework\IAppContainer;

use \OCA\Calendar\PublicAPI\Calendar;
use \OCA\Calendar\PublicAPI\Object;
use \OCA\Calendar\PublicAPI\Event;
use \OCA\Calendar\PublicAPI\Journal;
use \OCA\Calendar\PublicAPI\Todo;

use \OCA\Calendar\BusinessLayer\BackendBusinessLayer;
use \OCA\Calendar\BusinessLayer\CalendarBusinessLayer;
use \OCA\Calendar\BusinessLayer\ObjectBusinessLayer;

use \OCA\Calendar\Controller\BackendController;
use \OCA\Calendar\Controller\CalendarController;
use \OCA\Calendar\Controller\SubscriptionController;
use \OCA\Calendar\Controller\ObjectController;
use \OCA\Calendar\Controller\EventController;
use \OCA\Calendar\Controller\JournalController;
use \OCA\Calendar\Controller\TodoController;
use \OCA\Calendar\Controller\TimezoneController;
use \OCA\Calendar\Controller\SettingsController;
use \OCA\Calendar\Controller\ViewController;

use \OCA\Calendar\Db\BackendMapper;
use \OCA\Calendar\Db\CalendarMapper;
use \OCA\Calendar\Db\SubscriptionMapper;
use \OCA\Calendar\Db\ObjectMapper;
use \OCA\Calendar\Db\TimezoneMapper;

use \OCA\Calendar\Fetcher\Fetcher;
use \OCA\Calendar\Fetcher\CalDAVFetcher;
use \OCA\Calendar\Fetcher\WebCalFetcher;

use \OCA\Calendar\Utility\Updater;

class App extends \OCP\AppFramework\App {

	public function __construct($params = array()) {
		parent::__construct('calendar', $params);

		/**
		 * Controller
		 */
		$this->getContainer()->registerService('CalendarController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new CalendarController($c, $req, $cbl, $obl);
		});

		$this->getContainer()->registerService('SubscriptionController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$smp = $c->query('SubscriptionMapper');

			return new ViewController($c, $req, $smp);
		});


		$this->getContainer()->registerService('ObjectController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new ObjectController($c, $req, $cbl, $obl);
		});

		$this->getContainer()->registerService('EventController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new EventController($c, $req, $cbl, $obl);
		});

		$this->getContainer()->registerService('JournalController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new JournalController($c, $req, $cbl, $obl);
		});

		$this->getContainer()->registerService('TodoController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new TodoController($c, $req, $cbl, $obl);
		});

		$this->getContainer()->registerService('TimezoneController', function(IAppContainer $c) {
			$req = $c->query('Request');
			$tmp = $c->query('TimezoneMapper');

			return new ViewController($c, $req, $tmp);
		});


		$this->getContainer()->registerService('SettingsController', function(IAppContainer $c) {
			$req = $c->query('Request');

			return new SettingsController($c, $req);
		});

		$this->getContainer()->registerService('ViewController', function(IAppContainer $c) {
			$req = $c->query('Request');

			return new ViewController($c, $req);
		});

		/**
		 * BusinessLayer
		 */
		$this->getContainer()->registerService('CalendarBusinessLayer', function(IAppContainer $c) {
			$bbl = $c->query('BackendMapper');
			$cmp = $c->query('CalendarMapper');
			$obl = $c->query('ObjectBusinessLayer');

			return new CalendarBusinessLayer($c, $bbl, $cmp, $obl);
		});

		$this->getContainer()->registerService('ObjectBusinessLayer', function(IAppContainer $c) {
			$bbl = $c->query('BackendMapper');
			$omp = $c->query('ObjectMapper');

			return new ObjectBusinessLayer($c, $bbl, $omp);
		});

		/**
		 * Mappers
		 */
		$this->getContainer()->registerService('BackendMapper', function(IAppContainer $c) {
			return new BackendMapper($c);
		});

		$this->getContainer()->registerService('CalendarMapper', function(IAppContainer $c) {
			return new CalendarMapper($c);
		});

		$this->getContainer()->registerService('SubscriptionMapper', function(IAppContainer $c) {
			return new SubscriptionMapper($c);
		});

		$this->getContainer()->registerService('ObjectMapper', function(IAppContainer $c) {
			return new ObjectMapper($c);
		});

		$this->getContainer()->registerService('TimezoneMapper', function(IAppContainer $c) {
			return new TimezoneMapper($c);
		});

		/**
		 * External API
		 */
		$this->getContainer()->registerService('CalendarAPI', function(IAppContainer $c) {
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new CalendarAPI($c, $cbl, $obl);
		});

		$this->getContainer()->registerService('ObjectAPI', function(IAppContainer $c) {
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new ObjectAPI($c, $cbl, $obl);
		});

		$this->getContainer()->registerService('EventAPI', function(IAppContainer $c) {
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new EventAPI($c, $cbl, $obl);
		});

		$this->getContainer()->registerService('JournalAPI', function(IAppContainer $c) {
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new JournalAPI($c, $cbl, $obl);
		});

		$this->getContainer()->registerService('TodoAPI', function(IAppContainer $c) {
			$cbl = $c->query('CalendarBusinessLayer');
			$obl = $c->query('ObjectBusinessLayer');

			return new TodoAPI($c, $cbl, $obl);
		});

		$defaultBackend = 'local';

		$defaultConfig = array(
			array (
				'backend' => 'local',
				'classname' => '\\OCA\\Calendar\\Backend\\Local',
				'arguments' => array(),
				'enabled' => true,
			),
			array (
				'backend' => 'contact',
				'classname' => '\\OCA\\Calendar\\Backend\\Contact',
				'arguments' => array(),
				'enabled' => true,
			),
		);

		$this->getContainer()->registerParameter('defaultBackend', $defaultBackend);
		$this->getContainer()->registerParameter('fallbackBackendConfig', $defaultConfig);
	}

	public function registerNavigation() {
		$appName = $this->getContainer()->getAppName();
		$server = $this->getContainer()->getServer();
		$server->getNavigationManager()->add(array(
			'id' => $appName,
			'order' => 10,
			'href' => \OC::$server->getURLGenerator()->linkToRoute('calendar.view.index'),
			'icon' => \OC::$server->getURLGenerator()->imagePath($appName, 'calendar.svg'),
			'name' => \OC::$server->getL10N($appName)->t('Calendar'),
		));
	}

	public function registerCron() {
		$c = $this->getContainer();
		//$c->addRegularTask('OCA\Calendar\Backgroundjob\Task', 'run');
	}
	public function registerHooks() {
		$c = $this->getContainer();
		//$c->connectHook('OC_User', 'post_createUser', '\OC\Calendar\Util\UserHooks', 'create');
		//$c->connectHook('OC_User', 'post_deleteUser', '\OC\Calendar\Util\UserHooks', 'delete');
		//$c->connectHook();
		//$c->connectJook();
	}

	public function registerProviders() {
		//\OC_Search::registerProvider('\OCA\Calendar\SearchProvider');
		//\OCP\Share::registerBackend('calendar', '\OCA\Calendar\Share\Calendar');
		//\OCP\Share::registerBackend('event', '\OCA\Calendar\Share\Event');
	}
}