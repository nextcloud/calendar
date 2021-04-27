# Changelog

## 2.2.1 – 2021-04-27
### Changed
- Updated dependencies

## 2.2.0 – 2021-03-24
### Added
- Datepicker in free/busy view
- Grey background for all attendees in free/busy when at least one person is busy
- Free/busy view shows day of the week
- Nextcloud 22 (dev) support
### Changed
- Improved dashboard widget styling
- Updated translations
- Updated dependencies
- Vary event illustrations when multiple illustrations match
### Fixed
- Hide cancelled events on dashboard
- Styling of free/busy slots
- Browser compatibility issues
- Search DAV principal as display name or email
- Handling of invalid calendar objects when rending a calendar
- Sorting of free/busy resources
- Hover background in list view with Nextcloud's dark theme

## 2.1.3 - 2021-01-04
### Fixed
- Let apps handle clicks on todo entries #2478
- Fix calendar rendering with complex locale #2741
- Fix encoded display of names that contain a special character #2726
- Fix blank page on browsers without support for ResizeObserver #2620
- Fix broken link #2715
- RRULE UNTIL must be in UTC if DTSTART is timezone-aware #2709
- Add some margin for organizer hint in attendee list #2683
- Updated translations
- Updated dependencies

## 2.1.2 - 2020-09-24
### Added
- 21 compatibility
- Fixed reminder editing
  [#2605](https://github.com/nextcloud/calendar/pull/2605)
  [#2606](https://github.com/nextcloud/calendar/pull/2606)

## 2.1.1 - 2020-09-11
### Fixed
- Dashboard fixes
  [#2574](https://github.com/nextcloud/calendar/pull/2574)
  [#2575](https://github.com/nextcloud/calendar/pull/2575)
  [#2579](https://github.com/nextcloud/calendar/pull/2579)
- Fix opening an event from search
  [#2578](https://github.com/nextcloud/calendar/pull/2578)
- Updated dependencies
- Updated translations

## 2.1.0 - 2020-09-02
### Added
- Dashboard integration
  [#2414](https://github.com/nextcloud/calendar/pull/2414)
- Better routes to link to calendar from outside
  [#2483](https://github.com/nextcloud/calendar/pull/2483)
- Different style for all-day / timed events
  [#30](https://github.com/nextcloud/calendar/issues/30)
- List view
  [#402](https://github.com/nextcloud/calendar/issues/402)
- Search
  [#8](https://github.com/nextcloud/calendar/issues/8)

### Fixed
- Better localization of calendar-grid
  [#1844](https://github.com/nextcloud/calendar/issues/1844)
- Remove double scrollbars in Firefox
  [#1815](https://github.com/nextcloud/calendar/issues/1815)
- Better error handling for missing events
  [#2459](https://github.com/nextcloud/calendar/issues/2459)
- Long description box
  [#2187](https://github.com/nextcloud/calendar/issues/2187)

## 2.0.4 - 2020-08-27
### Added
- Center date in month view cell
  [#2451](https://github.com/nextcloud/calendar/pull/2451)
- Sortable calendar list
  [#9](https://github.com/nextcloud/calendar/issues/9)
- Display tasks with a due-date in calendar app
  [#28](https://github.com/nextcloud/calendar/issues/28)
- Keyboard support
  [#157](https://github.com/nextcloud/calendar/issues/157)
- Add illustration to videoconference
  [#2217](https://github.com/nextcloud/calendar/issues/2217)
- Change Illustration for Lunch
  [#2218](https://github.com/nextcloud/calendar/issues/2218)
- Convert URLs into links inside description
  [#674](https://github.com/nextcloud/calendar/issues/674)
- Picking a date in date-time-picker does not open time-picker
  [#2198](https://github.com/nextcloud/calendar/issues/2198)

### Fixed
- Sharing Calendar public links via email sends only a link to the cloud
  [#2471](https://github.com/nextcloud/calendar/issues/2471)
- Also mark tasks as done when STATUS is set to COMPLETED
  [#2339](https://github.com/nextcloud/calendar/pull/2339)
- Long calendar names overflowing in calendar-picker
  [#2324](https://github.com/nextcloud/calendar/issues/2324)
- Datepicker not localized
  [#2174](https://github.com/nextcloud/calendar/issues/2174)
- Hide submit button in editor sidebar
  [#2291](https://github.com/nextcloud/calendar/issues/2291)
- Fix timezone names
  [#2292](https://github.com/nextcloud/calendar/pull/2292)
- Fixes warning about duplicate ids
  [#2287](https://github.com/nextcloud/calendar/pull/2287)
- Make calendar-picker more prominent
  [#2007](https://github.com/nextcloud/calendar/issues/2007)
- Circle not found when full name is given
  [#2220](https://github.com/nextcloud/calendar/issues/2220)

## 2.0.3 - 2020-04-09
### Added
- Show week number in Datepicker
  [#2060](https://github.com/nextcloud/calendar/pull/2060)
- Support am/pm in Datepicker
  [#2060](https://github.com/nextcloud/calendar/pull/2060)
- Allow to jump to timepicker, without reselecting the date
  [#2060](https://github.com/nextcloud/calendar/pull/2060)

### Fixed
- Calendar list has trouble loading when shared from account or group with non-latin characters.
  [#1894](https://github.com/nextcloud/calendar/issues/1894)
- CSP Issue when embedding calendar
  [#13627](https://github.com/nextcloud/server/issues/13627)
  [#169](https://github.com/nextcloud/calendar/issues/169)
- Alarm trigger was a date in all-day event
  [#2128](https://github.com/nextcloud/calendar/issues/2128)
- Blank screen when create new date by opened editor
  [#2051](https://github.com/nextcloud/calendar/issues/2051)
- Popover outside viewport when double-clicking event
  [#1925](https://github.com/nextcloud/calendar/issues/1925)
- Popover outside viewport when event is hidden behind "More"
  [#1934](https://github.com/nextcloud/calendar/issues/1934)
- Popover outside viewport in day-view
  [#2109](https://github.com/nextcloud/calendar/issues/2109)
- Optimized view icons
  [#2154](https://github.com/nextcloud/calendar/pull/2154)
- Always allow editing an alarm when it is absolute
  [#2001](https://github.com/nextcloud/calendar/issues/2001)
- Fix opening animation of sidebar editor
  [#2089](https://github.com/nextcloud/calendar/pull/2089)
- Long repeating events not correctly shown on web-calender under certain conditions
  [#2048](https://github.com/nextcloud/calendar/issues/2048)
- Repeating events not displayed on first day of monthly calendar 
  [#1913](https://github.com/nextcloud/calendar/issues/1913)

## 2.0.2 - 2020-03-02
### Added
- Recognize Gym as event title for illustrations
  [#1888](https://github.com/nextcloud/calendar/issues/1888)
- Improve illustration matching for less false positives
  [#1916](https://github.com/nextcloud/calendar/issues/1916)
- Add illustrations keywords related to agile development
  [#1873](https://github.com/nextcloud/calendar/pull/1873)
- Add hint to new calendar dropdown that subscriptions are read-only
  [#1938](https://github.com/nextcloud/calendar/pull/1938)
- Move navigation to appinfo
  [#1979](https://github.com/nextcloud/calendar/pull/1979)
- Use InitialState API
  [#1759](https://github.com/nextcloud/calendar/issues/1759)
- Monthly-mode: scroll-bar instead of "more"
  [#1889](https://github.com/nextcloud/calendar/issues/1889)
- Adds a minimum height for fullcalendar-events
  [#2020](https://github.com/nextcloud/calendar/pull/2020)
- Better feedback for import failures
  [#1920](https://github.com/nextcloud/calendar/issues/1920)
- Custom color per event
  [#71](https://github.com/nextcloud/calendar/issues/71)
- Allow to configure slotDuration
  [#2042](https://github.com/nextcloud/calendar/pull/2042)

### Fixed
- Undefined color variable
  [#1905](https://github.com/nextcloud/calendar/issues/1905)
- Localization of sub-title in AppSidebar
  [#1912](https://github.com/nextcloud/calendar/issues/1912)
- Localization of tab-title
  [#1871](https://github.com/nextcloud/calendar/issues/1871)
- Next month button skips one month the first time
  [#1936](https://github.com/nextcloud/calendar/issues/1936)
- Issue with background-color for icon in datepicker
  [#1939](https://github.com/nextcloud/calendar/pull/1939)
- Calendar color generator doesn't handle undefined calendar displayname
  [#1941](https://github.com/nextcloud/calendar/issues/1941)
- Sharing with users and groups with spaces
  [#1985](https://github.com/nextcloud/calendar/pull/1985)
- Birthday calender entries in wrong date format (in sidebar)
  [#1923](https://github.com/nextcloud/calendar/issues/1923)
- Stop hardcoding saturday and sunday as weekend, change it based on locale
  [#2016](https://github.com/nextcloud/calendar/issues/2016)
- Duration display issue with entries having a duration of a minute or less
  [#1963](https://github.com/nextcloud/calendar/issues/1963)
- Navigation and Display issue in day view
  [#1944](https://github.com/nextcloud/calendar/issues/1944)
- Handle files_sharing app being disabled
  [#1967](https://github.com/nextcloud/calendar/issues/1967)
- No calendar import (in Firefox and Edge on Windows)
  [#1898](https://github.com/nextcloud/calendar/issues/1898)
- Issue setting the end-timezone of an event
  [#1914](https://github.com/nextcloud/calendar/issues/1914)
- Calendar app cannot add repeats to an event after the event is created
  [#2013](https://github.com/nextcloud/calendar/issues/2013)
- Preserve duration when editing start time
  [#1929](https://github.com/nextcloud/calendar/issues/1929)
- Changes inside subcomponents not properly tracked
  [#1891](https://github.com/nextcloud/calendar/issues/1891)

## 2.0.1 - 2020-01-20
### Fixed
- Sort categories alphabetically
  [#1827](https://github.com/nextcloud/calendar/issues/1827)
- Missing styles of "more events" popover
  [#1865](https://github.com/nextcloud/calendar/pull/1865)
- Resolving timezone aliases not working
  [#1841](https://github.com/nextcloud/calendar/issues/1841)
- Generated embed code for public calendar contains wrong link
  [#1861](https://github.com/nextcloud/calendar/issues/1861)
- Add sanity check for route name in case migration didn't run
  [#1831](https://github.com/nextcloud/calendar/issues/1831)
- Positioning of new-event popover in day and week view
  [#1818](https://github.com/nextcloud/calendar/issues/1818)
- Display self-added categories in list, making it easier to remove them again
  [#1819](https://github.com/nextcloud/calendar/issues/1819)

## 2.0.0 - 2020-01-17
### Fixed
- Do not include index.php in the url of sharing links if url rewrite is enabled
  [#1821](https://github.com/nextcloud/calendar/pull/1821)
- Fix PHP warning when accessing public / embedded routes
  [#1822](https://github.com/nextcloud/calendar/pull/1822)
- Include index.php in router base if necessary despite url rewrite enabled
  [#1823](https://github.com/nextcloud/calendar/pull/1823)

## 2.0.0 RC1 - 2020-01-15
### Fixed
- Hide horizontal scrollbar in Firefox
  [#1809](https://github.com/nextcloud/calendar/pull/1809)
- Cannot enter minutes off slot
  [#1756](https://github.com/nextcloud/calendar/issues/1756)
- Fix downsizing calendar-grid when making window smaller
  [#1806](https://github.com/nextcloud/calendar/pull/1806)
- Always make all-day DTEND exclusive
  [#1810](https://github.com/nextcloud/calendar/pull/1810)
- Convert eventRenderer from event to property
  [#1807](https://github.com/nextcloud/calendar/pull/1807)
- Fix opening calendar when not logged in
  [#1803](https://github.com/nextcloud/calendar/pull/1803)
- Style of today indicator in agendaDay and agendaWeek
  [#1804](https://github.com/nextcloud/calendar/issues/1804)
- Fix double-escape of ampersand of settings title
  [#1760](https://github.com/nextcloud/calendar/pull/1760)

### Added
- Editing event-time without punctuation
  [#1621](https://github.com/nextcloud/calendar/issues/1621)
- Allow entering incomplete time-values
  [#1144](https://github.com/nextcloud/calendar/issues/1144)
- Add reminder icon to events with an alarm
  [#1197](https://github.com/nextcloud/calendar/issues/1197)
- Free/Busy UI
  [#1731](https://github.com/nextcloud/calendar/pull/1731)
- Event-limit in calendar-grid
  [#1800](https://github.com/nextcloud/calendar/pull/1800)
- Add more illustration keywords
  [#1780](https://github.com/nextcloud/calendar/pull/1780)
- Create talk rooms from event editor
  [#1732](https://github.com/nextcloud/calendar/pull/1732)
-  Allow to provide defaults for user-settings
  [#1787](https://github.com/nextcloud/calendar/issues/1787)

## 2.0.0 beta3 - 2019-12-09
### Fixed
- Hide the resize handler of textareas, whenever we use autosize
  [#1629](https://github.com/nextcloud/calendar/pull/1629)
- Give the description field a default height of two rows
  [#1630](https://github.com/nextcloud/calendar/pull/1630)
- Hide calendar-picker if user has only one writable calendar
  [#1631](https://github.com/nextcloud/calendar/pull/1631)
- Do not show recurrence-summary, when the event is not repeating
  [#1632](https://github.com/nextcloud/calendar/pull/1632)
- Update timezone-database to 2019c
  [#1635](https://github.com/nextcloud/calendar/pull/1635)
- Replace with @babel/polyfill with core-js
  [#1634](https://github.com/nextcloud/calendar/pull/1634)
- Fix delay when toggling the all-day checkbox
  [#1637](https://github.com/nextcloud/calendar/pull/1637)
- Fixed missing translatable strings
  [#1639](https://github.com/nextcloud/calendar/pull/1639)
- Promise-related error in Firefox (catch is not a function)
  [#1633](https://github.com/nextcloud/calendar/issues/1633)
- Shared calendar entry to crowded in the navigation
  [#1655](https://github.com/nextcloud/calendar/issues/1655)
- Sharing published link via email doesn't work
  [#1640](https://github.com/nextcloud/calendar/issues/1640)
- Order All-day events by calendar 
  [#760](https://github.com/nextcloud/calendar/issues/769)
- Restructure menu for reminders
  [#1638](https://github.com/nextcloud/calendar/pull/1638)
- Do not show Empty message when clicking the search attendee multiselect
  [#1699](https://github.com/nextcloud/calendar/pull/1699)
- use FullCalendar navLinks
  [#796](https://github.com/nextcloud/calendar/issues/796)
- Replace New Reminder button with Multiselect to allow easier selection of alarm
  [#1701](https://github.com/nextcloud/calendar/pull/1701)

## 2.0.0 beta2 - 2019-11-04
### Added
- Consider categories for illustrations if title doesn't match any illustration
  [#1509](https://github.com/nextcloud/calendar/issues/1509)
- Update Today in calendar-view on day-change
  [#678](https://github.com/nextcloud/calendar/issues/678)
- Show warning when detected timezone is UTC
  [#711](https://github.com/nextcloud/calendar/issues/711)
- Allow to edit location and description in popover editor, if already set
  [#680](https://github.com/nextcloud/calendar/issues/680)
- Better default times when switching from all-day to timed event
  [#532](https://github.com/nextcloud/calendar/issues/532)
- Nicer integration of week-number into calendar-view
  [#1571](https://github.com/nextcloud/calendar/issues/1571)
- Simpler design for upper part of app navigation
  [#1021](https://github.com/nextcloud/calendar/issues/1021)
- Merged calendar-list and subscription list
- Categories
  [#107](https://github.com/nextcloud/calendar/issues/107)
- Hide property info in read-only mode
  [#1585](https://github.com/nextcloud/calendar/issues/1585)
- Do not show all-day checkbox in read-only mode
  [#1589](https://github.com/nextcloud/calendar/issues/1589)
- Add timezone at creation of calendar
  [#223](https://github.com/nextcloud/calendar/issues/223)
- Allow to link to event
  [#21](https://github.com/nextcloud/calendar/issues/21)

### Fixed
- Respect the user's locale
  [#1569](https://github.com/nextcloud/calendar/issues/1569)
- Mixup of locale and language
  [#920](https://github.com/nextcloud/calendar/issues/920)
- Error when selecting visibility in Editor
  [#1591](https://github.com/nextcloud/calendar/issues/1591)
- Show private calendars by default if no visibility is set
  [#1588](https://github.com/nextcloud/calendar/issues/1588)
- Remove title tag from illustration svg
  [#1593](https://github.com/nextcloud/calendar/issues/1593)
- Show more button in upper right corner in popover for read-only events
  [#1592](https://github.com/nextcloud/calendar/issues/1592)
- Event details are not transferred from popover to sidebar
  [#1590](https://github.com/nextcloud/calendar/issues/1590)

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
