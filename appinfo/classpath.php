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

/* reader and serializer */
\OC::$CLASSPATH['OCA\Calendar\Http\IReader'] = 'calendar/http/ireader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ISerializer'] = 'calendar/http/iserializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Manager'] = 'calendar/http/manager.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Reader'] = 'calendar/http/reader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Serializer'] = 'calendar/http/serializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\TextDownloadResponse'] = 'calendar/http/textdownloadresponse.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Response'] = 'calendar/http/response.php';

/* ICS reader and serializer*/
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectResponse'] = 'calendar/http/ics/object.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectDownloadResponse'] = 'calendar/http/ics/objectdownload.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectReader'] = 'calendar/http/ics/objectreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezoneResponse'] = 'calendar/http/ics/timezone.php';

/* JSON reader and serializer */
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONBackendResponse'] = 'calendar/http/json/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCalendarResponse'] = 'calendar/http/json/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCalendarReader'] = 'calendar/http/json/calendarreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONObjectResponse'] = 'calendar/http/json/object.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONObjectReader'] = 'calendar/http/json/objectreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONSubscriptionResponse'] = 'calendar/http/json/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONSubscriptionReader'] = 'calendar/http/json/subscriptionreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezoneResponse'] = 'calendar/http/json/timezone.php';

\OC::$CLASSPATH['OCA\Calendar\Share\Calendar'] = 'calendar/sharing/calendarmanager.php';

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