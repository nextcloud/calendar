# Changelog

## 5.0.0 - Unreleased
### Added
- Nextcloud 30 support
- PHP8.1 minimum requirement
- Rooms and resources overview
- New sidebar organisation
- Calendar-wide transparency settings
- Calendar refresh on remote changes
- Widget for private calendars
- Caldav backend requirement
### Changed
- Dropped Nextcloud 29 support
- Dropped support for PHP 8.0
- New design: Material Symbols, general design overhaul
- Reduced CSS opacity for past events
- Circles renamed to Teams
- Automatic widget reloading
- More translations for appointments
- ### Fixed
- Teams missing from placeholder texts

## 4.7.12 - 2024-07-17
### Fixed
- Localisation for Appointments

## 4.7.11 - 2024-07-11
### Fixed
- First day of the week

## 4.7.10 - 2024-07-04
### Fixed
- Broken file sharing

## 4.7.9 - 2024-07-03
### Fixed
- Broken initial state
- Button state on appointment creation

## 4.7.8 - 2024-06-28
### Fixed
- Broken sidebar styles

## 4.7.7 - 2024-06-27
### Fixed
- Appointments logging
- Global styles scope

## 4.7.6 - 2024-06-04
### Fixed
- Default calendar not supporting VEVENTs
- Width of disabled calendar picker, take two
- Calendar picker always choosing default calendar

## 4.7.5 - 2024-06-04
### Fixed
- File picker loading indefinitely
- Width of disabled calendar picker
- Simple editor time zone picker

## 4.7.4 - 2024-05-15
### Fixed
- DISPLAY Alarms not having a DESCRIPTION
- Custom categories

## 4.7.3 - 2024-05-08
### Fixed
- Default calendar not being used for new events

## 4.7.2 - 2024-04-30
### Fixed
- Attachment links

## 4.7.1 - 2024-04-25
### Changed
- Slot booking response

## 4.7.0 - 2024-04-22
### Added
- Ability to invite circles to events
- Custom public calendar subscriptions
- Automatically find free slots for an event
- Calendar widget for publicly shared calendars
### Changed
- Editor redesign
### Fixed
- Find attendees via email address
- Misplaced empty content

## 4.6.5 - 2024-02-15
### Fixed
- "Send Email" checkbox renamed to "Request reply"
- "Invitation sent" rephrased to "Awaiting response"
- Disabled resharing of incoming calendar shares
- Booking date not displayed in appointment booking popover
- Appointment slots not being bookable when the time doesn't fit into duration or increment

## 4.6.4 - 2024-01-18
### Fixed
- Guests being added to talk rooms not open for guests

## 4.6.3 - 2024-01-10
### Fixed
- Rate limit appointment booking and config creation
- Apointment confirmation modal button style
- Filtering in sharing search
- Attachment folder picker opening twice

## 4.6.2 - 2024-01-03
### Fixed
- Uploading attachments in Firefox

## 4.6.1 - 2023-12-21
### Fixed
- Localisation for month view
- From/To order in booking emails
- Alarm not editable when menu is open

## 4.6.0 - 2023-11-30
### Added
- v2 for widget API
- PHP8.3 support
### Changed
- Appointment UI error handling
- Disable adding attendees on shared calendars
- Appointment rooms are now public
### Fixed
- Recurring events on the dashboard
- Event participation when event is updated
- Timezone overlap (Firefox)
- Recurrence error handling
- Toggle overlap
- Locale fallback
- Leaked internal exceptions

## 4.5.3 - 2023-10-07
### Changed
- Participtation status reset for changed events
- Appointment rooms are now public by default
### Fixed
- Internal exception leak
- Missing VTIMEZONE for Appointment ics

## 4.5.2 - 2023-10-02
### Changed
- Reverted persistent custom categories (for now)
### Fixed
- Sidebar toggle overlay for Firefox
- Reocurring events on the dashboard

## 4.5.1 - 2023-09-21
### Fixed
- Sidebar toggle overlay

## 4.5.0 - 2023-09-14
### Added
- Year grid view
- Talk rooms for appointments are back
- Location and description links clickable
- App config option to hide resources tab
### Changed
- Talk url now written to location
- "New event" button renamed to "Event"
- Categories extended to include system tags and already used categories
### Fixed
- Categories for public calendars

## 4.4.5 – 2023–09-07
### Fixed
- Avatars now use placeholders for attendees
- FreeBusy disabled for attendees

## 4.4.4 – 2023–08-03
### Fixed
- Navigation button positioning
- Navigation toggle overlap
- Long email addresses in sharing

## 4.4.3 – 2023–06-29
### Changed
- Frontend now uses NcSelect
### Fixed
- Empty events

## 4.4.2 – 2023–06-12
### Fixed
- Temporarily revert Talk room feature for appointments due to upgrade issues

## 4.4.1 - 2023-06-09
### Fixed
- Allow dynamic autoloading for classes added during upgrade

## 4.4.0 - 2023-06-07
### Added
- Create Talk rooms for appointments
### Changed
- Add back PHP 7.4 support
- Add save button to calendar settings
- Icon for appointment confirmation dialogue
- Include booking person's name in appointment event
- Add server details and ToS link to public sharing page 
### Fixed
- Public sharing footer
- Date formatting in list view
- Import button alignment
- Use locale instead of language
- DAV urls for attachments
- Calendar booking notifications
- Calendar invitees buttons (width and space between)

## 4.3.2 - 2023-04-06
### Fixed
- Attachments folder
- Appointments default visibility
- Sidebar editor timezone
- Share indicator
- Date picker

## 4.3.1 - 2023-03-22
### Changed
- Webpack version

## 4.3.0 - 2023-03-20
### Added
- File attachments for calendar events
- Organizer booking emails
### Changed
- Lazy load dashboard component
- Wider input for recurrences
### Fixed
- Exception handing for booking controller
- Current day color sticker
- Calendar export button
- Share dialogue focus loss
- Disabling appointments
- Color picker

## 4.2.2 - 2023-01-26
### Fixed
- Disabling appointments feature
- can_subscribe_link fallback
- Save and edit methods in calendar modal

## 4.2.1 - 2023-01-05
### Fixed
- Reminder form field width
- Calendar export

## 4.2.0 - 2022-12-29
### Added
- Calendar sharing and settings modal
- Parameters to allow / disallow sharing via link
- Error handling for Widget SVG generation
### Changed
- Set round-icons: true for clients
### Fixed
- Equalize slot booking button width
- Trash bin buttons
- Black calendar icon on dashboard widget in dark mode
- Unclear field label for appointment config
- Typo in meditation.svg
- Duplicate location in booking email
- Widget search results returning past events
- Handling of EMail VALARMs

## 4.1.1 - 2022-12-15
### Fixed
- Disabled timezone popup 
- Style for timezone popup
- Location in booking VEVENT
- Bottom part cut off for public calendar
- Lost app navigation styles
- Delete X-ALT-DESC property when changing description
- Clipboard copy

## 4.1.0 - 2022-11-02
### Added
- IButtonWidget and IIconWidget implementation
### Fixed
- Widget Icon in Dashboard
- Appointment detail styling for small screen
- Appointment overview page design

## 4.0.1 - 2022-10-18
### Changed
- Remove iconfont and associated dependecies
### Fixed
- Appointment overview page design
- Appointment details styling
- Title only added in week view

## 4.0.0 - 2022-10-13
### Added
- New design
- Primary light background to month, week and header
- Booking email with .ics for the event
### Changed
- Drop Nextcloud 22-24 support
- Remove unused icons and icon stylesheets
- Rename elements to items
- More information in booking confirmation email
- Appointments page redesign
### Fixed
- Some translation issues with whitespaces
- Padding of left sidebar header
- Cut off datetime picker in simple editor
- Contrast for day header
- Category Selection
- Missing background color for appoitments

## 3.5.0 - 2022-08-25
### Added
- Option to copy calendar events
- Config setting to disable appointments
### Changed
- Moved icons to material design
- Settings name
### Fixed
- White space on calendar title
- Trashbin layout

## 3.4.3 - 2022-08-23
### Fixed
- Missing events in week view
- Invitee and resource name wrapping
- Relying on guessed mime type on import

## 3.4.2 - 2022-07-07
### Fixed
- Performance issues with Vue Event Rendering
- Settings modal closing when using import

## 3.4.1 - 2022-06-28
### Fixed
- Calendar not loading in month view

## 3.4.0 - 2022-06-21
### Added
- Visually distinguish events with attendees from ones without
- Visually distinguish events with reminders from ones without
- More key events on the simple editor
### Changed
- Drop PHP7.3 support (EOL)
- Drop Nextcloud 21 support (EOL)
- Event rendering now uses Vue
- Appointment booking message
### Fixed
- Logic to extract avatar link from inivitees list
- Missing stylelint
- Hide 3-dot menu button
- Attendee search
- Color dot and event alignment

## 3.3.2 – 2022-06-02
### Fixed
- Squished settings checkbox label

## 3.3.1 – 2022-05-19
### Fixed
- Free/busy view rendering
- Switching view modes
- Search term casing
- Sidebar scrolling

## 3.3.0 - 2022-05-05
### Added
- PHP8.1 compatability
- More uses for the popover modal
### Changed
- Rename "Download" to "Export"
### Fixed
- Crash on Chrome / Chromium for Simple Editor URL
- Invitation response button for readonly events

## 3.2.2 - 2022-03-16
### Fixed
- Email Validation for appointment booking
- Calendar resource attendance state display
- Alarm type selection

## 3.2.1 - 2022-03-14
### Fixed
- Public Calendar Link
- Disabled Calendar Icon
- Missing Translations

## 3.2.0 - 2022-03-09
### Changed
- Allow admins to force an event type
- Allow admins to hide event exports
- Rename 'Download' to 'Export'
### Fixed
- Navigation icon bullet
- Remove dot in plural string
- Remove blurriness from event participation indicator

## 3.1.0 - 2022-02-28
### Added
- Accept & decline invitations from web
- Conflict calendars for appointments
- Limit how far in the future appointments can be booked
### Changed
- Time-insensitive background jobs are now run at off-peak times
- Illustrations for Voting, BBQ, Weddings, etc.
- Calendar monthly and weekly view now grey out days of other months
- Full calendar week view now highlights "Today"
- Date & time picker enhancements - end time now influences start time, lets you choose a time first
- Show the whole title of an event if the display field is large enough
- Metadata for appointments config prep- and followup time
### Removed
- Nextcloud 20 support
- PHP7.2 support
### Fixed
- Accessibility
- Broken appointment modal if destination calendar was deleted
- Fix vertical scrolling issues on mobile devices

## 3.0.6 – 2022-02-16
### Fixed
- Invalid X-APPLE-STRUCTURED-LOCATION on location update
- Trashbin being unavaliable
- Previously ignored DESCRIPTION;ALTREP property

## 3.0.5 – 2022-01-18
### Fixed
- Events being editable locally by attendees reenabled
- Fix reminder time zone picker and formatting

## 3.0.4 – 2021-12-28
### Fixed
- Calendar picker in the editor sidebar

## 3.0.3 – 2021-12-21
### Fixed
- Events editable by anyone
- Time display for short events
- Event title cut off even for long events with enough display space

## 3.0.2 – 2021-12-15
### Fixed
- Previous/next month buttons
- Cancelled and free events cause appointment slot conflicts
- User deletion SQL error
- User doc URL
- Outdated screenshots
- Appointments booking page with mobile browsers

## 3.0.1 - 2021-12-01
### Fixed
- PHP7.2 syntax errors
- Usage of Nextcloud 21+ API on Nextcloud 20
- Vertical padding of the appointments booking page
- White space handling of appointments description

## 3.0.0 – 2021-11-29
### Added
- Appointments - configure your appointment configuration, send out the link or show it on your profile, and let other people book an appointment with you
### Fixed
- Empty calendar widget on dashboard

## 2.4.0 – 2021-11-25
### Added
- Advanced Search for Rooms and Resources
- Room Auto Suggestions for events that will fit all attendees
### Changed
- Design Polishing of Right Sidebar
  - Merged Alarm, Detail and Repeat tab in right sidebar
  - Moved Resources to separate tab
  - Placeholder Text and field heights
  - Timepicker
  - Simplified Simple Editor
  - ...
- Event recurrences
  - Calendar can't be edited any longer
- Dependencies
- Translations
### Fixed
- Sharing: Groups and Principal URIs with spaces and other special characters
- Trashbin timestamp

## 2.3.4 – 2021-09-28
### Fixed
- Event height in weekly view
- Events disappearing from grid
- Movnig calendars on Android
- Missing default status
- Simple editor size
- Sidebar datepicker rendering

## 2.3.3 – 2021-08-30
### Fixed
- Development dependencies shipped with production build
- Missing email address in attendee search

## 2.3.2 – 2021-08-18
### Changed
- Details of editor design
- Make save buttons sticky
- Sort objects in trash bin by newest first
- Size of text fields in event pop-up
### Fixed
- Settings design regressions
- Scrolling for trash bin
- Unusable sidebar on mobile
- List table issues
- Month view issues
- Week view issues
- Rendering of vobject in trash bin
- Missing loading view for trash bin
- Task restoring error handling

## 2.3.1 – 2021-07-14
### Fixed
- Create Talk room for event
- Searching for sharees when resources exist on the back-end
- Removing recurrence rule
- 'Add reminder' dropdown position
- Event repeat multiselect and position on low resolutions
- Timestamps in trash bin view
- Vue prop validation error

## 2.3.0 – 2021-06-29
### Added
- Trash bin for calendars and their events
- Default reminder setting
### Changed
- Event now have a minimum display height
- Rendering of attendees and their state
- Show organizer in free-busy view
- Illustrations
- Show shared calendars by default
- Dropped webcals support (not webcal !)
- Dependencies
- Translations
### Fixed
- Missing right border in month and week view
- Missing date picker
- Principal encoding for sharing with groups with spaces in their name

## 2.2.2 – 2021-05-26
### Fixed
- Unable to pick date in monthly view

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
