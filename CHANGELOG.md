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
