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
namespace OCA\Calendar;

$this->create('calendar.settings.getView', '/v1/view')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setView', '/v1/view/{value}')->post()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'setValue');
});
$this->create('calendar.settings.getFirstDayOfWeek', '/v1/firstDay')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setFirstDayOfWeek', '/v1/firstDay/{value}')->post()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'setValue');
});
$this->create('calendar.settings.getTimeFormat', '/v1/timeFormat')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'getValue');
});
$this->create('calendar.settings.setTimeFormat', '/v1/timeFormat/{value}')->post()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SettingsController', 'setValue');
});

/* some additional calendar calls */
$this->create('calendar.calendar.export', '/v1/calendars/{calendarId}/export')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('ObjectController', 'export');
});
$this->create('calendar.calendar.import', '/v1/calendars/{calendarId}/import')->post()->action(function($params){
	$app = new Application($params);
	$app->dispatch('ObjectController', 'import');
});


/* some additional object calls */
$this->create('calendar.object.inPeriod', '/v1/calendars/{calendarId}/objects/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('ObjectController', 'indexInPeriod');
});
$this->create('calendar.event.inPeriod', '/v1/calendars/{calendarId}/events/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('EventController', 'indexInPeriod');
});
$this->create('calendar.journal.inPeriod', '/v1/calendars/{calendarId}/journals/inPeriod/{start}/{end}')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('JournalController', 'indexInPeriod');
});
$this->create('calendar.todo.inPeriod', '/v1/calendars/{calendarId}/objects/todos/{start}/{end}')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('TodoController', 'indexInPeriod');
});


/* some additional timezone calls */
$this->create('calendar.timezone.getList', '/v1/timezones-list')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('TimezoneController', 'getList');
});


/* make resources patchable */
$this->create('calendar.calendar.patch', '/v1/calendars/{id}')->patch()->action(function($params){
	$app = new Application($params);
	$app->dispatch('CalendarController', 'patch');
});
$this->create('calendar.subscription.patch', '/v1/subscriptions/{id}')->patch()->action(function($params){
	$app = new Application($params);
	$app->dispatch('SubscriptionController', 'patch');
});

$this->create('calendar.autocomplete.location', '/v1/autocompletion/location')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('ContactController', 'searchLocation');
});

$this->create('calendar.autocomplete.attendee', '/v1/autocompletion/attendee')->get()->action(function($params){
	$app = new Application($params);
	$app->dispatch('ContactController', 'searchAttendee');
});


$app = new Application();
$app->registerRoutes($this, [
	'routes' => [
		//Main view
		['name' => 'view#index', 'url' => '/', 'verb' => 'GET'],

		//Backends
		['name' => 'backend#index', 'url' => '/v1/backends', 'verb' => 'GET'],
	],
	'resources' => [
		'calendar' => ['url' => '/v1/calendars'],
		'object' => ['url' => '/v1/calendars/{calendarId}/objects'],
		'event' => ['url' => '/v1/calendars/{calendarId}/events'],
		'journal' => ['url' => '/v1/calendars/{calendarId}/journals'],
		'todo' => ['url' => '/v1/calendars/{calendarId}/todos'],
		'timezone' => ['url' => '/v1/timezones'],
		'subscription' => ['url' => '/v1/subscriptions'],
	]
]);