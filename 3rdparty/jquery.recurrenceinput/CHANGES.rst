Changelog
=========

1.0dev (unreleased)
-------------------

- Fix a condition, where the ``startdate`` string literal was checked, if it's
  an instance of ``String``, which returned False. This led to the case, where
  the list of occurrences wasn't shown. String literals should be checked
  with``typeof`` instead of ``instanceof``.
  See: http://stackoverflow.com/a/203757/3036508
  [thet]

- Fixes an issue introduced with previous change, where the recurrence overlay
  couldn't be opened in cases, the startdate was already a Date object.
  [thet]

- Be a bit more clever about guessing the startdate from the surrounding form.
  Also, convert human-readable, non ISO8601 date strings to something
  interpretable by the Date function, like '2014-04-24 19:00', where the 'T'
  separator is missing.
  [thet]

- Fire change events when rrule value is updated.
  [deiferni]

- Default to one week of daily occurrences, instead of 10.
  [gyst]

- Remove ambiguous recurrence rule checkbox, which lead to UX confusion due to
  double negation (unchecked checkbox said "no recurrence rule") and add
  instead a "Delete" button.
  Fixes: https://github.com/plone/plone.app.event/issues/70
  [thet]

- When there is no recurrence rule, the edit button should show "Add...", not
  "Edit...". Fixes: https://github.com/plone/plone.app.event/issues/43
  [thet]

- Fix ie8 startdate and fire events when changing checkbox values.
  [deiferni]

- Make "repeat forever" button optional.
  [deiferni]

- Fix of parsing error of valid "RRULE:FREQ=MONTHLY;INTERVAL=3;BYDAY=3TH",
  where the missing '+' sign in the BYDAY Weekdaylist was causing the error.
  [Aridor2006]

- Move jquery.recurrenceinput.css from demo/ to src/ directory. This file is
  likely to be needed for integration.
  [thet]

- Backport pbauers fix of "use strict is not a function".
  [thet]


1.0rc1 (2012-10-18)
-------------------

tested with:
* jquery 1.4.2 + jquery tools 1.2.5
* jquery 1.7.2 + jquery tools 1.2.7
* ie 8 (win), chromium 20 (linux), firefox 16 (linux, android)


- fix pull-request #9: recurrence end date not properly saved.
  [aroemen, thet]

- add ributtonextraclass config parameter for setting extra classes on cancel
  and save buttons. this allows frameworks to react on submit for buttons
  marked with a special class.
  [thet]

- add ajaxcontenttype parameter to allow configuring of the content type of the
  ajax request sent to the server for getting the recurrence occurences.
  [thet]

- added ie8 support
  [regebro]

- rewrote the demo/test server as wsgi for increased reliability.
  [regebro]

- setting first day of the week now works.
  [regebro]

- the tests run on chromium 20.
  [regebro]

- moved the localized demo to it's own page, because jquery tools dateinput
  can not have different configurations on one page.
  [regebro]

- a license file was added to be explicit about the licensing.
  [regebro]

- localization of the jquery tools dateinputs and first day configuration
  option added to set which is the first day of the month.
  [vsomogyi]

- fixed a compatibility issue with ie8 and below.
  [dokai]

- by default, preselect the byoccurrences "end recurrence" field, so that
  recurrence rules with unlimited occurences are not selected by accident but
  intentionally.
  [thet]

1.0b1 (2012-02-01)
------------------

Initial release.
