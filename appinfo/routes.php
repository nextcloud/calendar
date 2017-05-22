<?php
/**
 * Calendar App
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
		['name' => 'view#public_index_with_branding', 'url' => '/p/{token}', 'verb' => 'GET'],
		['name' => 'view#public_index_for_embedding', 'url' => '/embed/{token}', 'verb' => 'GET'],
		['name' => 'view#public_index_for_embedding_legacy', 'url' => '/public/{token}', 'verb' => 'GET'], // keep public/ for legacy reasons
		// Tools
		['name' => 'email#sendEmailPublicLink', 'url' => '/v1/public/sendmail', 'verb' => 'POST'],
		//Settings
		['name' => 'settings#getConfig', 'url' => '/v1/config', 'verb' => 'GET'],
		['name' => 'settings#setConfig', 'url' => '/v1/config', 'verb' => 'POST'],
		//Autocompletion
		['name' => 'contact#searchAttendee', 'url' => '/v1/autocompletion/attendee', 'verb' => 'GET'],
		['name' => 'contact#searchLocation', 'url' => '/v1/autocompletion/location', 'verb' => 'GET'],

		['name' => 'proxy#proxy', 'url' => '/v1/proxy', 'verb' => 'GET'],
	]
];
