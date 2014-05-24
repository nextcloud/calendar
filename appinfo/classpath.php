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
\OC::$CLASSPATH['OCA\Calendar\App'] = 'calendar/lib/app.php';

/* backend classes */
\OC::$CLASSPATH['OCA\Calendar\Backend\IBackend'] = 'calendar/backend/ibackend.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\IFullyQualifiedBackend'] = 'calendar/backend/ifullyqualifiedbackend.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Backend'] = 'calendar/backend/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\CalDAV'] = 'calendar/backend/caldav.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Contact'] = 'calendar/backend/contact.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Local'] = 'calendar/backend/local.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\LocalStorage'] = 'calendar/backend/localstorage.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\Sharing'] = 'calendar/backend/sharing.php';
\OC::$CLASSPATH['OCA\Calendar\Backend\WebCal'] = 'calendar/backend/webcal.php';


/* background job class */
\OC::$CLASSPATH['OCA\Calendar\Backgroundjob\Task'] = 'calendar/backgroundjob/task.php';


/* businesslayer */
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\BusinessLayer'] = 'calendar/businesslayer/businesslayer.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\BackendBusinessLayer'] = 'calendar/businesslayer/backend.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\CalendarBusinessLayer'] = 'calendar/businesslayer/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\ObjectBusinessLayer'] = 'calendar/businesslayer/object.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\SubscriptionBusinessLayer'] = 'calendar/businesslayer/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\BusinessLayer\TimezoneBusinessLayer'] = 'calendar/businesslayer/timezone.php';

/* controller */
\OC::$CLASSPATH['OCA\Calendar\Controller\Controller'] = 'calendar/controller/controller.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\BackendController'] = 'calendar/controller/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\CalendarController'] = 'calendar/controller/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ObjectController'] = 'calendar/controller/object.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ObjectTypeController'] = 'calendar/controller/objecttype.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\EventController'] = 'calendar/controller/event.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\JournalController'] = 'calendar/controller/journal.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\TodoController'] = 'calendar/controller/todo.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\SettingsController'] = 'calendar/controller/settings.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\SubscriptionController'] = 'calendar/controller/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\TimezoneController'] = 'calendar/controller/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Controller\ViewController'] = 'calendar/controller/view.php';


/* entities */
\OC::$CLASSPATH['OCA\Calendar\Db\Entity'] = 'calendar/db/entity.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Backend'] = 'calendar/db/backend.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Calendar'] = 'calendar/db/calendar.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Object'] = 'calendar/db/object.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Subscription'] = 'calendar/db/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Timezone'] = 'calendar/db/timezone.php';

/* collections */
\OC::$CLASSPATH['OCA\Calendar\Db\Collection'] = 'calendar/db/collection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\BackendCollection'] = 'calendar/db/backendcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\CalendarCollection'] = 'calendar/db/calendarcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectCollection'] = 'calendar/db/objectcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\SubscriptionCollection'] = 'calendar/db/subscriptioncollection.php';
\OC::$CLASSPATH['OCA\Calendar\Db\TimezoneCollection'] = 'calendar/db/timezonecollection.php';

/* mapper */
\OC::$CLASSPATH['OCA\Calendar\Db\Mapper'] = 'calendar/db/mapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\BackendMapper'] = 'calendar/db/backendmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\CalendarMapper'] = 'calendar/db/calendarmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectMapper'] = 'calendar/db/objectmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\SubscriptionMapper'] = 'calendar/db/subscriptionmapper.php';
\OC::$CLASSPATH['OCA\Calendar\Db\TimezoneMapper'] = 'calendar/db/timezonemapper.php';

/* constants */
\OC::$CLASSPATH['OCA\Calendar\Db\ObjectType'] = 'calendar/db/objecttype.php';
\OC::$CLASSPATH['OCA\Calendar\Db\Permissions'] = 'calendar/db/permissions.php';


/* reader and serializer */
\OC::$CLASSPATH['OCA\Calendar\Http\IReader'] = 'calendar/http/ireader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ISerializer'] = 'calendar/http/iserializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Manager'] = 'calendar/http/manager.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Reader'] = 'calendar/http/reader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Serializer'] = 'calendar/http/serializer.php';
\OC::$CLASSPATH['OCA\Calendar\Http\Response'] = 'calendar/http/response.php';

/* ICS reader and serializer*/
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICS'] = 'calendar/http/ics/ics.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSCollection'] = 'calendar/http/ics/icscollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSReader'] = 'calendar/http/ics/icsreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObject'] = 'calendar/http/ics/object.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectCollection'] = 'calendar/http/ics/objectcollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSObjectReader'] = 'calendar/http/ics/objectreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezone'] = 'calendar/http/ics/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Http\ICS\ICSTimezoneCollection'] = 'calendar/http/ics/timzonecollection.php';

/* JSON reader and serializer */
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
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONSubscription'] = 'calendar/http/json/subscription.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONSubscriptionCollection'] = 'calendar/http/json/subscriptioncollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONSubscriptionReader'] = 'calendar/http/json/subscriptionreader.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezone'] = 'calendar/http/json/timezone.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezoneCollection'] = 'calendar/http/json/timezonecollection.php';
\OC::$CLASSPATH['OCA\Calendar\Http\JSON\JSONTimezoneReader'] = 'calendar/http/json/timezonereader.php';


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
\OC::$CLASSPATH['OCA\Calendar\Utility\JSONUtility'] = 'calendar/utility/json.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\ObjectUtility'] = 'calendar/utility/object.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\RegexUtility'] = 'calendar/utility/regex.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\SabreUtility'] = 'calendar/utility/sabre.php';
\OC::$CLASSPATH['OCA\Calendar\Utility\UpdateUtility'] = 'calendar/utility/update.php';


/* public classes */
\OC::$CLASSPATH['OCP\Calendar\APIException'] = 'calendar/public/.php';
\OC::$CLASSPATH['OCP\Calendar\BackendException'] = 'calendar/public/.php';
\OC::$CLASSPATH['OCP\Calendar\CacheOutDatedException'] = 'calendar/public/.php';
\OC::$CLASSPATH['OCP\Calendar\Calendar'] = 'calendar/public/calendar.php';
\OC::$CLASSPATH['OCP\Calendar\CorruptDataException'] = 'calendar/public/corruptdataexception.php';
\OC::$CLASSPATH['OCP\Calendar\DoesNotExistException'] = 'calendar/public/doesnotexistexception.php';
\OC::$CLASSPATH['OCP\Calendar\IBackend'] = 'calendar/public/ibackend.php';
\OC::$CLASSPATH['OCP\Calendar\IBackendCollection'] = 'calendar/public/ibackendcollection.php';
\OC::$CLASSPATH['OCP\Calendar\ICalendar'] = 'calendar/public/icalendar.php';
\OC::$CLASSPATH['OCP\Calendar\ICalendarCollection'] = 'calendar/public/icalendarcollection.php';
\OC::$CLASSPATH['OCP\Calendar\ICollection'] = 'calendar/public/icollection.php';
\OC::$CLASSPATH['OCP\Calendar\IEntity'] = 'calendar/public/ientity.php';
\OC::$CLASSPATH['OCP\Calendar\IObject'] = 'calendar/public/iobject.php';
\OC::$CLASSPATH['OCP\Calendar\IObjectCollection'] = 'calendar/public/iobjectcollection.php';
\OC::$CLASSPATH['OCP\Calendar\ISubscription'] = 'calendar/public/isubscription.php';
\OC::$CLASSPATH['OCP\Calendar\ISubscriptionCollection'] = 'calendar/public/isubscriptioncollection.php';
\OC::$CLASSPATH['OCP\Calendar\ITimezone'] = 'calendar/public/itimezone.php';
\OC::$CLASSPATH['OCP\Calendar\ITimezoneCollection'] = 'calendar/public/itimezonecollection.php';
\OC::$CLASSPATH['OCP\Calendar\MultipleObjectsReturnedException'] = 'calendar/public/multipleobjectsreturnedexception.php';
\OC::$CLASSPATH['OCP\Calendar\ObjectType'] = 'calendar/public/objecttype.php';
\OC::$CLASSPATH['OCP\Calendar\Permissions'] = 'calendar/public/permissions.php';