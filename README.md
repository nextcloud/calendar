# Nextcloud Calendar 

[![Build Status](https://travis-ci.org/nextcloud/calendar.svg?branch=master)](https://travis-ci.org/nextcloud/calendar)
[![Coverage Status](https://coveralls.io/repos/github/nextcloud/calendar/badge.svg?branch=master)](https://coveralls.io/github/nextcloud/calendar?branch=master)

**A calendar app for [Nextcloud](http://nextcloud.com). Easily sync events from various devices with your Nextcloud and edit them online.**  

![](https://raw.githubusercontent.com/nextcloud/screenshots/master/apps/Calendar/view_week.png)

## :blue_heart: :tada: Why is this so awesome?

* :rocket: **Integration with other Nextcloud apps!** Currently Contacts and Circles – more to come.
* :globe_with_meridians: **WebCal Support!** Want to see your favorite team's matchdays in your calendar? No problem!
* :raising_hand: **Attendees!** Invite people to your events.
* :alarm_clock: **Reminders!** Get alarms for events inside your browser and via email.
* :see_no_evil: **We’re not reinventing the wheel!** Based on the great [c-dav library](https://github.com/nextcloud/cdav-library), [ical.js](https://github.com/mozilla-comm/ical.js) and [fullcalendar](https://github.com/fullcalendar/fullcalendar) libraries.

And in the works for the [coming versions](https://github.com/nextcloud/calendar/milestones/):
* :mag: Search for events ([#8](https://github.com/nextcloud/calendar/issues/8))
* :watch: See when other attendees are free ([#39](https://github.com/nextcloud/calendar/issues/39))

## :hammer_and_wrench: Installation

In your Nextcloud, simply navigate to »Apps«, choose the category »Organization«, find the Calendar app and enable it.
Then open the Calendar app from the app menu.

## :satellite: Support

If you need assistance or want to ask a question about Calendar, you are welcome to [ask for support](https://help.nextcloud.com/c/apps/calendar) in our Forums or the [IRC-Channel](https://webchat.freenode.net/?channels=nextcloud-calendar).
If you have found a bug, feel free to open a new Issue on GitHub. Keep in mind, that this repository only manages the frontend.
If you find bugs or have problems with the CalDAV-Backend, you should ask the team at [Nextcloud server](https://github.com/nextcloud/server) for help!

## :earth_africa: Supported Browsers

* Chrome/Chromium 76+
* Edge 40+
* Firefox 60+
* Internet Explorer 11
* Safari 12.1+

## Maintainers

- [Georg Ehrke](https://github.com/georgehrke)
- [Thomas Citharel](https://github.com/tcitworld)
- [and many more](https://github.com/nextcloud/calendar/graphs/contributors)

If you’d like to join, just go through the [issue list](https://github.com/nextcloud/calendar/issues?utf8=✓&q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+) and fix some. :)   
We’re also in [#nextcloud-calendar on freenode IRC](https://webchat.freenode.net/?channels=nextcloud-calendar).

We’d like to thank [BrowserStack](https://www.browserstack.com) for providing us with a free subscription.

## Nightly builds / Pre-releases

Instead of setting everything up manually, you can just [download the nightly builds](https://nightly.portknox.net/calendar/?C=M;O=D) or [download a pre-release](https://github.com/nextcloud/calendar/releases) instead.
Nightly builds are updated every 24 hours, and are pre-configured with all the needed dependencies.

1. Download
2. Extract the tar archive to 'path-to-nextcloud/apps'
3. Navigate to »Apps«, choose the category »Productivity«, find the Calendar app and enable it.

The nightly builds are provided by [Portknox.net](https://portknox.net)

When reporting issues, please mention the date in the tar archive's name.

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
