<!--
Please report only issues corresponding to the calendar for Nextcloud 9 or later.
The old calendar 0.x is discontinued!

Migration and CalDAV issues belong in the server repo!
https://github.com/nextcloud/server/issues
-->
### Steps to reproduce
1.
2.
3.

### Expected behaviour
Tell us what should happen

### Actual behaviour
Tell us what happens instead

### Server configuration
<!--
You can use the Issue Template application to prefill most of the required information: https://apps.nextcloud.com/apps/issuetemplate
-->

**Operating system**:

**Web server:**

**Database:**

**PHP version:**

**Server version:** (see your admin page)

**Calendar version:** (see the apps page)

**Updated from an older installed version or fresh install:**

**Signing status (ownCloud/Nextcloud 9.0 and above):**

```
Login as admin user into your cloud and access
http://example.com/index.php/settings/integrity/failed
paste the results here.
```

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

**Are you using external storage, if yes which one:** local/smb/sftp/...

**Are you using encryption:** yes/no

**Are you using an external user-backend, if yes which one:** LDAP/ActiveDirectory/Webdav/...

#### LDAP configuration (delete this part if not used)

```
With access to your command line run e.g.:
sudo -u www-data php occ ldap:show-config
from within your instance's installation folder

Without access to your command line download the data/owncloud.db to your local
computer or access your SQL server remotely and run the select query:
SELECT * FROM `oc_appconfig` WHERE `appid` = 'user_ldap';


Be sure to replace sensitive data as the name/IP-address of your LDAP server or groups.
```

### Client configuration
**Browser:**

**Operating system:**

**CalDAV-clients:**

### Logs
#### Web server error log
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
