# Nextcloud Calendar 

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/nextcloud/calendar/Build)
![Codecov](https://img.shields.io/codecov/c/github/nextcloud/calendar)

**A calendar app for [Nextcloud](http://nextcloud.com). Easily sync events from various devices with your Nextcloud and edit them online.**  

![](https://raw.githubusercontent.com/nextcloud/screenshots/master/apps/Calendar/view_week.png)

## :blue_heart: :tada: Why is this so awesome?

* :rocket: **Integration with other Nextcloud apps!** Like Contacts, Talk, Tasks, Deck and Circles
* :globe_with_meridians: **WebCal Support!** Want to see your favorite team's matchdays in your calendar? No problem!
* :raising_hand: **Attendees!** Invite people to your events
* :watch: **Free/Busy!** See when your attendees are available to meet
* :alarm_clock: **Reminders!** Get alarms for events inside your browser and via email
* :mag: **Search!** Find your events at ease
* :ballot_box_with_check: **Tasks!** See tasks or Deck cards with a due date directly in the calendar
* :speaker: **Talk rooms!** Create an associated Talk room when booking a meeting with just one click
* :calendar: **Appointment booking** Send people a link so they can book an appointment with you [using this app](https://apps.nextcloud.com/apps/appointments)
* :see_no_evil: **We’re not reinventing the wheel!** Based on the great [c-dav library](https://github.com/nextcloud/cdav-library), [ical.js](https://github.com/mozilla-comm/ical.js) and [fullcalendar](https://github.com/fullcalendar/fullcalendar) libraries.


## :hammer_and_wrench: Installation

The app is distributed through the [app store](https://apps.nextcloud.com/apps/calendar) and you can install it [right from your Nextcloud installation](https://docs.nextcloud.com/server/stable/admin_manual/apps_management.html).

Release tarballs are hosted at https://github.com/nextcloud-releases/calendar/releases.

## :satellite: Support

If you need assistance or want to ask a question about Calendar, you are welcome to [ask for support](https://help.nextcloud.com/c/apps/calendar) in our Forums.
If you have found a bug, feel free to open a new Issue on GitHub. Keep in mind, that this repository only manages the frontend.
If you find bugs or have problems with the CalDAV-Backend, you should ask the team at [Nextcloud server](https://github.com/nextcloud/server) for help!

## :earth_africa: Supported Browsers

* Chrome/Chromium 76+
* Edge 40+
* Firefox 60+
* Internet Explorer 11
* Safari 12.1+

## Maintainers

* [Nextcloud Groupware team](https://github.com/nextcloud/groupware/#members)

## Build the app

``` bash
# set up and build for production
make

# install dependencies
make dev-setup

# build for dev and watch changes
make watch-js

# build for dev
make build-js

# build for production with minification
make build-js-production

```
## Running tests
You can use the provided Makefile to run all tests by using:

```
make test
```

## :v: Code of conduct

The Nextcloud community has core values that are shared between all members during conferences,
hackweeks and on all interactions in online platforms including [Github](https://github.com/nextcloud) and [Forums](https://help.nextcloud.com).
If you contribute, participate or interact with this community, please respect [our shared values](https://nextcloud.com/code-of-conduct/). :relieved:

## :heart: How to create a pull request

This guide will help you get started: 
- :dancer: :smile: [Opening a pull request](https://opensource.guide/how-to-contribute/#opening-a-pull-request) 
