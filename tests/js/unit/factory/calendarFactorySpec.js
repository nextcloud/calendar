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
	let DavClient, Calendar, WebCal, constants;
	let davService;
	let privateCalendarServiceAPI;

	const calendar_default = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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

	const calendar_shared_owner_displayname = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
    <nc:owner-displayname>Administrator</nc:owner-displayname>
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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
<d:multistatus xmlns:d="DAV:" xmlns:s="http://sabredav.org/ns" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
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

	const public_calendar_bug_596 = `<?xml version="1.0" encoding="UTF-8"?>
<d:multistatus xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:cs="http://calendarserver.org/ns/" xmlns:nc="http://nextcloud.org/ns" xmlns:oc="http://owncloud.org/ns" xmlns:s="http://sabredav.org/ns">
   <d:response>
      <d:href>/remote.php/dav/public-calendars/cx46HtLEtgGgEgbz/</d:href>
      <d:propstat>
         <d:prop>
            <d:displayname>Personal (admin)</d:displayname>
            <d:resourcetype>
               <d:collection />
               <cal:calendar />
            </d:resourcetype>
            <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
            <cal:supported-calendar-component-set>
               <cal:comp name="VEVENT" />
               <cal:comp name="VTODO" />
            </cal:supported-calendar-component-set>
            <cs:publish-url>
               <d:href>http://nextcloud.local/remote.php/dav/public-calendars/cx46HtLEtgGgEgbz</d:href>
            </cs:publish-url>
            <cs:allowed-sharing-modes>
               <cs:can-be-shared />
               <cs:can-be-published />
            </cs:allowed-sharing-modes>
            <d:acl>
               <d:ace>
                  <d:principal>
                     <d:href>/remote.php/dav/principals/users/admin/</d:href>
                  </d:principal>
                  <d:grant>
                     <d:privilege>
                        <d:read />
                     </d:privilege>
                  </d:grant>
                  <d:protected />
               </d:ace>
               <d:ace>
                  <d:principal>
                     <d:href>/remote.php/dav/principals/users/admin/</d:href>
                  </d:principal>
                  <d:grant>
                     <d:privilege>
                        <d:write />
                     </d:privilege>
                  </d:grant>
                  <d:protected />
               </d:ace>
               <d:ace>
                  <d:principal>
                     <d:href>/remote.php/dav/principals/system/public/</d:href>
                  </d:principal>
                  <d:grant>
                     <d:privilege>
                        <d:read />
                     </d:privilege>
                  </d:grant>
                  <d:protected />
               </d:ace>
               <d:ace>
                  <d:principal>
                     <d:href>/remote.php/dav/principals/users/admin/</d:href>
                  </d:principal>
                  <d:grant>
                     <d:privilege>
                        <d:read />
                     </d:privilege>
                  </d:grant>
                  <d:protected />
               </d:ace>
               <d:ace>
                  <d:principal>
                     <d:href>/remote.php/dav/principals/users/admin/</d:href>
                  </d:principal>
                  <d:grant>
                     <d:privilege>
                        <d:write />
                     </d:privilege>
                  </d:grant>
                  <d:protected />
               </d:ace>
            </d:acl>
            <d:owner>
               <d:href>/remote.php/dav/principals/users/admin/</d:href>
            </d:owner>
            <oc:invite />
            <x2:owner-displayname xmlns:x2="http://nextcloud.com/ns">Señor Administrator</x2:owner-displayname>
         </d:prop>
         <d:status>HTTP/1.1 200 OK</d:status>
      </d:propstat>
      <d:propstat>
         <d:prop>
            <cal:calendar-description />
            <cal:calendar-timezone />
            <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/" />
            <oc:calendar-enabled />
            <cs:source />
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

		privateCalendarServiceAPI = {};

		constants = {
			fallbackColor: '#fefefe',
			shareeCanEditCalendarProperties: true,
			shareeCanEditShares: false
		};

		$provide.value('DavClient', DavClient);
		$provide.value('Calendar', Calendar);
		$provide.value('WebCal', WebCal);
		$provide.value('constants', constants);
	}));

	beforeEach(inject(function (_CalendarFactory_) {
		CalendarFactory = _CalendarFactory_;
	}));

	it('create a calendar object', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_default);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: true, publishable: true, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('create a webcal object', function() {
		const webcalProperties = davService.parseMultiStatus(webcal_default);
		const webcal = CalendarFactory.webcal(privateCalendarServiceAPI, webcalProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(webcal).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/some-webcal-abo/', {
			color: '#e774b5', displayname: 'http://some-fancy-webcal.com/foo.ics',
			components: {vevent: true, vjournal: false, vtodo: true}, order: 0, writable: false, owner: 'admin',
			enabled: true, shares: {users: [ ], groups: [  ]}, ownerDisplayname: null, shareable: false, publishable: false, published: false,
			publicToken: null, writableProperties: true,
			href: 'http://some-fancy-webcal.com/foo.ics'
		}]);
	});

	it('fallback to the instance color if no color is given', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_nocolor);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#fefefe', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: true, publishable: true, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('enable the calendar when it\'s owned by the user and enabled is not set', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_noenabled);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: true, publishable: true, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('disable the calendar when it\'s not owned by the user and enabled is not set', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_noenabled);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/hans_dieter/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: false, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: false, publishable: false, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('handle published calendars', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_published);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: 'admin',
			shareable: true, publishable: true, published: true, publicToken: 'NW1DRAC4J4UDCH4M',
			writableProperties: true}]);
	});

	it('handle published calendars when current url ends with #', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_published);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: 'admin',
			shareable: true, publishable: true, published: true, publicToken: 'NW1DRAC4J4UDCH4M',
			writableProperties: true}]);
	});

	it('handle shared calendars for owner - 11 and below', function() {
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
			}, ownerDisplayname: null, shareable: true, publishable: true, published: false, publicToken: null, writableProperties: true}
		]);
	});

	it('handle shared calendars for owner - 12+', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_shared_owner_displayname);
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
			}, ownerDisplayname: 'Administrator', shareable: true, publishable: true, published: false, publicToken: null, writableProperties: true}
		]);
	});

	it('handle shared calendars for ro sharee - 12+', function() {
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
			}, ownerDisplayname: null, shareable: false, publishable: false, published: false, publicToken: null, writableProperties: true}
		]);
	});

	it('handle shared calendars for ro sharee - 11 and below', function() {
		constants.shareeCanEditCalendarProperties = false;
		constants.shareeCanEditShares = true;

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
			}, ownerDisplayname: null, shareable: false, publishable: false, published: false, publicToken: null, writableProperties: false}
		]);
	});

	it('handle shared calendars for rw sharee - 12+', function() {
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
			}, ownerDisplayname: null, shareable: false, publishable: false, published: false, publicToken: null, writableProperties: true}
		]);
	});

	it('handle shared calendars for rw sharee - 11 and below', function() {
		constants.shareeCanEditCalendarProperties = false;
		constants.shareeCanEditShares = true;

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
			}, ownerDisplayname: null, shareable: true, publishable: true, published: false, publicToken: null, writableProperties: false}
		]);
	});

	it('handle vjournal as a component', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_vevent_vjournal);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/privat/', {
			color: '#78e774', displayname: 'Privat', components: {vevent: true, vjournal: true, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: true, publishable: true, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('correctly determine sharing options when sharing-modes is not available - owner', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_no_sharingmodes_fallback);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/admin/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/123/', {
			color: '#FF7A66', displayname: '123', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: true, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: true, publishable: false, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('correctly determine sharing options when sharing-modes is not available - not owner', function() {
		const calendarProperties = davService.parseMultiStatus(calendar_no_sharingmodes_fallback);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '/remote.php/dav/principals/users/foobar/', false);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/calendars/admin/123/', {
			color: '#FF7A66', displayname: '123', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: null,
			shareable: false, publishable: false, published: false, publicToken: null,
			writableProperties: true}]);
	});

	it('create a calendar object from a public calendar', function() {
		const calendarProperties = davService.parseMultiStatus(public_calendar);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '', true);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/public-calendars/KCMY4V5JZ22ODGFW/', {
			color: '#fefefe', displayname: 'Personal (admin)', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: 'admin', shareable: false,
			publishable: false, published: true, publicToken: 'KCMY4V5JZ22ODGFW', writableProperties: false}]);
	});

	it('create a calendar object from a public calendar (#596)', function () {
		const calendarProperties = davService.parseMultiStatus(public_calendar_bug_596);
		const calendar = CalendarFactory.calendar(privateCalendarServiceAPI, calendarProperties[0], '', true);
		expect(calendar).toEqual([privateCalendarServiceAPI, '/remote.php/dav/public-calendars/cx46HtLEtgGgEgbz/', {
			color: '#fefefe', displayname: 'Personal (admin)', components: {vevent: true, vjournal: false, vtodo: true},
			order: 0, writable: false, owner: 'admin', enabled: true, shares: {users: [], groups: []}, ownerDisplayname: 'Señor Administrator', shareable: false,
			publishable: false, published: true, publicToken: 'cx46HtLEtgGgEgbz', writableProperties: false}]);
	});
});
