<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Müller
 * @copyright 2014 Thomas Müller <thomas.mueller@tmit.eu>
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
use \OCA\Calendar;

/* Main view */
$this->create('calendar.view.index', '/')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ViewController', 'index');
});


/* Backend API */
$this->create('calendar.backends.all', '/v1/backends')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('BackendController', 'index');
});
$this->create('calendar.backends.disabled', '/v1/backends-disabled')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('BackendController', 'disabled');
});
$this->create('calendar.backends.enabled', '/v1/backends-enabled')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('BackendController', 'enabled');
});
$this->create('calendar.backends.default', '/v1/backends-default')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('BackendController', 'defaultBackend');
});


/* Scan API */
$this->create('calendar.scan.calendar.all', '/v1/scan/calendars')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateAllCalendars');
});
$this->create('calendar.scan.calendar.byBackend', '/v1/scan/calendars/byBackend')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateCalendarsByBackend');
});
$this->create('calendar.scan.calendar.byPrivateUri', '/v1/scan/calendars/byPrivateUri/{backend}/{privateuri}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateCalendarByPrivateUri');
});
$this->create('calendar.scan.calendar.byPublicUri', '/v1/scan/calendars/byPublicUri/{publicuri}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateCalendarByPublicUri');
});
$this->create('calendar.scan.calendar.byCalendarId', '/v1/scan/calendars/byCalendarId/{calendarId}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateCalendarById');
});
$this->create('calendar.scan.calendar.mostOutDated', '/v1/scan/calendars/mostOutdated')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ScanController', 'updateMostOutdatedCalendars');
});


/* Settings API */
$this->create('calendar.settings.getView', '/v1/view')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setView', '/v1/view/{value}')->post()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'setValue');
});
$this->create('calendar.settings.getFirstDayOfWeek', '/v1/firstDay')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setFirstDayOfWeek', '/v1/firstDay/{value}')->post()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'setValue');
});
$this->create('calendar.settings.getTimeFormat', '/v1/timeFormat')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setTimeFormat', '/v1/timeFormat/{value}')->post()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'setValue');
});


/* some additional calendar calls */
$this->create('calendar.calendar.export', '/v1/calendars/{calendarId}/export')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ObjectController', 'export');
});
$this->create('calendar.calendar.import', '/v1/calendars/{calendarId}/import')->post()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ObjectController', 'import');
});


/* some additional object calls */
$this->create('calendar.object.inPeriod', '/v1/calendars/{calendarId}/objects/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ObjectController', 'indexInPeriod');
});
$this->create('calendar.event.inPeriod', '/v1/calendars/{calendarId}/events/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('EventController', 'indexInPeriod');
});
$this->create('calendar.journal.inPeriod', '/v1/calendars/{calendarId}/journals/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('JournalController', 'indexInPeriod');
});
$this->create('calendar.todo.inPeriod', '/v1/calendars/{calendarId}/objects/todos/{start}/{end}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('TodoController', 'indexInPeriod');
});


/* some additional timezone calls */
$this->create('calendar.timezone.getList', '/v1/timezones-list')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('TimezoneController', 'getList');
});


/* make resources patchable */
$this->create('calendar.calendar.patch', '/v1/calendars/{calendarId}')->patch()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('CalendarController', 'patch');
});
$this->create('calendar.subscription.patch', '/v1/subscriptions/{subscriptionId}')->patch()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SubscriptionController', 'patch');
});


//set up resources
$routes = array(
	'resources' => array(
		'calendar' => array('url' => '/v1/calendars'),
		'object' => array('url' => '/v1/calendars/{calendarId}/objects'),
		'event' => array('url' => '/v1/calendars/{calendarId}/events'),
		'journal' => array('url' => '/v1/calendars/{calendarId}/journals'),
		'todo' => array('url' => '/v1/calendars/{calendarId}/todos'),
		'timezone' => array('url' => '/v1/timezones'),
		'subscription' => array('url' => '/v1/subscriptions'),
	)
);


$a = new \OCA\Calendar\App();
$a->registerRoutes($this, $routes);