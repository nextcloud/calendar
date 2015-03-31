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

/* app class */
\OC::$CLASSPATH['OCA\Calendar\Application'] = 'calendar/appinfo/application.php';

\OC::$CLASSPATH['OCA\Calendar\IBackendAPI'] = 'calendar/backend/ibackendapi.php';
\OC::$CLASSPATH['OCA\Calendar\ICalendarAPI'] = 'calendar/backend/icalendarapi.php';
\OC::$CLASSPATH['OCA\Calendar\IObjectAPI'] = 'calendar/backend/iobjectapi.php';

/* background job class */
\OC::$CLASSPATH['OCA\Calendar\Backgroundjob\Task'] = 'calendar/backgroundjob/task.php';


/* businesslayer */
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\BusinessLayer'] = 'calendar/businesslayer/businesslayer.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\BackendCollectionBusinessLayer'] = 'calendar/businesslayer/businesslayer_backend.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\CacheBusinessLayer'] = 'calendar/businesslayer/businesslayer_cache.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\CalendarRequestBusinessLayer'] = 'calendar/businesslayer/calendarrequest.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\ObjectBusinessLayer'] = 'calendar/businesslayer/object.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\ObjectRequestBusinessLayer'] = 'calendar/businesslayer/objectrequest.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer'] = 'calendar/businesslayer/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\TimezoneBusinessLayer'] = 'calendar/businesslayer/timezone.php';

/* controller */
\OC::$CLASSPATH['OCA\Calendar\Controller\Controller'] = 'calendar/controller/controller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\BackendController'] = 'calendar/controller/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\CalendarController'] = 'calendar/controller/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ContactController'] = 'calendar/controller/contact.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ObjectController'] = 'calendar/controller/object.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ScanController'] = 'calendar/controller/scan.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\SettingsController'] = 'calendar/controller/settings.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\SubscriptionController'] = 'calendar/controller/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\TimezoneController'] = 'calendar/controller/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ViewController'] = 'calendar/controller/view.php';

// some custom sabre classes
\OC::$CLASSPATH['OCA\CalendarManager\Sabre\Splitter\JCalendarManager'] = 'calendar/sabre/splitter/jcalsplitter.php';
/* CalDAV implementation */
//caldav implementation
/*\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';*/


/* utility classes */
\OC::$CLASSPATH['OCA\Calendar\Utility\Utility'] = 'calendar/utility/utility.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\BackendUtility'] = 'calendar/utility/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\CalendarUtility'] = 'calendar/utility/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\ColorUtility'] = 'calendar/utility/color.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\HookUtility'] = 'calendar/utility/hook.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\JSONUtility'] = 'calendar/utility/json.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\ObjectUtility'] = 'calendar/utility/object.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\RegexUtility'] = 'calendar/utility/regex.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\SabreUtility'] = 'calendar/utility/sabre.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\UpdateUtility'] = 'calendar/utility/update.php';