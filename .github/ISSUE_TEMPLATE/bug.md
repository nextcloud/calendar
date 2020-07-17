---
name: 🐛 Bug
about: Have you encountered a bug?
title: ''
labels: bug, 0. to triage
assignees: ''
version: 0.1
---

<!--
Thanks for reporting issues back to Nextcloud! This is the issue tracker of Nextcloud, if you have any support question please check out https://nextcloud.com/support

This is the bug tracker for the web-calendar component. Find other components at https://github.com/nextcloud/
Everything that is related to the CalDAV server, meaning it does not only affect the web-calendar but also your mobile and desktop clients, belongs in the Server repository: https://github.com/nextcloud/server

For reporting potential security issues please see https://nextcloud.com/security/

To make it possible for us to help you please fill out below information carefully. 
You can also use the Issue Template application to prefill most of the required information: https://apps.nextcloud.com/apps/issuetemplate

If you are a customer, please submit your issue directly in the Nextcloud Portal https://portal.nextcloud.com so it gets resolved more quickly by our dedicated engineers.

Note that Nextcloud is an open source project backed by Nextcloud GmbH. Most of our volunteers are home users and thus primarily care about issues that affect home users. Our paid engineers prioritize issues of our customers. If you are neither a home user nor a customer, consider paying somebody to fix your issue, do it yourself or become a customer.
--> 

### Steps to reproduce
1.
2.
3.

### Expected behaviour
Tell us what should happen

### Actual behaviour
Tell us what happens instead

### Calendar app
**Calendar app version:** (see apps admin page, e.g. 2.0.1)

**CalDAV-clients used:** (Thunderbird Lightning, DAVx5, Evolution, macOS Calendar, etc)

### Client configuration
**Browser:** (e.g. Firefox 48)

**Operating system:** (e.g. Arch Linux)

### Server configuration

**Operating system**: (e.g. Debian 8)

**Web server:** (e.g. Apache, Nginx,...)

**Database:** (e.g. MariaDB, SQLite or PostgreSQL)

**PHP version:** (e.g. 7.0.3)

**Nextcloud Version:** (see admin page, e.g. 17.0.2)

**Updated from an older installed version or fresh install:**

**List of activated apps:**

```
If you have access to your command line run e.g.:
sudo -u www-data php occ app:list
from within your instance's installation folder
```

**Nextcloud configuration:**

```
If you have access to your command line run e.g.:
sudo -u www-data php occ config:list system
from within your instance's installation folder

or

Insert your config.php content here
Make sure to remove all sensitive content such as passwords. (e.g. database password, passwordsalt, secret, smtp password, …)
```

### Logs
#### Web server error log (e.g. /var/log/apache)
```
Insert your webserver log here
```

#### Log file (data/nextcloud.log)
```
Insert your nextcloud.log file here
```

#### Browser log
```
Insert your browser log here, this could for example include:

a) The javascript console log
b) The network log
c) ...
```
