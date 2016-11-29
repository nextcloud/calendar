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

describe('CalendarFactory', function () {
	'use strict';

	let CalendarFactory;
	let $window, DavClient, Calendar, WebCal;
	let davService, attrSpy, ngElementSpy;
	let privateCalendarServiceAPI;

	const calendar_default = `<?xml version="1.0"?>
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

	const calendar_nocolor = `<?xml version="1.0"?>
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
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/"/>
    <cs:publish-url/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const calendar_noenabled = `<?xml version="1.0"?>
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
    <oc:calendar-enabled/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const calendar_published = `<?xml version="1.0"?>
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
    <cs:publish-url>
     <d:href>http://nextcloud.dev/remote.php/dav/public-calendars/NW1DRAC4J4UDCH4M</d:href>
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
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const calendar_shared = `<?xml version="1.0"?>
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
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/groups/test/</d:href>
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
       <d:href>/remote.php/dav/principals/groups/test/</d:href>
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
       <d:href>/remote.php/dav/principals/users/user1/</d:href>
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
       <d:href>/remote.php/dav/principals/users/user1/</d:href>
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
       <d:href>/remote.php/dav/principals/users/user2/</d:href>
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
       <d:href>/remote.php/dav/principals/users/user2/</d:href>
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
      <d:href>principal:principals/groups/test</d:href>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read/>
      </oc:access>
     </oc:user>
     <oc:user>
      <d:href>principal:principals/users/user1</d:href>
      <oc:common-name>User 1</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read/>
      </oc:access>
     </oc:user>
     <oc:user>
      <d:href>principal:principals/users/user2</d:href>
      <oc:common-name>User 2</oc:common-name>
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
    <cs:publish-url/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const calendar_vevent_vjournal = `<?xml version="1.0"?>
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
     <cal:comp name="VJOURNAL"/>
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

	const calendar_no_sharingmodes_fallback = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/123/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>123</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
    <cal:calendar-description/>
    <cal:calendar-timezone/>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#FF7A66</x1:calendar-color>
    <oc:calendar-enabled>1</oc:calendar-enabled>
    <cal:supported-calendar-component-set>
     <cal:comp name="VEVENT"/>
     <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
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
    <cs:allowed-sharing-modes/>
    <cs:source/>
   </d:prop>
   <d:status>HTTP/1.1 404 Not Found</d:status>
  </d:propstat>
 </d:response>
</d:multistatus>`;

	const webcal_default = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
 <d:response>
  <d:href>/remote.php/dav/calendars/admin/some-webcal-abo/</d:href>
  <d:propstat>
   <d:prop>
    <d:displayname>http://some-fancy-webcal.com/foo.ics</d:displayname>
    <d:resourcetype>
     <d:collection/>
     <cs:subscribed/>
    </d:resourcetype>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#e774b5</x1:calendar-color>
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
     <d:href>http://some-fancy-webcal.com/foo.ics</d:href>
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

	const public_calendar = `<?xml version="1.0"?>
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
				'urn:ietf:params:xml:ns:cal dav': 'c',
				'http://apple.com/ns/ical/': 'aapl',
				'http://owncloud.org/ns': 'oc',
				'http://nextcloud.com/ns': 'nc',
				'http://calendarserver.org/ns/': 'cs'
			}
		});
	});

	beforeEach(module('Calendar', function($provide) {
		$window = {};

		DavClient = {};
		DavClient.NS_DAV = 'DAV:';
		DavClient.NS_IETF = 'urn:ietf:params:xml:ns:caldav';
		DavClient.NS_APPLE = 'http://apple.com/ns/ical/';
		DavClient.NS_OWNCLOUD = 'http://owncloud.org/ns';
		DavClient.NS_NEXTCLOUD = 'http://nextcloud.com/ns';
		DavClient.NS_CALENDARSERVER = 'http://calendarserver.org/ns/';
		DavClient.getNodesFullName = jasmine.createSpy().and.callFake((node) => '{' + node.namespaceURI + '}' + node.localName);

		Calendar = jasmine.createSpy().and.callFake(function() {return Array.from(arguments);});
		WebCal = jasmine.createSpy().and.callFake(function() {return Array.from(arguments);});

		attrSpy = jasmine.createSpy();
		ngElementSpy = spyOn(angular, 'element').and.returnValue({attr: attrSpy});

		privateCalendarServiceAPI = {};

		$provide.value('$window', $window);
		$provide.value('DavClient', DavClient);
		$provide.value('Calendar', Calendar);
		$provide.value('WebCal', WebCal);
	}));

	beforeEach(inject(function (_CalendarFactory_) {
		CalendarFactory = _CalendarFactory_;
	}));

	afterEach(function() {
		ngElementSpy.and.callThrough();
	});

	it('create a calendar object', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_default);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: false, publishurl: null, publicurl: null,
			writableProperties: true}]);
	});

	it('create a webcal object', function() {
		const webcalProperties = davService.parseMultiStatus(webcal_default);
		const webcal = CalendarFactory.webcal(privateCalendarServiceAPI, webcalProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(webcal).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/some-webcal-abo/', {
			color: '#e774b5', displayname: 'http://some-fancy-webcal.com/foo.ics',
			components: {vevent: true, vjournal: false, vtodo: true}, order: 0, writable: false, owner: 'admin',
			enabled: true, shares: {users: [ ], groups: [  ]}, shareable: false, publishable: false, published: false,
			publishurl: null, publicurl: null, writableProperties: true,
			href: 'http://some-fancy-webcal.com/foo.ics'
		}]);
	});

	it('fallback to the instance color if no color is given', function() {
		attrSpy.and.returnValue('#fefefe');

		const calendarProperties = davService.parseMultiStatus(calendar_nocolor);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#fefefe', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: false, publishurl: null, publicurl: null,
			writableProperties: true}]);
	});

	it('enable the calendar when it\'s owned by the user and enabled is not set', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_noenabled);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: false, publishurl: null, publicurl: null,
			writableProperties: true}]);
	});

	it('disable the calendar when it\'s not owned by the user and enabled is not set', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_noenabled);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/hans_dieter/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: false, shares: {users: [], groups: []},
			shareable: false, publishable: false, published: false, publishurl: null, publicurl: null,
			writableProperties: false}]);
	});

	it('handle published calendars', function() {
		$window.location = 'http://nextcloud.dev/index.php/apps/calendar/';

		const calendarProperties = davService.parseMultiStatus(calendar_published);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: true,
			publishurl: 'http://nextcloud.dev/remote.php/dav/public-calendars/NW1DRAC4J4UDCH4M',
			publicurl: 'http://nextcloud.dev/index.php/apps/calendar/public/NW1DRAC4J4UDCH4M', writableProperties: true}]);
	});

	it('handle published calendars when current url ends with #', function() {
		$window.location = 'http://nextcloud.dev/index.php/apps/calendar/#';

		const calendarProperties = davService.parseMultiStatus(calendar_published);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: true,
			publishurl: 'http://nextcloud.dev/remote.php/dav/public-calendars/NW1DRAC4J4UDCH4M',
			publicurl: 'http://nextcloud.dev/index.php/apps/calendar/public/NW1DRAC4J4UDCH4M', writableProperties: true}]);
	});

	it('handle shared calendars for owner', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_shared);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true,
			shares: {
				users: [
					{id: 'user1', displayname: 'User 1', writable: false},
					{id: 'user2', displayname: 'User 2', writable: true}
				],
				groups: [
					{id: 'test', displayname: 'test', writable: false}
				]
			}, shareable: true, publishable: true, published: false, publishurl: null, publicurl: null, writableProperties: true}
		]);
	});

	it('handle shared calendars for ro sharee', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_shared);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/user1/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true,
			shares: {
				users: [
					{id: 'user1', displayname: 'User 1', writable: false},
					{id: 'user2', displayname: 'User 2', writable: true}
				],
				groups: [
					{id: 'test', displayname: 'test', writable: false}
				]
			}, shareable: false, publishable: false, published: false, publishurl: null, publicurl: null, writableProperties: false}
		]);
	});

	it('handle shared calendars for rw sharee', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_shared);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/user2/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true,
			shares: {
				users: [
					{id: 'user1', displayname: 'User 1', writable: false},
					{id: 'user2', displayname: 'User 2', writable: true}
				],
				groups: [
					{id: 'test', displayname: 'test', writable: false}
				]
			}, shareable: true, publishable: true, published: false, publishurl: null, publicurl: null, writableProperties: false}
		]);
	});

	it('handle vjournal as a component', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_vevent_vjournal);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: true, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: true, published: false, publishurl: null, publicurl: null,
			writableProperties: true}]);
	});

	it('correctly determine sharing options when sharing-modes is not available - owner', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_no_sharingmodes_fallback);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/123/', {
			color: '#FF7A66', displayname: '123', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: true, publishable: false, published: false, publishurl: null, publicurl: null,
			writableProperties: true}]);
	});

	it('correctly determine sharing options when sharing-modes is not available - not owner', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_no_sharingmodes_fallback);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/foobar/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/123/', {
			color: '#FF7A66', displayname: '123', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true, shares: {users: [], groups: []},
			shareable: false, publishable: false, published: false, publishurl: null, publicurl: null,
			writableProperties: false}]);
	});

	it('create a calendar object from a public calendar', function() {
		$window.location = 'http://nextcloud.dev/index.php/apps/calendar/public/KCMY4V5JZ22ODGFW';

		const calendarProperties = davService.parseMultiStatus(public_calendar);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '', true);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/public-calendars/KCMY4V5JZ22ODGFW/', {
			color: undefined, displayname: 'Personal (admin)', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true, shares: {users: [], groups: []}, shareable: false,
			publishable: false, published: true, publishurl: 'http://nextcloud.dev/remote.php/dav/public-calendars/KCMY4V5JZ22ODGFW',
			publicurl: 'http://nextcloud.dev/index.php/apps/calendar/public/KCMY4V5JZ22ODGFW', writableProperties: false}
		]);
	});
});
