<?php

declare(strict_types=1);
/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @author Thomas Müller
 * @author Jonas Heinrich
 *
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2016 Thomas Müller <thomas.mueller@tmit.eu>
 * @copyright 2023 Jonas Heinrich <heinrich@synyx.net>
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
		// User views
		['name' => 'view#index', 'url' => '/', 'verb' => 'GET'],
		['name' => 'view#index', 'url' => '/new', 'verb' => 'GET', 'postfix' => 'direct.new'],
		['name' => 'view#index', 'url' => '/new/{isAllDay}/{dtStart}/{dtEnd}', 'verb' => 'GET', 'postfix' => 'direct.new.timerange'],
		['name' => 'view#index', 'url' => '/edit/{objectId}', 'verb' => 'GET', 'postfix' => 'direct.edit'],
		['name' => 'view#index', 'url' => '/edit/{objectId}/{recurrenceId}', 'verb' => 'GET', 'postfix' => 'direct.edit.recurrenceId'],
		['name' => 'view#index', 'url' => '/{view}/{timeRange}', 'verb' => 'GET', 'requirements' => ['view' => 'timeGridDay|timeGridWeek|dayGridMonth|multiMonthYear|listMonth'], 'postfix' => 'view.timerange'],
		['name' => 'view#index', 'url' => '/{view}/{timeRange}/new/{mode}/{isAllDay}/{dtStart}/{dtEnd}', 'verb' => 'GET', 'requirements' => ['view' => 'timeGridDay|timeGridWeek|dayGridMonth|multiMonthYear|listMonth'], 'postfix' => 'view.timerange.new'],
		['name' => 'view#index', 'url' => '/{view}/{timeRange}/edit/{mode}/{objectId}/{recurrenceId}', 'verb' => 'GET', 'requirements' => ['view' => 'timeGridDay|timeGridWeek|dayGridMonth|multiMonthYear|listMonth'], 'postfix' => 'view.timerange.edit'],
		['name' => 'view#getCalendarDotSvg', 'url' => '/public/getCalendarDotSvg/{color}.svg', 'verb' => 'GET'],
		// Appointments
		['name' => 'appointment#index', 'url' => '/appointments/{userId}', 'verb' => 'GET'],
		['name' => 'appointment#show', 'url' => '/appointment/{token}', 'verb' => 'GET'],
		['name' => 'booking#getBookableSlots', 'url' => '/appointment/{appointmentConfigId}/slots', 'verb' => 'GET'],
		['name' => 'booking#bookSlot', 'url' => '/appointment/{appointmentConfigId}/book', 'verb' => 'POST'],
		['name' => 'booking#confirmBooking', 'url' => '/appointment/confirm/{token}', 'verb' => 'GET'],
		// Public views
		['name' => 'publicView#public_index_with_branding', 'url' => '/p/{token}', 'verb' => 'GET'],
		['name' => 'publicView#public_index_with_branding', 'url' => '/p/{token}/{view}/{timeRange}', 'verb' => 'GET', 'postfix' => 'publicview.timerange'],
		['name' => 'publicView#public_index_with_branding', 'url' => '/p/{token}/{view}/{timeRange}/view/{mode}/{objectId}/{recurrenceId}', 'verb' => 'GET', 'postfix' => 'publicview.timerange.view'],
		['name' => 'publicView#public_index_with_branding', 'url' => '/p/{token}/{fancyName}', 'verb' => 'GET', 'postfix' => 'fancy.name'],
		['name' => 'publicView#public_index_for_embedding', 'url' => '/embed/{token}', 'verb' => 'GET'],
		['name' => 'publicView#public_index_for_embedding', 'url' => '/embed/{token}/{view}/{timeRange}', 'verb' => 'GET', 'postfix' => 'publicview.timerange.embed'],
		['name' => 'publicView#public_index_for_embedding', 'url' => '/embed/{token}/{view}/{timeRange}/view/{mode}/{objectId}/{recurrenceId}', 'verb' => 'GET', 'postfix' => 'publicview.timerange.view.embed'],
		['name' => 'publicView#public_index_for_embedding', 'url' => '/public/{token}', 'verb' => 'GET', 'postfix' => 'legacy'],
		// Autocompletion
		['name' => 'contact#searchAttendee', 'url' => '/v1/autocompletion/attendee', 'verb' => 'POST'],
		['name' => 'contact#searchLocation', 'url' => '/v1/autocompletion/location', 'verb' => 'POST'],
		['name' => 'contact#searchPhoto', 'url' => '/v1/autocompletion/photo', 'verb' => 'POST'],
		// Circles
		['name' => 'contact#getCircleMembers', 'url' => '/v1/circles/getmembers', 'verb' => 'GET'],
		// Settings
		['name' => 'settings#setConfig', 'url' => '/v1/config/{key}', 'verb' => 'POST'],
		// Tools
		['name' => 'email#sendEmailPublicLink', 'url' => '/v1/public/sendmail', 'verb' => 'POST'],
	],
	'resources' => [
		'appointmentConfig' => ['url' => '/v1/appointment_configs']
	]
];
