README
======

[![Build Status](https://scrutinizer-ci.com/g/owncloud/calendar-rework/badges/build.png?b=master)](https://scrutinizer-ci.com/g/owncloud/calendar-rework/build-status/master)[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/owncloud/calendar-rework/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/owncloud/calendar-rework/?branch=master)[![Code Coverage](https://scrutinizer-ci.com/g/owncloud/calendar-rework/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/owncloud/calendar-rework/?branch=master)
![dependencies](https://david-dm.org/owncloud/calendar-rework.svg)


This is the rework of the calendar app. <br>
It will replace the [old calendar app](https://github.com/owncloud/calendar) with ownCloud 9.0.

It's __in development__, don't use it in production.

### Maintainers:

 - [Georg Ehrke](https://github.com/georgehrke)
 - [Raghu Nayyar](https://github.com/raghunayyar)
 - [Bernhard Fröhler](https://github.com/codeling)

### Joining Development

#### Contributing code

You are a JS or a PHP dev and want to help with the development?

Thanks for wanting to contribute source code to the ownCloud calendar. That's great!

Before you start, we would like to ask you to take a look at the [development manual](https://doc.owncloud.org/server/8.1/developer_manual/app/index.html) to get a rough idea of how stuff works.
Please take a close look at the [coding style guidelines](https://doc.owncloud.org/server/8.1/developer_manual/general/codingguidelines.html) as well.

##### Getting the source code
An app-folder's name must always equal the appid. Be sure the folder is called `calendar`.
> git clone git@github.com:owncloud/calendar-rework.git calendar

##### Contributing code
Please don't push directly into master. We would rather ask you to send pull requests.

In order to constantly increase the quality of our software we can no longer accept pull request which submit un-tested code. It is a must have that changed and added code segments are unit tested.

##### Building JavaScript

In order to modify our javascript, you need to install a few tools.
Please make sure you have [node and npm](https://docs.npmjs.com/getting-started/installing-node) installed on your development machine.

Simply run the following commands to setup your development environment:

```bash
# Install bower for mananing 3rdparty js libs
npm install -g bower

# Install build dependecies
cd js
npm install
```

You have two options for building the javascript code. You can either make your changes and run `grunt build` afterwords or you can start `grunt watch`, which will regenerate the `js/public/app.js` on every save of a file.

#### Testing

You don't know how to code, but want to contribute anyway?

You sure can help us!

Testing is a crucial part of developing software. You can help us by testing the calendar app and providing high-quality bug reports. Please always __use the [issue template](https://raw.githubusercontent.com/owncloud/core/master/issue_template.md)__, __fill out everything__ and be as precise as possible.
Always make sure that you are running the latest version. Search for existing issues before creating new ones, having to deal with duplicate bug reports is a big waste of time for us.
