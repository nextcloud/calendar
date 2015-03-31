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