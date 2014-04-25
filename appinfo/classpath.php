<?php
/**
 * Copyright (c) 2014 Georg Ehrke <oc.list@georgehrke.com>
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

\OC::$CLASSPATH['OCA\Calendar\App'] = 'calendar/lib/app.php';

\OC::$CLASSPATH['OCA\Calendar\Backend\Anniversary'] = 'calendar/backend/anniversary.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Backend'] = 'calendar/backend/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Birthday'] = 'calendar/backend/birthday.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\CalDAV'] = 'calendar/backend/caldav.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\IBackend'] = 'calendar/backend/ibackend.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Local'] = 'calendar/backend/local.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\LocalStorage'] = 'calendar/backend/localstorage.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Sharing'] = 'calendar/backend/sharing.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\WebCal'] = 'calendar/backend/webcal.php';

\OC::$CLASSPATH['OCA\Calendar\Backgroundjob\Task'] = 'calendar/backgroundjob/task.php';

\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\BusinessLayer'] = 'calendar/businesslayer/businesslayer.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\CalendarBusinessLayer'] = 'calendar/businesslayer/calendarbusinesslayer.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\ObjectBusinessLayer'] = 'calendar/businesslayer/objectbusinesslayer.php';

\OC::$CLASSPATH['OCA\Calendar\Controller\Controller'] = 'calendar/controller/controller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\CalendarController'] = 'calendar/controller/calendarcontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ObjectController'] = 'calendar/controller/objectcontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ObjectTypeController'] = 'calendar/controller/objecttypecontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\EventController'] = 'calendar/controller/eventcontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\JournalController'] = 'calendar/controller/journalcontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\TodoController'] = 'calendar/controller/todocontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\SettingsController'] = 'calendar/controller/settingscontroller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ViewController'] = 'calendar/controller/viewcontroller.php';

\OC::$CLASSPATH['OCA\Calendar\Db\Entity'] = 'calendar/db/entity.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Collection'] = 'calendar/db/collection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Mapper'] = 'calendar/db/mapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Backend'] = 'calendar/db/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Db\BackendCollection'] = 'calendar/db/backendcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\BackendMapper'] = 'calendar/db/backendmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Calendar'] = 'calendar/db/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Db\CalendarCollection'] = 'calendar/db/calendarcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\CalendarMapper'] = 'calendar/db/calendarmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Object'] = 'calendar/db/object.php';
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectCollection'] = 'calendar/db/objectcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectMapper'] = 'calendar/db/objectmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Timezone'] = 'calendar/db/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Db\TimezoneCollection'] = 'calendar/db/timezonecollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectType'] = 'calendar/db/objecttype.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Permissions'] = 'calendar/db/permissions.php';

\OC::$CLASSPATH['OCA\Calendar\Http\IReader'] = 'calendar/http/ireader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ISerializer'] = 'calendar/http/iserializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Manager'] = 'calendar/http/manager.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Reader'] = 'calendar/http/reader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Serializer'] = 'calendar/http/serializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Response'] = 'calendar/http/response.php';

\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICS'] = 'calendar/http/ics/ics.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSCollection'] = 'calendar/http/ics/icscollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSReader'] = 'calendar/http/ics/icsreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSCalendar'] = 'calendar/http/ics/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSCalendarCollection'] = 'calendar/http/ics/calendarcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSCalendarReader'] = 'calendar/http/ics/calendarreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObject'] = 'calendar/http/ics/object.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectCollection'] = 'calendar/http/ics/objectcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectReader'] = 'calendar/http/ics/objectreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezone'] = 'calendar/http/ics/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezoneCollection'] = 'calendar/http/ics/timzonecollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezoneReader'] = 'calendar/http/ics/timezonereader.php';

\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSON'] = 'calendar/http/json/json.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCollection'] = 'calendar/http/json/jsoncollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONReader'] = 'calendar/http/json/jsonreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONBackend'] = 'calendar/http/json/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONBackendCollection'] = 'calendar/http/json/backendcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCalendar'] = 'calendar/http/json/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCalendarCollection'] = 'calendar/http/json/calendarcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONCalendarReader'] = 'calendar/http/json/calendarreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONObject'] = 'calendar/http/json/object.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONObjectCollection'] = 'calendar/http/json/objectcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONObjectReader'] = 'calendar/http/json/objectreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezone'] = 'calendar/http/json/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezoneCollection'] = 'calendar/http/json/timezonecollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezoneReader'] = 'calendar/http/json/timezonereader.php';

\OC::$CLASSPATH['OCA\Calendar\SabreProperty\DateTime'] = 'calendar/sabre/property/datetime.php';

//caldav implementation
/*\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';
\OC::$CLASSPATH['OCA\Calendar\Sabre'] = '';*/

\OC::$CLASSPATH['OCA\Calendar\Utility\Utility'] = 'calendar/utility/utility.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\BackendUtility'] = 'calendar/utility/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\CalendarUtility'] = 'calendar/utility/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\JSONUtility'] = 'calendar/utility/json.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\ObjectUtility'] = 'calendar/utility/object.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\SabreUtility'] = 'calendar/utility/sabre.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\UpdateUtility'] = 'calendar/utility/update.php';