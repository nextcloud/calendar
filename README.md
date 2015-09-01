README
======

[![Build Status](https://scrutinizer-ci.com/g/owncloud/calendar/badges/build.png?b=rework)](https://scrutinizer-ci.com/g/owncloud/calendar/build-status/rework) [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/owncloud/calendar/badges/quality-score.png?b=rework)](https://scrutinizer-ci.com/g/owncloud/calendar/?branch=rework) [![Code Coverage](https://scrutinizer-ci.com/g/owncloud/calendar/badges/coverage.png?b=rework)](https://scrutinizer-ci.com/g/owncloud/calendar/?branch=rework)

This is the calendar rework branch. <br>
It will replace the old calendar code with ownCloud 8 or ownCloud 9. <br>
It's still __in development__, __don't use it in a productive environment__.  <br>
There will be legacy apis, but you should consider implementing new features based on this branch and not based on current master.

### Building JavaScript
Make sure you have node and npm installed on your development machine in order to run the JavaScript tasks.
All commands should be run inside the build directory

**Updating 3rdparty files**
We use bower to manage 3rdparty dependancies in ownCloud calendar. In order to install bower, run,
> npm install -g bower

To run the build tasks, we use gruntjs tasks which can be installed via npm as
> npm install

Building SASS and JS
> grunt build

Watching SASS and JS
> grunt watch

Coming Soon: running JS tests.

