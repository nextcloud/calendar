<?php
/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @author Thomas Müller
 * @copyright 2016 Thomas Müller <thomas.mueller@tmit.eu>
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
		//Timezones
		['name' => 'view#get_timezone', 'url' => '/v1/timezones/{id}', 'verb' => 'GET'],
		['name' => 'view#get_timezone_with_region', 'url' => '/v1/timezones/{region}/{city}', 'verb' => 'GET'],
		['name' => 'view#get_timezone_with_subregion', 'url' => '/v1/timezones/{region}/{subregion}/{city}', 'verb' => 'GET'],
		//Settings
		['name' => 'settings#getView', 'url' => '/v1/view', 'verb' => 'GET'],
		['name' => 'settings#setView', 'url' => '/v1/view', 'verb' => 'POST'],
		//Autocompletion
		['name' => 'contact#searchAttendee', 'url' => '/v1/autocompletion/attendee', 'verb' => 'GET'],
		['name' => 'contact#searchLocation', 'url' => '/v1/autocompletion/location', 'verb' => 'GET'],
	]
];
