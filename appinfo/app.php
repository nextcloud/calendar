<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */
namespace OCA\Calendar;

require_once(__DIR__ . '/../3rdparty/VObject/includes.php');

define('OCA\Calendar\JSON_API_VERSION', '1.0');
define('OCA\Calendar\PHP_API_VERSION', '1.0');

$app = new App();
$app->registerNavigation();

$app->registerCron();
$app->registerHooks();
$app->registerProviders();

/*\OCA\Calendar\Sabre\VObject\Component\VCalendar::$valueMap['DATE-TIME'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$valueMap['DATE'] = 'SabreProperty\DateTime';

\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['COMPLETED'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['DTEND'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['DUE'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['DTSTART'] = 'SabreProperty\DateTime';

\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['RECURRENCE-ID'] = 'SabreProperty\DateTime';

\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['CREATED'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['DTSTAMP'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['LAST-MODIFIED'] = 'SabreProperty\DateTime';
\OCA\Calendar\Sabre\VObject\Component\VCalendar::$propertyMap['ACKNOWLEDGED'] = 'SabreProperty\DateTime';*/