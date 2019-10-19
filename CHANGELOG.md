## 2.0.0 beta1 - 2019-10-21

Version 2.0 of the calendar has been fully rewritten with a different technology, switching from the legacy AngularJS framework to Vue.js. Nextcloud is using more and more Vue.js throughout apps and server, which makes it easy to use common components everywhere. This allows faster development and a more coherent experience in all of Nextcloud.

Even though all features present on the 1.x calendar app versions have been reimplemented, new bugs might have been introduced. Please report them if you find some.

### Added
- Improved compatibility with dark mode
  [#1152](https://github.com/nextcloud/calendar/issues/1152)
  [#985](https://github.com/nextcloud/calendar/issues/985)
- Assign random UIDs on import if events don't have one
  [#857](https://github.com/nextcloud/calendar/issues/857)
- Use Popper.JS for more reliable positioning of event popover
  [#18](https://github.com/nextcloud/calendar/issues/18)
- New design for embedding shared calendars
  [#741](https://github.com/nextcloud/calendar/issues/741)
- Share multiple public calendars in one link
  [#708](https://github.com/nextcloud/calendar/issues/708)
- Completely rewritten interface for entering recurrence-rules
  [#10](https://github.com/nextcloud/calendar/issues/10)
- Improved discoverability of upper-left date-picker
  [#881](https://github.com/nextcloud/calendar/issues/881)
- Do not send invites on import
  [#576](https://github.com/nextcloud/calendar/issues/576)
- Automatically adjust the start time when user picks new end earlier than start
  [#497](https://github.com/nextcloud/calendar/issues/497)
- Prioritize user-addressbook over system users when inviting attendees
  [#168](https://github.com/nextcloud/calendar/issues/168)
- Add option to mark user as non-participant
  [#570](https://github.com/nextcloud/calendar/issues/570)
- Add subscribe and download button to public sharing menu
  [#1263](https://github.com/nextcloud/calendar/issues/1263)
- Make embedded public calendars stylable
  [#318](https://github.com/nextcloud/calendar/issues/318)
- Send email notifications on change of location, summary, or description
  [#848](https://github.com/nextcloud/calendar/issues/848)
- Add checkbox for birthday calendar in settings, allowing to restore it
  [#277](https://github.com/nextcloud/calendar/issues/277)
- Allow to edit only this or this and all future occurrences of an event
  [#7](https://github.com/nextcloud/calendar/issues/7)
- Add next/previous month button in top-left datepicker
  [#554](https://github.com/nextcloud/calendar/issues/554)
- Show invitation response of attendee
  [#879](https://github.com/nextcloud/calendar/issues/879)
- Top-left datepicker allows navigating between years
  [#703](https://github.com/nextcloud/calendar/issues/703)
- Limit number of concurrent requests while import
  [#445](https://github.com/nextcloud/calendar/issues/445)
- Cleanup VTimezones after editing events
  [#37](https://github.com/nextcloud/calendar/issues/37)
- Improved validation of attendee field
  [#569](https://github.com/nextcloud/calendar/issues/560)
- Show organizer of event
  [#486](https://github.com/nextcloud/calendar/issues/486)
- Improved legibility in read-only mode of editor
  [#555](https://github.com/nextcloud/calendar/issues/555)
- Allow to disable weekends
  [#536](https://github.com/nextcloud/calendar/issues/536)
- Add button to copy caldav link to clipboard
  [#22](https://github.com/nextcloud/calendar/issues/22)
- Show the current date in the browser title
  [#280](https://github.com/nextcloud/calendar/issues/280)
- Updated design of sharing mechanism for calendars
  [#377](https://github.com/nextcloud/calendar/issues/377)
- Ability to handle multiple VCALENDAR blocks in one ics
  [#336](https://github.com/nextcloud/calendar/issues/336)
- Allow to change color of contact birthdays calendar
  [#313](https://github.com/nextcloud/calendar/issues/313)
- Use webcals when accessing calendar via https
  [#748](https://github.com/nextcloud/calendar/issues/748)
- Use illustrations for events
  [#968](https://github.com/nextcloud/calendar/issues/968)

### Fixed
- User session expiration exceptions
  [#1215](https://github.com/nextcloud/calendar/issues/1215)
- Files_sharing app is required as dependency for Sharing
  [#608](https://github.com/nextcloud/calendar/issues/608)
- Show original color of publicly shared calendars
  [#619](https://github.com/nextcloud/calendar/issues/619)
- Allow events with start time equal to end time
  [#790](https://github.com/nextcloud/calendar/issues/790)
- Missing interaction of import-button
  [#1374](https://github.com/nextcloud/calendar/issues/1374)
- Sharing list takes too long to show
  [#1297](https://github.com/nextcloud/calendar/issues/1297)
- Wrong profile picture when searching for user in share dialog
  [#861](https://github.com/nextcloud/calendar/issues/861)
- Properly update LAST-MODIFIED and SEQUENCE on update of calendar
  [#976](https://github.com/nextcloud/calendar/issues/976)
- Drag and Drop failed after viewing event details
  [#914](https://github.com/nextcloud/calendar/issues/914)
- Selected view was not sticky
  [#809](https://github.com/nextcloud/calendar/issues/809)
- Non-unique Id in HTML
  [#860](https://github.com/nextcloud/calendar/issues/860)
- X-NC-GROUP-ID was not properly removed 
  [#342](https://github.com/nextcloud/calendar/issues/342)
- Fields in repeat area are not disabled in read-only in Edge
  [#420](https://github.com/nextcloud/calendar/issues/420)
- Store CREATED, DTSTAMP, and LAST-MODIFIED as UTC
  [#33](https://github.com/nextcloud/calendar/issues/33)
- Same attendee could be added multiple times
  [#575](https://github.com/nextcloud/calendar/issues/575)
- Impossible to scroll down to save event on certain mobile devices
  [#1079](https://github.com/nextcloud/calendar/issues/1079)

### Changes
- New calendars only support VEvent from now on
  [#1316](https://github.com/nextcloud/calendar/issues/1316)


## 1.7.1 - 2019-09-05
### Fixed
- Falses positives for local access rules [#1277](https://github.com/nextcloud/calendar/issues/1277)
- Always show border on calendar item [#1298](https://github.com/nextcloud/calendar/pull/1298)
- Update link to documentation [#1409](https://github.com/nextcloud/calendar/pull/1409)
- Don’t ship special build for IE anymore [#1447](https://github.com/nextcloud/calendar/pull/1447)


## 1.7.0 - 2019-03-25
### Added
- Share calendars with circles
  [#602](https://github.com/nextcloud/calendar/pull/602)
### Fixed
- compatibility with Nextcloud 16
- Buttons not visible in dark theme
  [#1042](https://github.com/nextcloud/calendar/issues/1042)
- Fix datepicker alignment
  [#1085](https://github.com/nextcloud/calendar/pull/1085)

## 1.6.4 - 2018-11-23
### Fixed
- Use clearer color to easier locate today
  [#850](https://github.com/nextcloud/calendar/pull/850)
- Styling broken with Nextcloud 14 using Dark theme
  [#938](https://github.com/nextcloud/calendar/issues/938)
- Missing name when using the dropdown for location -> contacts
  [#776](https://github.com/nextcloud/calendar/issues/776)
- Public calendar iframe has issues on some browser (requires Nextcloud 15+)
  [#169](https://github.com/nextcloud/calendar/issues/169)
- Broken positioning of New calendar button in Internet explorer 11
  [#949](https://github.com/nextcloud/calendar/pull/949)
- Provide autocompletion addresses as a single line
  [#933](https://github.com/nextcloud/calendar/issues/933)

## 1.6.3 - 2018-10-16
### Fixed
- Incorrect creation of attendees that led to duplicate entries after invitation response
- updated translations

## 1.6.2 - 2018-09-05
### Fixed
- compatibility with Nextcloud 14
- updated translations


## 1.6.1 - 2018-03-06
### Fixed
- Double the height of the description textarea
  [#675](https://github.com/nextcloud/calendar/issues/675)
- Fix parsing for all-day VEvents that 
  [#692](https://github.com/nextcloud/calendar/issues/692)
- Manual override for timezone
  [#586](https://github.com/nextcloud/calendar/issues/586)
- Improved error handling for parsing of events when importing
  [#598](https://github.com/nextcloud/calendar/issues/598)
- Fix correct highlighting of today on weekends
  [#726](https://github.com/nextcloud/calendar/issues/726)
- Fix handling of VEvents that contain only Recurrence-IDs
  [#722](https://github.com/nextcloud/calendar/issues/722)

## 1.6.0 - 2018-02-05
### Fixed
- Compatibility with 13
- Enter in new attendee field closes sidebar
  [#502](https://github.com/nextcloud/calendar/issues/502)
- Displayname is missing on public sharing site
  [#596](https://github.com/nextcloud/calendar/issues/596)
- Small / short dates not usable in any agenda view
  [#221](https://github.com/nextcloud/calendar/issues/221)
- Missing 'Nextcloud' logo when accessing shared calendar
  [#571](https://github.com/nextcloud/calendar/issues/571)

### Informational:
- Shortcut changed: The events editor can be closed with CTRL / CMD + Enter now
- 1.6.0 does not support Nextcloud 12 and below, the 1.5 tree will be maintained till Nextcloud 12 is end of life

## 1.5.7 - 2017-12-08
### Fixed
- Issue with displaying wrong year in upper left corner for certain cases
  [#434](https://github.com/nextcloud/calendar/issues/434)
- Don't allow importing events with the same UID in a calendar
  [#589](https://github.com/nextcloud/calendar/issues/589)
- Show warning about email reminders not being implemented in the server yet
  [#676](https://github.com/nextcloud/calendar/pull/676)
- Double escaping of alarm types in the event editor
  [#269](https://github.com/nextcloud/calendar/issues/269)

## 1.5.6 - 2017-10-18
### Fixed
- Issue with sharing read-write with users
  [#606](https://github.com/nextcloud/calendar/issues/606)

## 1.5.5 - 2017-09-19
### Fixed
- Remove invalid signed signature from release 

## 1.5.4 - 2017-09-12
### Fixed
- Wrong timezone for Europe/Moscow
  [#82](https://github.com/nextcloud/calendar/issues/82)
- Double scrollbar in advanced event editor
  [#468](https://github.com/nextcloud/calendar/pull/468)
- Show displayname when creating a new calendar share
  [#459](https://github.com/nextcloud/calendar/issues/459)
- Better looking public-share notification emails on Nextcloud 12
  [#427](https://github.com/nextcloud/calendar/issues/427)
- Readable public sharing links
  [#239](https://github.com/nextcloud/calendar/issues/239)
- Today button overlapped with new calendar button in some localizations
  [#312](https://github.com/nextcloud/calendar/issues/312)
- Respect admin option to disable public sharing
  [#525](https://github.com/nextcloud/calendar/issues/525)
- Highlight current day in left sidebar datepicker
  [#513](https://github.com/nextcloud/calendar/issues/513)
- mispositioned buttons on public sharing site (only affected Nextcloud 11)
  [#509](https://github.com/nextcloud/calendar/issues/509)
- Fix checkbox style for attendee input
  [#580](https://github.com/nextcloud/calendar/pull/580)
- Spelling fixes
  [#469](https://github.com/nextcloud/calendar/pull/469)
  [#473](https://github.com/nextcloud/calendar/pull/473)
  [#474](https://github.com/nextcloud/calendar/pull/474)

## 1.5.3 - 2017-05-21
### Added
- allow editing props of shared calendars (Nextcloud 12 and above only)
  [#406](https://github.com/nextcloud/calendar/issues/406)
- add avatar to sharing list
  [#207](https://github.com/nextcloud/calendar/issues/207)
- effort to get rid of adblocker issues
  [#417](https://github.com/nextcloud/calendar/pull/417)
- color weekends slightly darker
  [#430](https://github.com/nextcloud/calendar/pull/430)


### Fixed
- fix visual deletion of user shares
  [#378](https://github.com/nextcloud/calendar/issues/378)
- make sure the user can not set the end to something earlier than the start
  [#11](https://github.com/nextcloud/calendar/issues/11)
- increased font-size of calendar-view
  [#166](https://github.com/nextcloud/calendar/issues/166)
- sanitize missing VALUE=DATE when parsing ics data
  [#376](https://github.com/nextcloud/calendar/issues/376)
- fix visibility of import progressbar
  [#423](https://github.com/nextcloud/calendar/issues/423)
- properly display errors when querying events failed
  [#359](https://github.com/nextcloud/calendar/issues/359)
- increase ending time by an hour also when clicking on disabled time-input
  [#438](https://github.com/nextcloud/calendar/issues/438)
- improve visibility of vertical calendar grid
  [#314](https://github.com/nextcloud/calendar/issues/314)
- hide sharing actions for sharees (Nextcloud 12 and above only)
  [#432](https://github.com/nextcloud/calendar/issues/432)
- allow clicking on disabled time-input in sidebar (only affected Firefox)
  [#388](https://github.com/nextcloud/calendar/issues/388)
- fixed issue with chinese characters showing up in estonian language
  [#264](https://github.com/nextcloud/calendar/issues/264)
- fixed handling of Recurrence-ID
  [#142](https://github.com/nextcloud/calendar/issues/142)
- fixed and unified timepicker layout in editor popover and editor sidebar
  [#72](https://github.com/nextcloud/calendar/issues/72)
- improved visibility of current-day color
  [#395](https://github.com/nextcloud/calendar/pull/395)
- fix issue with too long webcal urls
  [#325](https://github.com/nextcloud/calendar/issues/325)
- show proper empty content view for non-existing public calendar links
  [#240](https://github.com/nextcloud/calendar/issues/240)
- refactored public calendar links page
  [#243](https://github.com/nextcloud/calendar/issues/243)
- fixed position of mobile menu on public calendar link page
  [#248](https://github.com/nextcloud/calendar/issues/248)

## 1.5.2 - 2017-03-21
### Fixed
- fixed issue with "three-part-timezone" like America/Argentina/Buenos_Aires
  [#358](https://github.com/nextcloud/calendar/issues/358)

## 1.5.1 - 2017-02-28
### Added
- advanced color-picker
  [#4](https://github.com/nextcloud/calendar/issues/4)
- support for Internet Explorer 11
  [#329](https://github.com/nextcloud/calendar/pull/329)
- added second step for deleting calendars
  [#341](https://github.com/nextcloud/calendar/issues/341)

### Fixed
- debounce vertical window resize
  [#23](https://github.com/nextcloud/calendar/issues/23)
- fix phrasing on public sharing site
  [#233](https://github.com/nextcloud/calendar/issues/233)
- fix missing am/pm label in timepicker
  [#345](https://github.com/nextcloud/calendar/issues/345)

## 1.5.0 - 2017-01-17
### Added
- enable calendar when selecting it in editor
  [#24](https://github.com/nextcloud/calendar/issues/24)
- autoresize input for title, description and location
  [#72](https://github.com/nextcloud/calendar/issues/72)
- disable all-day when clicking on time-input
  [#72](https://github.com/nextcloud/calendar/issues/72)
- save 301 responses from webcal subscriptions
  [#42](https://github.com/nextcloud/calendar/issues/42)
- add web-based protocol handlers for WebCAL
  [#41](https://github.com/nextcloud/calendar/issues/41)
- better tabindex for event editors
  [#25](https://github.com/nextcloud/calendar/issues/25)
- lazy load timezones when rendering events
  [#14](https://github.com/nextcloud/calendar/issues/14)
- hide sidepanel on print view
- replace TRIGGER:P with TRIGGER:P0D
  [#251](https://github.com/nextcloud/calendar/issues/251)

### Fixed
- Require sharing api for creating new shares
  [#205](https://github.com/nextcloud/calendar/issues/205)
- Importing empty calendars
  [#194](https://github.com/nextcloud/calendar/issues/194)
- List app in office category
- fix sending the RSVP parameter for attendees
  [#102](https://github.com/nextcloud/calendar/issues/102)
- fix styling issue with too long group names / too long translations
  [#99](https://github.com/nextcloud/calendar/issues/99)
- fix capitalization of Settings & import
- fix icon share padding
- fix glitchy looking whitespace in event details
  [#242](https://github.com/nextcloud/calendar/issues/242)

## 1.4.1 - 2016-11-22
### Fixed
- more consistent styles with Nextcloud
- fixed scrolling of calendar-list
- added details tab in sidebar
- improved ARIA support
- publishing calendars (requires Nextcloud 11)
- removed eventLimit, all events will be displayed in month view
- better border styles for calendar grid to enhance usability
- fixed drag and drop between grid and allday area
- fixed issue that prevented users from creating events in UTC
- fixed issue with expanding repeating events on first day of week
- expand settings area on first run
- sanitize malformed dates, fixes compatibility with FB birthday webcal
- attendee: show email address when user has multiple email addresses

## 1.4.0 - 2016-09-19
### Added
- WebCal
- Random color picker
- Display week numbers

### Fixed
- Delete alarms from events
- Adjusted colors to Nextcloud
- Properly display line breaks in agenda views
