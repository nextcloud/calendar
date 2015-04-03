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
return [
	'routes' => [
		//Main view
		['name' => 'view#index', 'url' => '/', 'verb' => 'GET'],
		//Backends
		['name' => 'backend#index', 'url' => '/v1/backends', 'verb' => 'GET'],
		//Calendar
		['name' => 'object#export', 'url' => '/v1/calendars/{calendarId}/export', 'verb' => 'GET'],
		['name' => 'object#import', 'url' => '/v1/calendars/{calendarId}/import', 'verb' => 'POST'],
		['name' => 'calendar#patch', 'url' => '/v1/calendars/{id}', 'verb' => 'PATCH'],
		//Objects
		['name' => 'object#indexInPeriod', 'url' => '/v1/calendars/{calendarId}/objects/inPeriod/{start}/{end}', 'verb' => 'GET'],
		['name' => 'event#indexInPeriod', 'url' => '/v1/calendars/{calendarId}/events/inPeriod/{start}/{end}', 'verb' => 'GET'],
		['name' => 'journal#indexInPeriod', 'url' => '/v1/calendars/{calendarId}/journals/inPeriod/{start}/{end}', 'verb' => 'GET'],
		['name' => 'todo#indexInPeriod', 'url' => '/v1/calendars/{calendarId}/todos/inPeriod/{start}/{end}', 'verb' => 'GET'],
		//Subscriptions
		['name' => 'subscription#patch', 'url' => '/v1/subscription/{id}', 'verb' => 'PATCH'],
		//Timezones
		['name' => 'timezone#show', 'url' => '/v1/timezones/{id}', 'verb' => 'GET'],
		['name' => 'timezone#getList', 'url' => '/v1/timezones-list', 'verb' => 'GET'],
		//Settings
		['name' => 'settings#getValue', 'url' => '/v1/view', 'verb' => 'GET'],
		['name' => 'settings#setValue', 'url' => '/v1/view/{value}', 'verb' => 'POST'],
		//Autocompletion
		['name' => 'contact#searchAttendee', 'url' => '/v1/autocompletion/attendee', 'verb' => 'GET'],
		['name' => 'contact#searchLocation', 'url' => '/v1/autocompletion/location', 'verb' => 'GET'],
	],
	'resources' => [
		'calendar' => ['url' => '/v1/calendars'],
		'object' => ['url' => '/v1/calendars/{calendarId}/objects'],
		'event' => ['url' => '/v1/calendars/{calendarId}/events'],
		'journal' => ['url' => '/v1/calendars/{calendarId}/journals'],
		'todo' => ['url' => '/v1/calendars/{calendarId}/todos'],
		'subscription' => ['url' => '/v1/subscriptions'],
	]
];
