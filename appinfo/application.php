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

use OCA\Calendar;

use OCP\AppFramework\App;
use OCP\AppFramework\IAppContainer;
use OCP\Share;
use OCP\Util;

use Sabre\VObject\Splitter\ICalendar as ICalendarSplitter;
use OCA\Calendar\Sabre\Splitter\JCalendar as JCalendarSplitter;

class Application extends App {

	/**
	 * @var Calendar\IBackendCollection
	 */
	protected $backends;


	/**
	 * @var Calendar\Db\BackendFactory
	 */
	protected $backendFactory;


	/**
	 * @param array $params
	 */
	public function __construct($params = array()) {
		parent::__construct('calendar', $params);
		$container = $this->getContainer();

		$this->registerControllers($container);
		$this->registerBusinessLayers($container);
		$this->registerMappers($container);
		$this->registerFactories($container);
		$this->registerReaders($container);

		$container->registerService('BackendsWithoutSharing', function(IAppContainer $c) {
			$backends = $c->query('Backends');
			$backends->removeByProperty('backend', 'org.ownCloud.sharing');

			return $backends;
		});

		$container->registerParameter('settings', [
			'view' => [
				'configKey' => 'currentView',
				'options' => [
					'agendaDay',
					'agendaWeek',
					'month',
				],
				'default' => 'month',
			]
		]);

		$container->register
		$this->initBackendSystem($container);
		$this->registerBackends($container);
	}

	private function registerControllers(IAppContainer $container) {
		$container->registerService('BackendController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();

			return new Calendar\Controller\BackendController($c->getAppName(), $request, $userSession, $this->backends);
		});
		$container->registerService('CalendarController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();
			$calendarManager = $c->query('CalendarRequestManager');
			$calendarFactory = $c->query('CalendarFactory');

			return new Calendar\Controller\CalendarController($c->getAppName(), $request, $userSession, $calendarManager, $calendarFactory);
		});
		$container->registerService('ContactController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$contacts = $c->getServer()->getContactsManager();
			$userSession = $c->getServer()->getUserSession();

			return new Calendar\Controller\ContactController($c->getAppName(), $request, $userSession, $contacts);
		});
		$container->registerService('ObjectController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();
			$calendars = $c->query('CalendarRequestManager');
			$objects = $c->query('ObjectRequestManager');
			$objectFactory = $c->query('ObjectFactory');
			$timezones = $c->query('TimezoneMapper');

			return new Calendar\Controller\ObjectController($c->getAppName(), $request, $userSession, $calendars, $objects, $objectFactory, $timezones, Calendar\Db\ObjectType::ALL);
		});
		$container->registerService('OCA\\Calendar\\Controller\\EventController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();
			$calendars = $c->query('CalendarRequestManager');
			$objects = $c->query('ObjectRequestManager');
			$objectFactory = $c->query('ObjectFactory');
			$timezones = $c->query('TimezoneMapper');

			return new Calendar\Controller\ObjectController($c->getAppName(), $request, $userSession, $calendars, $objects, $objectFactory, $timezones, Calendar\Db\ObjectType::EVENT);
		});
		$container->registerService('OCA\\Calendar\\Controller\\JournalController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();
			$calendars = $c->query('CalendarRequestManager');
			$objects = $c->query('ObjectRequestManager');
			$objectFactory = $c->query('ObjectFactory');
			$timezones = $c->query('TimezoneMapper');

			return new Calendar\Controller\ObjectController($c->getAppName(), $request, $userSession, $calendars, $objects, $objectFactory, $timezones, Calendar\Db\ObjectType::JOURNAL);
		});
		$container->registerService('OCA\\Calendar\\Controller\\TodoController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();
			$calendars = $c->query('CalendarRequestManager');
			$objects = $c->query('ObjectRequestManager');
			$objectFactory = $c->query('ObjectFactory');
			$timezones = $c->query('TimezoneMapper');

			return new Calendar\Controller\ObjectController($c->getAppName(), $request, $userSession, $calendars, $objects, $objectFactory, $timezones, Calendar\Db\ObjectType::TODO);
		});
		$container->registerService('SettingsController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$settings = $c->query('settings');
			$config = $c->getServer()->getConfig();
			$userSession = $c->getServer()->getUserSession();

			return new Calendar\Controller\SettingsController($c->getAppName(), $request, $userSession, $config, $settings);
		});
		$container->registerService('SubscriptionController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$subscriptions = $c->query('SubscriptionBusinessLayer');
			$userSession = $c->getServer()->getUserSession();
			$subscriptionFactory = $c->query('SubscriptionFactory');

			return new Calendar\Controller\SubscriptionController($c->getAppName(), $request, $userSession, $subscriptions, $subscriptionFactory);
		});
		$container->registerService('TimezoneController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$timezones = $c->query('TimezoneBusinessLayer');
			$userSession = $c->getServer()->getUserSession();

			return new Calendar\Controller\TimezoneController($c->getAppName(), $request, $userSession, $timezones);
		});
		$container->registerService('ViewController', function(IAppContainer $c) {
			$request = $c->query('Request');
			$userSession = $c->getServer()->getUserSession();

			return new Calendar\Controller\ViewController($c->getAppName(), $request, $userSession);
		});
	}

	private function registerBusinessLayers(IAppContainer $container) {
		$container->registerService('CalendarManager', function() {
			return new Calendar\BusinessLayer\CalendarManager($this->backends);
		});
		$container->registerService('CalendarRequestManager', function() {
			return new Calendar\BusinessLayer\CalendarRequestManager($this->backends);
		});
		$container->registerService('ObjectManager', function(IAppContainer $c) {
			$timezones = $c->query('TimezoneMapper');

			return function(Calendar\ICalendar $calendar) use ($timezones) {
				return new Calendar\BusinessLayer\ObjectManager($calendar, $timezones);
			};
		});
		$container->registerService('ObjectRequestManager', function(IAppContainer $c) {
			$timezones = $c->query('TimezoneMapper');

			return function(Calendar\ICalendar $calendar) use ($timezones) {
				return new Calendar\BusinessLayer\ObjectRequestManager($calendar, $timezones);
			};
		});
		$container->registerService('SubscriptionBusinessLayer', function(IAppContainer $c) {
			$mapper = $c->query('SubscriptionMapper');

			return new Calendar\BusinessLayer\Subscription($mapper);
		});
		$container->registerService('TimezoneBusinessLayer', function(IAppContainer $c) {
			$mapper = $c->query('TimezoneMapper');

			return new Calendar\BusinessLayer\Timezone($mapper);
		});
	}

	private function registerMappers(IAppContainer $container) {
		$container->registerService('TimezoneMapper', function() {
			return new Calendar\Db\TimezoneMapper();
		});
		$container->registerService('SubscriptionMapper', function(IAppContainer $c) {
			$factory = $c->query('SubscriptionFactory');

			return new Calendar\Db\SubscriptionMapper($c->getServer()->getDatabaseConnection(), $factory);
		});
	}

	private function registerFactories(IAppContainer $container) {
		$container->registerService('CalendarFactory', function(IAppContainer $c) {
			$logger = $c->getServer()->getLogger();
			$timezoneMapper = $c->query('TimezoneMapper');

			return new Calendar\Db\CalendarFactory($this->backends, $timezoneMapper, $logger);
		});
		$container->registerService('ObjectFactory', function(IAppContainer $c) {
			$logger = $c->getServer()->getLogger();
			$iCal = function($data) {
				return new ICalendarSplitter($data);
			};
			$jCal = function($data) {
				return new JCalendarSplitter($data);
			};

			return new Calendar\Db\ObjectFactory($logger, $iCal, $jCal);
		});
		$container->registerService('SubscriptionFactory', function(IAppContainer $c) {
			$logger = $c->getServer()->getLogger();

			return new Calendar\Db\SubscriptionFactory($logger);
		});
	}

	/**
	 * register reader classes
	 * @param IAppContainer $container
	 */
	private function registerReaders(IAppContainer $container) {
		$container->registerService('JSONCalendarReader', function(IAppContainer $c) {
			return function($request) use ($c) {
				$calendarFactory = $c->query('CalendarFactory');

				$reader = new Calendar\Http\JSON\CalendarReader($request, $calendarFactory);
				$reader->getObject();
			};
		});

		$container->registerService('JSONSubscriptionReader', function(IAppContainer $c) {
			return function($request) use ($c) {
				$subscriptionFactory = $c->query('SubscriptionFactory');

				$reader = new Calendar\Http\JSON\SubscriptionReader($request, $subscriptionFactory);
				$reader->getObject();
			};
		});
	}

	/**
	 * initialize backend system
	 * @param IAppContainer $c
	 */
	public function initBackendSystem(IAppContainer $c) {
		$this->backends = new Calendar\Db\BackendCollection(
			function (Calendar\IBackendCollection $backends) use ($c) {
				$db = $this->getContainer()->getServer()->getDatabaseConnection();

				$timezones = $c->query('TimezoneMapper');
				$logger = $c->getServer()->getLogger();
				$factory = new Calendar\Db\CalendarFactory($backends, $timezones, $logger);

				return new Calendar\Cache\Calendar\Cache($backends, $db, $factory);
			},
			function (Calendar\IBackendCollection $backends) {
				$logger = $this->getContainer()->getServer()->getLogger();

				return new Calendar\Cache\Calendar\Scanner($backends, $logger);
			},
			function (Calendar\IBackendCollection $backends) {
				return new Calendar\Cache\Calendar\Updater($backends);
			},
			function (Calendar\IBackendCollection $backends) {
				return new Calendar\Cache\Calendar\Watcher($backends);
			}
		);

		$this->backendFactory = new Calendar\Db\BackendFactory(
			function(Calendar\ICalendar $calendar) use ($c) {
				$db = $c->getServer()->getDatabaseConnection();
				$factory = $c->query('ObjectFactory');

				return new Calendar\Cache\Object\Cache($db, $calendar, $factory);
			},
			function(Calendar\ICalendar $calendar) {
				return new Calendar\Cache\Object\Scanner($calendar);
			},
			function(Calendar\ICalendar $calendar) {
				return new Calendar\Cache\Object\Updater($calendar);
			},
			function(Calendar\ICalendar $calendar) {
				return new Calendar\Cache\Object\Watcher($calendar);
			}
		);
	}


	/**
	 * @param IAppContainer $c
	 */
	public function registerBackends(IAppContainer $c) {
		$l10n = $c->getServer()->getL10N($c->getAppName());

		// Local backend: Default database backend
		$this->backends->add(
			$this->backendFactory->createBackend(
				'org.ownCloud.local',
				function() use ($l10n) {
					return new Calendar\Backend\Local\Backend($l10n);
				},
				function(Calendar\IBackend $backend) use ($c) {
					$db = $c->getServer()->getDatabaseConnection();
					$factory = $c->query('CalendarFactory');

					return new Calendar\Backend\Local\Calendar($db, $backend, $factory);
				},
				function(Calendar\ICalendar $calendar) use ($c) {
					$db = $c->getServer()->getDatabaseConnection();
					$factory = $c->query('ObjectFactory');

					return new Calendar\Backend\Local\Object($db, $calendar, $factory);
				}
			)
		);

		// Contacts backend: show contact's birthdays and anniversaries
		if (class_exists('\\OCA\\Contacts\\App')) {
			$this->backends->add(
				$this->backendFactory->createBackend(
					'org.ownCloud.contact',
					function() use($c) {
						$contacts = new \OCA\Contacts\App();
						$appManager = $c->getServer()->getAppManager();

						return new Calendar\Backend\Contact\Backend($contacts, $appManager);
					},
					function(Calendar\IBackend $backend) use($c) {
						$contacts = new \OCA\Contacts\App();
						$l10n = $c->getServer()->getL10N('calendar');
						$calendarFactory = $c->query('CalendarFactory');

						return new Calendar\Backend\Contact\Calendar($contacts, $backend, $l10n, $calendarFactory);
					},
					function(Calendar\ICalendar $calendar) use($c) {
						$contacts = new \OCA\Contacts\App();
						$l10n = $c->getServer()->getL10N('calendar');
						$objectFactory = $c->query('ObjectFactory');

						return new Calendar\Backend\Contact\Object($contacts, $calendar, $l10n, $objectFactory);
					}
				)
			);
		}

		// Sharing backend: Enabling users to share calendars
		if (Share::isEnabled() && false) {
			$this->backends->add(
				$this->backendFactory->createBackend(
					'org.ownCloud.sharing',
					function () {
						return new Calendar\Backend\Sharing\Backend();
					},
					function (Calendar\IBackend $backend) {
						return new Calendar\Backend\Sharing\Calendar($backend);
					},
					function (Calendar\ICalendar $calendar) {
						return new Calendar\Backend\Sharing\Object($calendar);
					}
				)
			);
		}

		// Webcal Backend: Show ICS files on the net
		if (function_exists('curl_init')) {
			$this->backends->add(
				$this->backendFactory->createBackend(
					'org.ownCloud.webcal',
					function () use ($c, $l10n) {
						$subscriptions = $c->query('SubscriptionBusinessLayer');
						$cacheFactory = $c->getServer()->getMemCacheFactory();

						return new Calendar\Backend\WebCal\Backend($subscriptions, $l10n, $cacheFactory);
					},
					function (Calendar\IBackend $backend) use ($c, $l10n) {
						$subscriptions = $c->query('SubscriptionBusinessLayer');
						$cacheFactory = $c->getServer()->getMemCacheFactory();
						$calendarFactory = $c->query('CalendarFactory');

						return new Calendar\Backend\WebCal\Calendar($subscriptions, $l10n, $cacheFactory, $backend, $calendarFactory);
					},
					function (Calendar\ICalendar $calendar) use ($c, $l10n) {
						$subscriptions = $c->query('SubscriptionBusinessLayer');
						$cacheFactory = $c->getServer()->getMemCacheFactory();
						$objectFactory = $c->query('ObjectFactory');

						return new Calendar\Backend\WebCal\Object($subscriptions, $l10n, $cacheFactory, $calendar, $objectFactory);
					}
				)
			);
		}
	}


	/**
	 * add navigation entry
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


	/**
	 * register a cron job
	 */
	public function registerCron() {
		/*
		$c = $container;
		//$c->addRegularTask('OCA\Calendar\Backgroundjob\Task', 'run');
		*/
	}


	/**
	 * connect to hooks
	 */
	public function registerHooks() {
		//Calendar-internal hooks
		Util::connectHook('OCA\Calendar', 'postCreateObject',
			'\OCA\Calendar\Util\HookUtility', 'createObject');
		Util::connectHook('OCA\Calendar', 'postUpdateObject',
			'\OCA\Calendar\Util\HookUtility', 'updateObject');
		Util::connectHook('OCA\Calendar', 'postDeleteObject',
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


	/**
	 * register search and share provider
	 */
	public function registerProviders() {
		/* \OC_Search::registerProvider('\OCA\Calendar\SearchProvider'); */
		Share::registerBackend('calendar', '\OCA\Calendar\Share\Calendar');
		Share::registerBackend('event', '\OCA\Calendar\Share\Event');
	}
}
