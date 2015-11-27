/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */


/**
 * This symbol is further described later on
 * @ignore
 */
ICAL.TimezoneService = (function() {
  var zones;

  /**
   * @classdesc
   * Singleton class to contain timezones.  Right now its all manual registry in
   * the future we may use this class to download timezone information or handle
   * loading pre-expanded timezones.
   *
   * @namespace
   * @alias ICAL.TimezoneService
   */
  var TimezoneService = {
    reset: function() {
      zones = Object.create(null);
      var utc = ICAL.Timezone.utcTimezone;

      zones.Z = utc;
      zones.UTC = utc;
      zones.GMT = utc;
    },

    /**
     * Checks if timezone id has been registered.
     *
     * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
     * @return {Boolean}        False, when not present
     */
    has: function(tzid) {
      return !!zones[tzid];
    },

    /**
     * Returns a timezone by its tzid if present.
     *
     * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
     * @return {?ICAL.Timezone} The timezone, or null if not found
     */
    get: function(tzid) {
      return zones[tzid];
    },

    /**
     * Registers a timezone object or component.
     *
     * @param {String=} name
     *        The name of the timezone. Defaults to the component's TZID if not
     *        passed.
     * @param {ICAL.Component|ICAL.Timezone} zone
     *        The initialized zone or vtimezone.
     */
    register: function(name, timezone) {
      if (name instanceof ICAL.Component) {
        if (name.name === 'vtimezone') {
          timezone = new ICAL.Timezone(name);
          name = timezone.tzid;
        }
      }

      if (timezone instanceof ICAL.Timezone) {
        zones[name] = timezone;
      } else {
        throw new TypeError('timezone must be ICAL.Timezone or ICAL.Component');
      }
    },

    /**
     * Removes a timezone by its tzid from the list.
     *
     * @param {String} tzid     Timezone identifier (e.g. America/Los_Angeles)
     * @return {?ICAL.Timezone} The removed timezone, or null if not registered
     */
    remove: function(tzid) {
      return (delete zones[tzid]);
    }
  };

  // initialize defaults
  TimezoneService.reset();

  return TimezoneService;
}());
