# [Presentation of added features] (https://docs.google.com/presentation/d/e/2PACX-1vTXO1JPJStXwyoam5jRlTxTZW9xvVebunE9nHCZHABaqEzuJF_wv_zVtinpG730oX1JpFMD0cr0svfD/pub?start=false&loop=false&delayms=3000)
# Nextcloud Calendar Source

**A calendar app for [Nextcloud](http://nextcloud.com). Easily sync events from various devices with your Nextcloud and edit them online.**  

![](https://raw.githubusercontent.com/nextcloud/screenshots/master/apps/Calendar/view_week.png)

## Why is this so awesome?

* :rocket: **Integration with other Nextcloud apps!** Currently Contacts – more to come.
* :globe_with_meridians: **WebCal Support!** Want to see your favorite team's matchdays in your calendar? No problem!
* :raising_hand: **Attendees!** Invite people to your events.
* :see_no_evil: **We’re not reinventing the wheel!** Based on the great [davclient.js](https://github.com/evert/davclient.js), [ical.js](https://github.com/mozilla-comm/ical.js) and [fullcalendar](https://github.com/fullcalendar/fullcalendar) libraries.

And in the works for the [coming versions](https://github.com/nextcloud/calendar/milestones/):
* :mag: Search for events ([#8](https://github.com/nextcloud/calendar/issues/8))
* :alarm_clock: Get alarms for events inside your browser ([#51](https://github.com/nextcloud/calendar/issues/51))
* :watch: See when other attendees are free ([#39](https://github.com/nextcloud/calendar/issues/39))

## Installation

In your Nextcloud, simply navigate to »Apps«, choose the category »Organization«, find the Calendar app and enable it.
Then open the Calendar app from the app menu.

## Support

Check out our [FAQ](https://github.com/nextcloud/calendar/wiki/FAQs). If you dont find a solution, you are welcome to [ask for support](https://help.nextcloud.com) in our Forums or the IRC-Channel. If you have found a bug, feel free to open a new Issue on GitHub. Keep in mind, that this repository only manages the frontend. If you find bugs or have problems with the CalDAV-Backend, you should ask the guys at [Nextcloud server](https://github.com/nextcloud/server) for help!

## Supported Browsers

* Chrome/Chromium 49+
* Edge 14+
* Firefox 45+
* Internet Explorer 11
* Safari 10+

We don't support Internet Explorer 10 and below. Patches for IE9+ are accepted though.

## Nightly builds

Testing is a great way to contribute without having to write source code.
Although it's straight forward, setting up the development environment requires some knowledge and extra tools on your device.

We provide [nightly builds](https://nightly.portknox.net/calendar/?C=M;O=D) to enable everyone help testing without setting up the development environment.  

1. Download
2. Extract the tar archive to 'path-to-nextcloud/apps'
3. Navigate to »Apps«, choose the category »Productivity«, find the Calendar app and enable it.

The nightly builds are provided by [Portknox.net](https://portknox.net)

When reporting issues, please mention the date in the tar archive's name.

## Maintainers

[Georg Ehrke](https://github.com/georgehrke), [Raghu Nayyar](https://github.com/raghunayyar), [Thomas Citharel](https://github.com/tcitworld) [and many more](https://github.com/nextcloud/calendar/graphs/contributors)

If you’d like to join, just go through the [issue list](https://github.com/nextcloud/calendar/issues?q=is%3Aopen+is%3Aissue+label%3A%22starter+issue%22) and fix some. :)   
We’re also in [#nextcloud-calendar on freenode IRC](https://webchat.freenode.net/?channels=nextcloud-calendar).

We’d like to thank [BrowserStack](https://www.browserstack.com) for providing us with a free subscription.

## Developer setup info

Just clone this repo into your apps directory (Nextcloud server installation needed). Additionally,  [nodejs (>=6)](https://nodejs.org/en/download/package-manager/) and [yarn](http://yarnpkg.com) are needed for installing JavaScript dependencies.

Once node and yarn are installed, PHP and JavaScript dependencies can be installed by running
```bash
$ make
```
Please execute this command with your ordinary user account and neither root nor sudo.
