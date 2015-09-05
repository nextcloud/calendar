<?php
use \OCA\Calendar\Db\ObjectType;

$installedVersion=OCP\Config::getAppValue('calendar', 'installed_version');

if(version_compare($installedVersion, '0.9.8', '<=')) {
    //add backends:
    $backends = array(
					array (
						'backend' => 'local',
						'classname' => '\OCA\Calendar\Backend\Local',
						'arguments' => '',
						'enabled' => true,
					),/*
					array (
						'backend' => 'WebCal',
						'classname' => '\OCA\Calendar\Backend\WebCal',
						'arguments' => '',
						'enabled' => false
					),*/
					
				);
    \OCP\Config::setSystemValue('calendar_backends', $backends);

	//fix calendars:
	$users = \OCP\User::getUsers();
	foreach($users as $userId) {
		$userstimezone = OCP\Config::getUserValue($userId, 'calendar', 'timezone', date_default_timezone_get());
		$stmt = OCP\DB::prepare('UPDATE `*PREFIX*clndr_calendars` SET `timezone`=? WHERE `userid`=?');
		$stmt->execute(array($userstimezone, $userId));
		//how to delete config values ???	
	}

	//there was no way set which calendar supports what kind of component, so we can set all calendars to support all components.
	$stmtComponents = OCP\DB::prepare('UPDATE `*PREFIX*clndr_calendars` SET `components`=?');
	$stmtComponents->execute(array((string) ObjectType::ALL));
}