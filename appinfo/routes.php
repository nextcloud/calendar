<?php
/**
 * Copyright (c) 2014 Georg Ehrke
 * Copyright (c) 2014 Thomas Müller
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
use \OCA\Calendar;
//set up simple routes
$this->create('calendar.view.index', '/')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ViewController', 'index');
});

$this->create('calendar.settings.getView', '/getView')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'getView');
});

$this->create('calendar.settings.setView', '/setView/{view}')->get()->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('SettingsController', 'setView');
});

$this->create('calendar.calendars.forceUpdate', '/v1/calendars-forceUpdate')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('CalendarController', 'forceUpdate');
});

$this->create('calendar.object.indexInPeriod', '/v1/calendars/{calendarId}/objects/inPeriod/{start}/{end}')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('ObjectController', 'indexInPeriod');
});
$this->create('calendar.event.indexInPeriod', '/v1/calendars/{calendarId}/events/inPeriod/{start}/{end}')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('EventController', 'indexInPeriod');
});
$this->create('calendar.journal.indexInPeriod', '/v1/calendars/{calendarId}/journals/inPeriod/{start}/{end}')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('JournalController', 'indexInPeriod');
});
$this->create('calendar.todo.indexInPeriod', '/v1/calendars/{calendarId}/objects/todos/{start}/{end}')->action(function($params){
	$app = new \OCA\Calendar\App($params);
	$app->dispatch('TodoController', 'indexInPeriod');
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
	)
);

$a = new \OCA\Calendar\App();
$a->registerRoutes($this, $routes);