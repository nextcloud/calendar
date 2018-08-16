/**
 * Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

describe('CalendarService non-public', function () {
	'use strict';

	let CalendarService, DavClient, StringUtility, XMLUtility, CalendarFactory, WebCal, $q, $rootScope, davService, constants;
	let firstPropFindDeferred, secondPropFindDeferred, thirdPropFindDeferred;
	let firstRequestDeferred, secondRequestDeferred, thirdRequestDeferred;
	let updateSpy;

	const xmlCurrentUserPrincipal = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/</d:href>
  <d:propstat>
   <d:prop>
    <d:current-user-principal>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:current-user-principal>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const xmlCalendarHomeSet = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/principals/users/admin/</d:href>
  <d:propstat>
   <d:prop>
    <cal:calendar-home-set>
     <d:href>/remote.php/dav/calendars/admin/</d:href>
    </cal:calendar-home-set>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const xmlGetAll = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/private/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>Private</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
    <cal:calendar-description/>
    <cal:calendar-timezone>BEGIN:VCALENDAR&#13;
VERSION:2.0&#13;
PRODID:-//Apple Inc.//Mac OS X 10.11.6//EN&#13;
CALSCALE:GREGORIAN&#13;
BEGIN:VTIMEZONE&#13;
TZID:Europe/Berlin&#13;
BEGIN:DAYLIGHT&#13;
TZOFFSETFROM:+0100&#13;
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU&#13;
DTSTART:19810329T020000&#13;
TZNAME:GMT+2&#13;
TZOFFSETTO:+0200&#13;
END:DAYLIGHT&#13;
BEGIN:STANDARD&#13;
TZOFFSETFROM:+0200&#13;
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU&#13;
DTSTART:19961027T030000&#13;
TZNAME:GMT+1&#13;
TZOFFSETTO:+0100&#13;
END:STANDARD&#13;
END:VTIMEZONE&#13;
END:VCALENDAR&#13;
</cal:calendar-timezone>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">3</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#78e774</x1:calendar-color>
    <cal:supported-calendar-component-set>
     <cal:comp name="VEVENT"/>
     <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <cs:publish-url>
     <d:href>http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK</d:href>
    </cs:publish-url>
    <cs:allowed-sharing-modes>
     <cs:can-be-shared/>
     <cs:can-be-published/>
    </cs:allowed-sharing-modes>
    <oc:calendar-enabled>1</oc:calendar-enabled>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
    <oc:invite>
     <oc:user>
      <d:href>principal:principals/users/admin</d:href>
      <oc:common-name>John Doe</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read-write/>
      </oc:access>
     </oc:user>
    </oc:invite>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
  <d:response>
  <d:href>/remote.php/dav/calendars/admin/private2/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>Private2</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
    <cal:calendar-description/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">3</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#78e774</x1:calendar-color>
    <cal:supported-calendar-component-set>
     <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <cs:publish-url/>
    <cs:allowed-sharing-modes>
     <cs:can-be-shared/>
     <cs:can-be-published/>
    </cs:allowed-sharing-modes>
    <oc:calendar-enabled>1</oc:calendar-enabled>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
    <oc:invite>
     <oc:user>
      <d:href>principal:principals/users/admin</d:href>
      <oc:common-name>John Doe</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read-write/>
      </oc:access>
     </oc:user>
    </oc:invite>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <cal:calendar-timezone/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/inbox/</d:href>
  <d:propstat>
   <d:prop>
    <d:resourcetype>
     <d:collection/>
     <cal:schedule-inbox/>
    </d:resourcetype>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write-properties/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:unbind/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-read/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:unbind/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:authenticated/>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-deliver-invite/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:authenticated/>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-deliver-reply/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <d:displayname/>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
    <cal:supported-calendar-component-set/>
    <cs:publish-url/>
    <cs:allowed-sharing-modes/>
    <oc:calendar-enabled/>
    <oc:invite/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/outbox/</d:href>
  <d:propstat>
   <d:prop>
    <d:resourcetype>
     <d:collection/>
     <cal:schedule-outbox/>
    </d:resourcetype>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-query-freebusy/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-post-vevent/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-query-freebusy/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-post-vevent/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-read/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <d:displayname/>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/"/>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
    <cal:supported-calendar-component-set/>
    <cs:publish-url/>
    <cs:allowed-sharing-modes/>
    <oc:calendar-enabled/>
    <oc:invite/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/some-webcal-abo/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>Foobar</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cs:subscribed/>
    </d:resourcetype>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">2</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#e78074</x1:calendar-color>
    <cal:supported-calendar-component-set>
     <cal:comp name="VTODO"/>
     <cal:comp name="VEVENT"/>
    </cal:supported-calendar-component-set>
    <oc:calendar-enabled>1</oc:calendar-enabled>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-read/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
    <cs:source>
     <d:href>https://some-webcal-address.com/foo.ics</d:href>
    </cs:source>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <cs:publish-url/>
    <cs:allowed-sharing-modes/>
    <oc:invite/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const xmlGet = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/privat/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>Privat</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#78e774</x1:calendar-color>
    <cal:supported-calendar-component-set>
     <cal:comp name="VEVENT"/>
     <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <cs:allowed-sharing-modes>
     <cs:can-be-shared/>
     <cs:can-be-published/>
    </cs:allowed-sharing-modes>
    <oc:calendar-enabled>1</oc:calendar-enabled>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
    <oc:invite/>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <cs:publish-url/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	beforeEach(function() {
		davService = new dav.Client({
			xmlNamespaces: {
				'DAV:': 'd',
				'urn:ietf:params:xml:ns:caldav': 'c',
				'http://apple.com/ns/ical/': 'aapl',
				'http://owncloud.org/ns': 'oc',
				'http://nextcloud.com/ns': 'nc',
				'http://calendarserver.org/ns/': 'cs'
			}
		});
	});

	beforeEach(module('Calendar', function($provide) {
		DavClient = {};
		DavClient.NS_DAV = 'DAV:';
		DavClient.NS_IETF = 'urn:ietf:params:xml:ns:caldav';
		DavClient.NS_APPLE = 'http://apple.com/ns/ical/';
		DavClient.NS_OWNCLOUD = 'http://owncloud.org/ns';
		DavClient.NS_NEXTCLOUD = 'http://nextcloud.com/ns';
		DavClient.NS_CALENDARSERVER = 'http://calendarserver.org/ns/';
		DavClient.buildUrl = jasmine.createSpy();
		DavClient.request = jasmine.createSpy();
		DavClient.propFind = jasmine.createSpy();
		DavClient.getNodesFullName = jasmine.createSpy().and.callFake((node) => '{' + node.namespaceURI + '}' + node.localName);
		DavClient.wasRequestSuccessful = jasmine.createSpy();
		DavClient.getResponseCodeFromHTTPResponse = jasmine.createSpy();

		StringUtility = {};
		StringUtility.uri = jasmine.createSpy();

		XMLUtility = {};
		XMLUtility.getRootSkeleton = jasmine.createSpy();
		XMLUtility.serialize = jasmine.createSpy();

		updateSpy = jasmine.createSpy();
		CalendarFactory = {};
		CalendarFactory.calendar = jasmine.createSpy().and.callFake((a,b,p) => {
			if (b.href === '/remote.php/dav/calendars/admin/private/' || b.href === '/remote.php/dav/calendars/admin/privat/') {
				return {
					href: b.href,
					components: {
						vevent: true,
						vjournal: false,
						vtodo: true,
					},
					update: updateSpy.and.callFake(() => CalendarFactory.calendar(a,b,p))
				};
			} else if (b.href === '/remote.php/dav/calendars/admin/private2/') {
				return {
					href: b.href,
					components: {
						vevent: false,
						vjournal: false,
						vtodo: true,
					},
					update: updateSpy.and.callFake(() => CalendarFactory.calendar(a,b,p))
				};
			}
		});
		CalendarFactory.webcal = jasmine.createSpy().and.callFake((a,b,p) => {
			return {
				href: b.href,
				components: {
					vevent: true,
					vjournal: false,
					vtodo: true,
				},
				update: updateSpy.and.callFake(() => CalendarFactory.calendar(a,b,p))
			};
		});

		WebCal = {};
		WebCal.isWebCal = jasmine.createSpy();

		OC.requestToken = 'requestToken42';
		OC.linkToRemoteBase = jasmine.createSpy();

		$provide.value('DavClient', DavClient);
		$provide.value('StringUtility', StringUtility);
		$provide.value('XMLUtility', XMLUtility);
		$provide.value('CalendarFactory', CalendarFactory);
		$provide.value('WebCal', WebCal);
		$provide.value('isPublic', false);
		$provide.value('constants', {});
	}));

	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}

		OC.linkToRemoteBase.and.returnValue('remote-dav');
		DavClient.buildUrl.and.returnValues('fancy-url-1', 'fancy-url-2', 'fancy-url-3', 'fancy-url-4');
		StringUtility.uri.and.returnValues('uri-1', 'uri-2', 'uri-3', 'uri-4');

		firstPropFindDeferred = $q.defer();
		secondPropFindDeferred = $q.defer();
		thirdPropFindDeferred = $q.defer();

		firstRequestDeferred = $q.defer();
		secondRequestDeferred = $q.defer();
		thirdRequestDeferred = $q.defer();

		DavClient.propFind.and.returnValues(firstPropFindDeferred.promise, secondPropFindDeferred.promise, thirdPropFindDeferred.promise);
		DavClient.request.and.returnValues(firstRequestDeferred.promise, secondRequestDeferred.promise, thirdRequestDeferred.promise);
		DavClient.getResponseCodeFromHTTPResponse.and.returnValue(200);
	}));

	beforeEach(inject(function (_CalendarService_) {
		CalendarService = _CalendarService_;
	}));

	it('should initialize correctly with creating the service', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});

		expect(DavClient.buildUrl).toHaveBeenCalledWith('remote-dav');
		expect(DavClient.propFind).toHaveBeenCalledWith('fancy-url-1', ['{DAV:}current-user-principal'], 0, {requesttoken: 'requestToken42'});

		$rootScope.$apply();

		const calendarHomeSetProperties = davService.parseMultiStatus(xmlCalendarHomeSet);
		secondPropFindDeferred.resolve({
			body: calendarHomeSetProperties[0],
			status: 207
		});

		expect(DavClient.propFind).toHaveBeenCalledWith('/remote.php/dav/principals/users/admin/', ['{urn:ietf:params:xml:ns:caldav}calendar-home-set'], 0, {requesttoken: 'requestToken42'});

		$rootScope.$apply();

		// make sure all promises are resolved
		$rootScope.$apply();
		$rootScope.$apply();
	});

	it('should initialize correctly with creating the service - current-user-principal fails - non successful request', function() {
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 403
		});

		$rootScope.$apply();

		let called = false;
		CalendarService.getAll().then(() => fail('was not supposed to succeed')).catch((reason) => {
			called = true;
			expect(() => {throw reason;}).toThrowError(Error, 'current-user-principal could not be determined');
		});

		$rootScope.$apply();
		expect(called).toEqual(true);
	});

	it('should initialize correctly with creating the service - current-user-principal fails - empty propStat', function() {
		DavClient.wasRequestSuccessful.and.returnValues(true);

		firstPropFindDeferred.resolve({
			body: {
				propStat: []
			},
			status: 403
		});

		$rootScope.$apply();

		let called = false;
		CalendarService.getAll().then(() => fail('was not supposed to succeed')).catch((reason) => {
			called = true;
			expect(() => {throw reason;}).toThrowError(Error, 'current-user-principal could not be determined');
		});

		$rootScope.$apply();
		expect(called).toEqual(true);
	});

	it('should initialize correctly with creating the service - calendar-home-set fails  - non successful request', function() {
		DavClient.wasRequestSuccessful.and.returnValues(true, false);

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});

		const calendarHomeSetProperties = davService.parseMultiStatus(xmlCalendarHomeSet);
		secondPropFindDeferred.resolve({
			body: calendarHomeSetProperties[0],
			status: 403
		});

		$rootScope.$apply();

		let called = false;
		CalendarService.getAll().then(() => fail('was not supposed to succeed')).catch((reason) => {
			called = true;
			expect(() => {throw reason;}).toThrowError(Error, 'calendar-home-set could not be determind');
		});

		$rootScope.$apply();
		expect(called).toEqual(true);
	});

	it('should initialize correctly with creating the service - calendar-home-set fails - empty propStat', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});

		secondPropFindDeferred.resolve({
			body: {
				propStat: []
			},
			status: 403
		});


		$rootScope.$apply();

		let called = false;
		CalendarService.getAll().then(() => fail('was not supposed to succeed')).catch((reason) => {
			called = true;
			expect(() => {throw reason;}).toThrowError(Error, 'calendar-home-set could not be determind');
		});

		$rootScope.$apply();
		expect(called).toEqual(true);
	});

	it('should fetch all calendars', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		let called = false;
		let calendars = null;
		CalendarService.getAll().then(function(results) {
			called = true;
			calendars = results;
		}).catch(function() {
			fail('getAll() was supposed to succeed');
		});

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});
		$rootScope.$apply();

		const calendarHomeSetProperties = davService.parseMultiStatus(xmlCalendarHomeSet);
		secondPropFindDeferred.resolve({
			body: calendarHomeSetProperties[0],
			status: 207
		});

		$rootScope.$apply();

		const getAllCalendarProperty = davService.parseMultiStatus(xmlGetAll);
		thirdPropFindDeferred.resolve({
			body: getAllCalendarProperty,
			status: 207
		});

		$rootScope.$apply();

		expect(DavClient.propFind.calls.count()).toEqual(3);
		expect(DavClient.propFind.calls.argsFor(2)).toEqual(['fancy-url-2', [
			'{DAV:}displayname', '{DAV:}resourcetype', '{urn:ietf:params:xml:ns:caldav}calendar-description',
			'{urn:ietf:params:xml:ns:caldav}calendar-timezone', '{http://apple.com/ns/ical/}calendar-order',
			'{http://apple.com/ns/ical/}calendar-color', '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set',
			'{http://calendarserver.org/ns/}publish-url', '{http://calendarserver.org/ns/}allowed-sharing-modes',
			'{http://owncloud.org/ns}calendar-enabled', '{DAV:}acl', '{DAV:}owner', '{http://owncloud.org/ns}invite',
			'{http://calendarserver.org/ns/}source', '{http://nextcloud.com/ns}owner-displayname'], 1, {requesttoken: 'requestToken42'}]);

		$rootScope.$apply();

		expect(calendars).toEqual([
			{
				href: '/remote.php/dav/calendars/admin/private/',
				components: {vevent: true, vjournal: false, vtodo: true},
				update: updateSpy
			},
			{
				href: '/remote.php/dav/calendars/admin/some-webcal-abo/',
				components: {vevent: true, vjournal: false, vtodo: true},
				update: updateSpy
			}
		]);
		expect(called).toEqual(true);

		expect(CalendarFactory.calendar.calls.count()).toEqual(2);
		expect(CalendarFactory.calendar.calls.argsFor(0).length).toEqual(3);
		expect(CalendarFactory.calendar.calls.argsFor(0)[0]).toEqual(CalendarService.privateAPI);
		expect(CalendarFactory.calendar.calls.argsFor(0)[1]).toEqual(getAllCalendarProperty[0]);
		expect(CalendarFactory.calendar.calls.argsFor(0)[2]).toEqual('/remote.php/dav/principals/users/admin/');
		expect(CalendarFactory.calendar.calls.argsFor(1).length).toEqual(3);
		expect(CalendarFactory.calendar.calls.argsFor(1)[0]).toEqual(CalendarService.privateAPI);
		expect(CalendarFactory.calendar.calls.argsFor(1)[1]).toEqual(getAllCalendarProperty[1]);
		expect(CalendarFactory.calendar.calls.argsFor(1)[2]).toEqual('/remote.php/dav/principals/users/admin/');

		expect(CalendarFactory.webcal.calls.count()).toEqual(1);
		expect(CalendarFactory.webcal.calls.argsFor(0).length).toEqual(3);
		expect(CalendarFactory.webcal.calls.argsFor(0)[0]).toEqual(CalendarService.privateAPI);
		expect(CalendarFactory.webcal.calls.argsFor(0)[1]).toEqual(getAllCalendarProperty[4]);
		expect(CalendarFactory.webcal.calls.argsFor(0)[2]).toEqual('/remote.php/dav/principals/users/admin/');

		expect(DavClient.propFind.calls.count()).toEqual(3);
		expect(DavClient.propFind.calls.argsFor(2)).toEqual(['fancy-url-2', [
			'{DAV:}displayname', '{DAV:}resourcetype', '{urn:ietf:params:xml:ns:caldav}calendar-description',
			'{urn:ietf:params:xml:ns:caldav}calendar-timezone', '{http://apple.com/ns/ical/}calendar-order',
			'{http://apple.com/ns/ical/}calendar-color', '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set',
			'{http://calendarserver.org/ns/}publish-url', '{http://calendarserver.org/ns/}allowed-sharing-modes',
			'{http://owncloud.org/ns}calendar-enabled', '{DAV:}acl', '{DAV:}owner', '{http://owncloud.org/ns}invite',
			'{http://calendarserver.org/ns/}source', '{http://nextcloud.com/ns}owner-displayname'],
			1, {requesttoken: 'requestToken42'}]);
	});

	it('should fetch one calendar', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		let called = false;
		let calendar;
		CalendarService.get('some-fancy-calendar-url-parameter').then(function(results) {
			called = true;
			calendar = results;
		}).catch(function() {
			fail('get() was supposed to succeed');
		});

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});
		$rootScope.$apply();

		const calendarHomeSetProperties = davService.parseMultiStatus(xmlCalendarHomeSet);
		secondPropFindDeferred.resolve({
			body: calendarHomeSetProperties[0],
			status: 207
		});

		$rootScope.$apply();

		const getCalendarProperty = davService.parseMultiStatus(xmlGet);
		thirdPropFindDeferred.resolve({
			body: getCalendarProperty[0],
			status: 207
		});

		$rootScope.$apply();

		expect(CalendarFactory.calendar.calls.count()).toEqual(1);
		expect(CalendarFactory.calendar.calls.argsFor(0).length).toEqual(3);
		expect(CalendarFactory.calendar.calls.argsFor(0)[0]).toEqual(CalendarService.privateAPI);
		expect(CalendarFactory.calendar.calls.argsFor(0)[1]).toEqual(getCalendarProperty[0]);
		expect(CalendarFactory.calendar.calls.argsFor(0)[2]).toEqual('/remote.php/dav/principals/users/admin/');

		expect(calendar).toEqual({
			href: '/remote.php/dav/calendars/admin/privat/',
			components: {vevent: true, vjournal: false, vtodo: true},
			update: updateSpy
		});

		expect(DavClient.propFind.calls.count()).toEqual(3);
		expect(DavClient.propFind.calls.argsFor(2)).toEqual(['fancy-url-2', [
			'{DAV:}displayname', '{DAV:}resourcetype', '{urn:ietf:params:xml:ns:caldav}calendar-description',
			'{urn:ietf:params:xml:ns:caldav}calendar-timezone', '{http://apple.com/ns/ical/}calendar-order',
			'{http://apple.com/ns/ical/}calendar-color', '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set',
			'{http://calendarserver.org/ns/}publish-url', '{http://calendarserver.org/ns/}allowed-sharing-modes',
			'{http://owncloud.org/ns}calendar-enabled', '{DAV:}acl', '{DAV:}owner', '{http://owncloud.org/ns}invite',
			'{http://calendarserver.org/ns/}source', '{http://nextcloud.com/ns}owner-displayname'],
			0, {requesttoken: 'requestToken42'}]);
	});

	it('should create a calendar', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		let called = false;
		let calendar = null;
		CalendarService.create('name-foobar-1337', '#eeeeee', ['vevent', 'vjournal', 'vtodo']).then(function(result) {
			called = true;
			calendar = result;
		}).catch(function() {
			fail('create() was supposed to succeed');
		});

		const userPrincipalProperties = davService.parseMultiStatus(xmlCurrentUserPrincipal);
		firstPropFindDeferred.resolve({
			body: userPrincipalProperties[0],
			status: 207
		});
		$rootScope.$apply();

		const calendarHomeSetProperties = davService.parseMultiStatus(xmlCalendarHomeSet);
		secondPropFindDeferred.resolve({
			body: calendarHomeSetProperties[0],
			status: 207
		});

		$rootScope.$apply();

		expect(dPropChildren).toEqual([{
			name: ['DAV:', 'd:resourcetype'],
			children: [{
				name: ['DAV:', 'd:collection']
			}, {
				name: ['urn:ietf:params:xml:ns:caldav', 'c:calendar']
			}]
		},{
			name: ['DAV:', 'd:displayname'],
			value: 'name-foobar-1337'
		},{
			name: ['http://apple.com/ns/ical/', 'a:calendar-color'],
			value: '#eeeeee'
		},{
			name: ['http://owncloud.org/ns', 'o:calendar-enabled'],
			value: '1'
		},{
			name: ['urn:ietf:params:xml:ns:caldav', 'c:supported-calendar-component-set'],
			children: [{
				name: ['urn:ietf:params:xml:ns:caldav', 'c:comp'],
				attributes: [
					['name', 'VEVENT']
				]
			}, {
				name: ['urn:ietf:params:xml:ns:caldav', 'c:comp'],
				attributes: [
					['name', 'VJOURNAL']
				]
			}, {
				name: ['urn:ietf:params:xml:ns:caldav', 'c:comp'],
				attributes: [
					['name', 'VTODO']
				]
			}]
		}
		]);

		firstRequestDeferred.resolve({
			status: 201
		});

		$rootScope.$apply();

		const getCalendarProperty = davService.parseMultiStatus(xmlGet);
		thirdPropFindDeferred.resolve({
			body: getCalendarProperty[0],
			status: 207
		});

		$rootScope.$apply();

		expect(CalendarFactory.calendar.calls.count()).toEqual(1);
		expect(CalendarFactory.calendar.calls.argsFor(0).length).toEqual(3);
		expect(CalendarFactory.calendar.calls.argsFor(0)[0]).toEqual(CalendarService.privateAPI);
		expect(CalendarFactory.calendar.calls.argsFor(0)[1]).toEqual(getCalendarProperty[0]);
		expect(CalendarFactory.calendar.calls.argsFor(0)[2]).toEqual('/remote.php/dav/principals/users/admin/');

		expect(calendar).toEqual({
			href: '/remote.php/dav/calendars/admin/privat/',
			components: {vevent: true, vjournal: false, vtodo: true},
			update: updateSpy
		});

		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'MKCOL', '/remote.php/dav/calendars/admin/uri-1/',
			{
				'Content-Type': 'application/xml; charset=utf-8',
				'requesttoken': 'requestToken42'
			},
			'xmlPayload1337'
		]);

		expect(DavClient.propFind.calls.count()).toEqual(3);
		expect(DavClient.propFind.calls.argsFor(2)).toEqual(['fancy-url-2', [
			'{DAV:}displayname', '{DAV:}resourcetype', '{urn:ietf:params:xml:ns:caldav}calendar-description',
			'{urn:ietf:params:xml:ns:caldav}calendar-timezone', '{http://apple.com/ns/ical/}calendar-order',
			'{http://apple.com/ns/ical/}calendar-color', '{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set',
			'{http://calendarserver.org/ns/}publish-url', '{http://calendarserver.org/ns/}allowed-sharing-modes',
			'{http://owncloud.org/ns}calendar-enabled', '{DAV:}acl', '{DAV:}owner', '{http://owncloud.org/ns}invite',
			'{http://calendarserver.org/ns/}source', '{http://nextcloud.com/ns}owner-displayname'],
			0, {requesttoken: 'requestToken42'}]);

		expect(called).toEqual(true);

		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith(['DAV:', 'd:mkcol'], ['DAV:', 'd:set'], ['DAV:', 'd:prop']);
	});

	it('should create a webcal subscription', function() {
		// TODO
	});

	it('should update a calendar', function() {
		// TODO
	});

	it('should delete a calendar', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);
		firstPropFindDeferred.reject();

		let called = false;
		CalendarService.privateAPI.delete({url: 'fancy-calendar-url'}).then(function() {
			called = true;
		}).catch(function() {
			fail('delete() was supposed to succeed');
		});

		firstRequestDeferred.resolve({
			status: 201
		});

		$rootScope.$apply();

		expect(called).toEqual(true);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'DELETE', 'fancy-calendar-url', { requesttoken: 'requestToken42' }]);
	});

	it('should delete a webcal subscription', function() {
		// TODO
	});

	it('should share a calendar', function() {
		// TODO
	});

	it('should update a share of a calendar', function() {
		// TODO
	});

	it('should unshare a calendar', function() {
		// TODO
	});

	it('should publish a calendar', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		let called = false;
		let result = null;
		CalendarService.privateAPI.publish({url: 'fancy-calendar-url'}).then(function(res) {
			called = true;
			result = res;
		});

		firstRequestDeferred.resolve({
			status: 204
		});

		$rootScope.$apply();

		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'POST', 'fancy-calendar-url',{
				'Content-Type': 'application/xml; charset=utf-8',
				'requesttoken': 'requestToken42'
			}, 'xmlPayload1337']);

		expect(called).toEqual(true);
		expect(result).toEqual(true);
		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith(['http://calendarserver.org/ns/', 'cs:publish-calendar']);
	});

	it('should publish a calendar - unsuccessful', function() {
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		let called = false;
		let result = null;
		CalendarService.privateAPI.publish({url: 'fancy-calendar-url'}).then(function(res) {
			called = true;
			result = res;
		});

		firstRequestDeferred.resolve({
			status: 204
		});

		$rootScope.$apply();

		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'POST', 'fancy-calendar-url',{
				'Content-Type': 'application/xml; charset=utf-8',
				'requesttoken': 'requestToken42'
			}, 'xmlPayload1337']);

		expect(called).toEqual(true);
		expect(result).toEqual(false);
		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith(['http://calendarserver.org/ns/', 'cs:publish-calendar']);
	});

	it('should unpublish a calendar', function() {
		DavClient.wasRequestSuccessful.and.returnValue(true);

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		let called = false;
		let result = null;
		CalendarService.privateAPI.unpublish({url: 'fancy-calendar-url'}).then(function(res) {
			called = true;
			result = res;
		});

		firstRequestDeferred.resolve({
			status: 204
		});

		$rootScope.$apply();

		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'POST', 'fancy-calendar-url',{
				'Content-Type': 'application/xml; charset=utf-8',
				'requesttoken': 'requestToken42'
			}, 'xmlPayload1337']);

		expect(called).toEqual(true);
		expect(result).toEqual(true);
		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith(['http://calendarserver.org/ns/', 'cs:unpublish-calendar']);
	});

	it('should unpublish a calendar - unsuccessful', function() {
		DavClient.wasRequestSuccessful.and.returnValue(false);

		const skeleton=[], dPropChildren=[];
		XMLUtility.getRootSkeleton.and.returnValue([skeleton, dPropChildren]);
		XMLUtility.serialize.and.returnValue('xmlPayload1337');

		let called = false;
		let result = null;
		CalendarService.privateAPI.unpublish({url: 'fancy-calendar-url'}).then(function(res) {
			called = true;
			result = res;
		});

		firstRequestDeferred.resolve({
			status: 204
		});

		$rootScope.$apply();

		expect(XMLUtility.serialize).toHaveBeenCalledWith(skeleton);

		expect(DavClient.request.calls.count()).toEqual(1);
		expect(DavClient.request.calls.argsFor(0)).toEqual([
			'POST', 'fancy-calendar-url',{
				'Content-Type': 'application/xml; charset=utf-8',
				'requesttoken': 'requestToken42'
			}, 'xmlPayload1337']);

		expect(called).toEqual(true);
		expect(result).toEqual(false);
		expect(XMLUtility.getRootSkeleton).toHaveBeenCalledWith(['http://calendarserver.org/ns/', 'cs:unpublish-calendar']);
	});
});

describe('CalendarService - public', function() {
	'use strict';

	let CalendarService, DavClient, StringUtility, XMLUtility, CalendarFactory, WebCal, $q, $rootScope, davService, constants;
	let firstPropFindDeferred, secondPropFindDeferred, thirdPropFindDeferred;
	let firstRequestDeferred, secondRequestDeferred, thirdRequestDeferred;

	const xmlGetPublic = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/public-calendars/KCMY4V5JZ22ODGFW/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>Personal (admin)</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
    <cal:supported-calendar-component-set>
     <cal:comp name="VEVENT"/>
     <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <cs:publish-url>
     <d:href>http://nextcloud.dev/remote.php/dav/public-calendars/KCMY4V5JZ22ODGFW</d:href>
    </cs:publish-url>
    <cs:allowed-sharing-modes>
     <cs:can-be-shared/>
     <cs:can-be-published/>
    </cs:allowed-sharing-modes>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/system/public/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
    <oc:invite>
     <oc:user>
      <d:href>principal:principals/users/admin</d:href>
      <oc:common-name>admin</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read-write/>
      </oc:access>
     </oc:user>
    </oc:invite>
   </d:prop>
   <d:status>HTTP/1.1 200 OK</d:status>
  </d:propstat>
  <d:propstat>
   <d:prop>
    <oc:calendar-enabled/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	beforeEach(function() {
		davService = new dav.Client({
			xmlNamespaces: {
				'DAV:': 'd',
				'urn:ietf:params:xml:ns:caldav': 'c',
				'http://apple.com/ns/ical/': 'aapl',
				'http://owncloud.org/ns': 'oc',
				'http://nextcloud.com/ns': 'nc',
				'http://calendarserver.org/ns/': 'cs'
			}
		});
	});

	beforeEach(module('Calendar', function($provide) {
		DavClient = {};
		DavClient.NS_DAV = 'DAV:';
		DavClient.NS_IETF = 'urn:ietf:params:xml:ns:caldav';
		DavClient.NS_APPLE = 'http://apple.com/ns/ical/';
		DavClient.NS_OWNCLOUD = 'http://owncloud.org/ns';
		DavClient.NS_NEXTCLOUD = 'http://nextcloud.com/ns';
		DavClient.NS_CALENDARSERVER = 'http://calendarserver.org/ns/';
		DavClient.buildUrl = jasmine.createSpy();
		DavClient.request = jasmine.createSpy();
		DavClient.propFind = jasmine.createSpy();
		DavClient.getNodesFullName = jasmine.createSpy().and.callFake((node) => '{' + node.namespaceURI + '}' + node.localName);
		DavClient.wasRequestSuccessful = jasmine.createSpy();
		DavClient.getResponseCodeFromHTTPResponse = jasmine.createSpy();

		StringUtility = {};
		StringUtility.uri = jasmine.createSpy();

		XMLUtility = {};
		XMLUtility.getRootSkeleton = jasmine.createSpy();
		XMLUtility.serialize = jasmine.createSpy();

		CalendarFactory = {};
		CalendarFactory.calendar = jasmine.createSpy().and.callFake(() => {return {components: {vevent: true}};});
		CalendarFactory.webcal = jasmine.createSpy().and.callFake(() => {return {components: {vevent: true}};});

		WebCal = {};
		WebCal.isWebCal = jasmine.createSpy();

		OC.requestToken = 'requestToken42';
		OC.linkToRemoteBase = jasmine.createSpy();

		$provide.value('DavClient', DavClient);
		$provide.value('StringUtility', StringUtility);
		$provide.value('XMLUtility', XMLUtility);
		$provide.value('CalendarFactory', CalendarFactory);
		$provide.value('WebCal', WebCal);
		$provide.value('isPublic', true);
		$provide.value('constants', {});
	}));

	beforeEach(inject(function (_$q_, _$rootScope_) {
		$q = _$q_;
		$rootScope = _$rootScope_;

		// mixing ES6 Promises and $q ain't no good
		// ES6 Promises will be replaced with $q for the unit tests
		if (window.Promise !== $q) {
			window.Promise = $q;
		}

		OC.linkToRemoteBase.and.returnValue('remote-dav');
		DavClient.buildUrl.and.returnValues('fancy-url-1', 'fancy-url-2', 'fancy-url-3', 'fancy-url-4');

		firstPropFindDeferred = $q.defer();
		secondPropFindDeferred = $q.defer();
		thirdPropFindDeferred = $q.defer();

		firstRequestDeferred = $q.defer();
		secondRequestDeferred = $q.defer();
		thirdRequestDeferred = $q.defer();

		DavClient.propFind.and.returnValues(firstPropFindDeferred.promise, secondPropFindDeferred.promise, thirdPropFindDeferred.promise);
		DavClient.request.and.returnValues(firstRequestDeferred.promise, secondRequestDeferred.promise, thirdRequestDeferred.promise);
		DavClient.getResponseCodeFromHTTPResponse.and.returnValue(200);
	}));

	beforeEach(inject(function (_CalendarService_) {
		CalendarService = _CalendarService_;
	}));

	it('should fetch a public calendar by it\'s token', function() {
		// TODO
	});
});
