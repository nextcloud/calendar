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
$installedVersion=OCP\Config::getAppValue('calendar', 'installed_version');

if(version_compare($installedVersion, '0.9.8', '<=')) {
	//fix calendars:
	$users = \OCP\User::getUsers();
	foreach($users as $userId) {
		$userstimezone = OCP\Config::getUserValue($userId, 'calendar', 'timezone', date_default_timezone_get());
		$stmt = OCP\DB::prepare('UPDATE `*PREFIX*clndr_calendars` SET `timezone`=? WHERE `userid`=?');
		$stmt->execute(array($userstimezone, $userId));
		//how to delete config values ???	
	}

}