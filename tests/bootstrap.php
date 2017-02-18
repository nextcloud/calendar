<?php
/**
 * Calendar
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Alessandro Cosentino <cosenal@gmail.com>
 * @copyright Alessandro Cosentino 2016
 * @author Bernhard Posselt <dev@bernhard-posselt.com>
 * @copyright Bernhard Posselt 2016
 */
define('PHPUNIT_RUN', 1);

// ugly hack to fix issues with template code using static code
$_SERVER['REQUEST_URI'] = '/index.php/apps/calendar/';
$_SERVER['SCRIPT_NAME'] = '/index.php';

require_once __DIR__.'/../../../lib/base.php';

if (version_compare(implode('.', \OCP\Util::getVersion()), '8.2', '>=')) {
	\OC::$loader->addValidRoot(OC::$SERVERROOT . '/tests');
	\OC_App::loadApp('calendar');
}

if(!class_exists('PHPUnit_Framework_TestCase')) {
	require_once('PHPUnit/Autoload.php');
}

OC_Hook::clear();
