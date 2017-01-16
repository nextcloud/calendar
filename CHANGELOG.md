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
