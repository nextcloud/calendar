/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2015 */

"use strict";

(function() {

  /**
   * Describes a vCard time, which has slight differences to the ICAL.Time.
   * Properties can be null if not specified, for example for dates with
   * reduced accuracy or truncation.
   *
   * Note that currently not all methods are correctly re-implemented for
   * VCardTime. For example, comparison will have undefined results when some
   * members are null.
   *
   * Also, normalization is not yet implemented for this class!
   *
   * @alias ICAL.VCardTime
   * @class
   * @extends {ICAL.Time}
   * @param {Object} data                           The data for the time instance
   * @param {Number=} data.year                     The year for this date
   * @param {Number=} data.month                    The month for this date
   * @param {Number=} data.day                      The day for this date
   * @param {Number=} data.hour                     The hour for this date
   * @param {Number=} data.minute                   The minute for this date
   * @param {Number=} data.second                   The second for this date
   * @param {ICAL.Timezone|ICAL.UtcOffset} zone     The timezone to use
   * @param {String} icaltype                       The type for this date/time object
   */
  ICAL.VCardTime = function(data, zone, icaltype) {
    this.wrappedJSObject = this;
    var time = this._time = Object.create(null);

    time.year = null;
    time.month = null;
    time.day = null;
    time.hour = null;
    time.minute = null;
    time.second = null;

    this.icaltype = icaltype || "date-and-or-time";

    this.fromData(data, zone);
  };
  ICAL.helpers.inherits(ICAL.Time, ICAL.VCardTime, /** @lends ICAL.VCardTime */ {

    /**
     * The class identifier.
     * @constant
     * @type {String}
     * @default "vcardtime"
     */
    icalclass: "vcardtime",

    /**
     * The type name, to be used in the jCal object.
     * @type {String}
     * @default "date-and-or-time"
     */
    icaltype: "date-and-or-time",

    /**
     * The timezone. This can either be floating, UTC, or an instance of
     * ICAL.UtcOffset.
     * @type {ICAL.Timezone|ICAL.UtcOFfset}
     */
    zone: null,

    /**
     * Returns a clone of the vcard date/time object.
     *
     * @return {ICAL.VCardTime}     The cloned object
     */
    clone: function() {
      return new ICAL.VCardTime(this._time, this.zone, this.icaltype);
    },

    _normalize: function() {
      return this;
    },

    /**
     * @inheritdoc
     */
    utcOffset: function() {
      if (this.zone instanceof ICAL.UtcOffset) {
        return this.zone.toSeconds();
      } else {
        return ICAL.Time.prototype.utcOffset.apply(this, arguments);
      }
    },

    /**
     * Returns an RFC 6350 compliant representation of this object.
     *
     * @return {String}         vcard date/time string
     */
    toICALString: function() {
      return ICAL.design.vcard.value[this.icaltype].toICAL(this.toString());
    },

    /**
     * The string representation of this date/time, in jCard form
     * (including : and - separators).
     * @return {String}
     */
    toString: function toString() {
      var p2 = ICAL.helpers.pad2;
      var y = this.year, m = this.month, d = this.day;
      var h = this.hour, mm = this.minute, s = this.second;

      var hasYear = y !== null, hasMonth = m !== null, hasDay = d !== null;
      var hasHour = h !== null, hasMinute = mm !== null, hasSecond = s !== null;

      var datepart = (hasYear ? p2(y) + (hasMonth || hasDay ? '-' : '') : (hasMonth || hasDay ? '--' : '')) +
                     (hasMonth ? p2(m) : '') +
                     (hasDay ? '-' + p2(d) : '');
      var timepart = (hasHour ? p2(h) : '-') + (hasHour && hasMinute ? ':' : '') +
                     (hasMinute ? p2(mm) : '') + (!hasHour && !hasMinute ? '-' : '') +
                     (hasMinute && hasSecond ? ':' : '') +
                     (hasSecond ? p2(s) : '');

      var zone;
      if (this.zone === ICAL.Timezone.utcTimezone) {
        zone = 'Z';
      } else if (this.zone instanceof ICAL.UtcOffset) {
        zone = this.zone.toString();
      } else if (this.zone === ICAL.Timezone.localTimezone) {
        zone = '';
      } else if (this.zone instanceof ICAL.Timezone) {
        var offset = ICAL.UtcOffset.fromSeconds(this.zone.utcOffset(this));
        zone = offset.toString();
      } else {
        zone = '';
      }

      switch (this.icaltype) {
        case "time":
          return timepart + zone;
        case "date-and-or-time":
        case "date-time":
          return datepart + (timepart == '--' ? '' : 'T' + timepart + zone);
        case "date":
          return datepart;
      }
      return null;
    }
  });

  /**
   * Returns a new ICAL.VCardTime instance from a date and/or time string.
   *
   * @param {String} aValue     The string to create from
   * @param {String} aIcalType  The type for this instance, e.g. date-and-or-time
   * @return {ICAL.VCardTime}   The date/time instance
   */
  ICAL.VCardTime.fromDateAndOrTimeString = function(aValue, aIcalType) {
    function part(v, s, e) {
      return v ? ICAL.helpers.strictParseInt(v.substr(s, e)) : null;
    }
    var parts = aValue.split('T');
    var dt = parts[0], tmz = parts[1];
    var splitzone = tmz ? ICAL.design.vcard.value.time._splitZone(tmz) : [];
    var zone = splitzone[0], tm = splitzone[1];

    var stoi = ICAL.helpers.strictParseInt;
    var dtlen = dt ? dt.length : 0;
    var tmlen = tm ? tm.length : 0;

    var hasDashDate = dt && dt[0] == '-' && dt[1] == '-';
    var hasDashTime = tm && tm[0] == '-';

    var o = {
      year: hasDashDate ? null : part(dt, 0, 4),
      month: hasDashDate && (dtlen == 4 || dtlen == 7) ? part(dt, 2, 2) : dtlen == 7 ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 5, 2) : null,
      day: dtlen == 5 ? part(dt, 3, 2) : dtlen == 7 && hasDashDate ? part(dt, 5, 2) : dtlen == 10 ? part(dt, 8, 2) : null,

      hour: hasDashTime ? null : part(tm, 0, 2),
      minute: hasDashTime && tmlen == 3 ? part(tm, 1, 2) : tmlen > 4 ? hasDashTime ? part(tm, 1, 2) : part(tm, 3, 2) : null,
      second: tmlen == 4 ? part(tm, 2, 2) : tmlen == 6 ? part(tm, 4, 2) : tmlen == 8 ? part(tm, 6, 2) : null
    };

    if (zone == 'Z') {
      zone = ICAL.Timezone.utcTimezone;
    } else if (zone && zone[3] == ':') {
      zone = ICAL.UtcOffset.fromString(zone);
    } else {
      zone = null;
    }

    return new ICAL.VCardTime(o, zone, aIcalType);
  };
})();
