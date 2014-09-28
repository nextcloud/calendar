<?php

$installedVersion=OCP\Config::getAppValue('calendar', 'installed_version');
if (version_compare($installedVersion, '0.10.23', '<')) {
	$connection = OC_DB::getConnection();
	$sm = $connection->getSchemaManager();
	$prefix = OC_Config::getValue('dbtableprefix', 'oc_' );
	try {
		$table = $sm->listTableDetails($prefix.'clndr_calcache');
		$table->renameColumn('publicuri', 'public_uri');
		$table->renameColumn('privateuri', 'private_uri');
	} catch (Exception $e) {
		\OCP\Util::writeLog('calendar', 'preupdate: '.$e->getMessage(), \OCP\Util::ERROR);
	}
}