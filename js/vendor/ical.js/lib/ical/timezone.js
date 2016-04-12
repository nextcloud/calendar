/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2012 */

"use strict";

(function() {
  var OPTIONS = ["tzid", "location", "tznames",
                 "latitude", "longitude"];

  /**
   * @classdesc
   * Timezone representation, created by passing in a tzid and component.
   *
   * @example
   * var vcalendar;
   * var timezoneComp = vcalendar.getFirstSubcomponent('vtimezone');
   * var tzid = timezoneComp.getFirstPropertyValue('tzid');
   *
   * var timezone = new ICAL.Timezone({
   *   component: timezoneComp,
   *   tzid
   * });
   *
   * @class
   * @param {ICAL.Component|Object} data options for class
   * @param {String|ICAL.Component} data.component
   *        If data is a simple object, then this member can be set to either a
   *        string containing the component data, or an already parsed
   *        ICAL.Component
   * @param {String} data.tzid      The timezone identifier
   * @param {String} data.location  The timezone locationw
   * @param {String} data.tznames   An alternative string representation of the
   *                                  timezone
   * @param {Number} data.latitude  The latitude of the timezone
   * @param {Number} data.longitude The longitude of the timezone
   */
  ICAL.Timezone = function icaltimezone(data) {
    this.wrappedJSObject = this;
    this.fromData(data);
  };

  ICAL.Timezone.prototype = {

    /**
     * Timezone identifier
     * @type {String}
     */
    tzid: "",

    /**
     * Timezone location
     * @type {String}
     */
    location: "",

    /**
     * Alternative timezone name, for the string representation
     * @type {String}
     */
    tznames: "",

    /**
     * The primary latitude for the timezone.
     * @type {Number}
     */
    latitude: 0.0,

    /**
     * The primary longitude for the timezone.
     * @type {Number}
     */
    longitude: 0.0,

    /**
     * The vtimezone component for this timezone.
     * @type {ICAL.Component}
     */
    component: null,

    /**
     * The year this timezone has been expanded to. All timezone transition
     * dates until this year are known and can be used for calculation
     *
     * @private
     * @type {Number}
     */
    expandedUntilYear: 0,

    /**
     * The class identifier.
     * @constant
     * @type {String}
     * @default "icaltimezone"
     */
    icalclass: "icaltimezone",

    /**
     * Sets up the current instance using members from the passed data object.
     *
     * @param {ICAL.Component|Object} aData options for class
     * @param {String|ICAL.Component} aData.component
     *        If aData is a simple object, then this member can be set to either a
     *        string containing the component data, or an already parsed
     *        ICAL.Component
     * @param {String} aData.tzid      The timezone identifier
     * @param {String} aData.location  The timezone locationw
     * @param {String} aData.tznames   An alternative string representation of the
     *                                  timezone
     * @param {Number} aData.latitude  The latitude of the timezone
     * @param {Number} aData.longitude The longitude of the timezone
     */
    fromData: function fromData(aData) {
      this.expandedUntilYear = 0;
      this.changes = [];

      if (aData instanceof ICAL.Component) {
        // Either a component is passed directly
        this.component = aData;
      } else {
        // Otherwise the component may be in the data object
        if (aData && "component" in aData) {
          if (typeof aData.component == "string") {
            // If a string was passed, parse it as a component
            var jCal = ICAL.parse(aData.component);
            this.component = new ICAL.Component(jCal);
          } else if (aData.component instanceof ICAL.Component) {
            // If it was a component already, then just set it
            this.component = aData.component;
          } else {
            // Otherwise just null out the component
            this.component = null;
          }
        }

        // Copy remaining passed properties
        for (var key in OPTIONS) {
          /* istanbul ignore else */
          if (OPTIONS.hasOwnProperty(key)) {
            var prop = OPTIONS[key];
            if (aData && prop in aData) {
              this[prop] = aData[prop];
            }
          }
        }
      }

      // If we have a component but no TZID, attempt to get it from the
      // component's properties.
      if (this.component instanceof ICAL.Component && !this.tzid) {
        this.tzid = this.component.getFirstPropertyValue('tzid');
      }

      return this;
    },

    /**
     * Finds the utcOffset the given time would occur in this timezone.
     *
     * @param {ICAL.Time} tt        The time to check for
     * @return {Number} utc offset in seconds
     */
    utcOffset: function utcOffset(tt) {
      if (this == ICAL.Timezone.utcTimezone || this == ICAL.Timezone.localTimezone) {
        return 0;
      }

      this._ensureCoverage(tt.year);

      if (!this.changes.length) {
        return 0;
      }

      var tt_change = {
        year: tt.year,
        month: tt.month,
        day: tt.day,
        hour: tt.hour,
        minute: tt.minute,
        second: tt.second
      };

      var change_num = this._findNearbyChange(tt_change);
      var change_num_to_use = -1;
      var step = 1;

      // TODO: replace with bin search?
      for (;;) {
        var change = ICAL.helpers.clone(this.changes[change_num], true);
        if (change.utcOffset < change.prevUtcOffset) {
          ICAL.Timezone.adjust_change(change, 0, 0, 0, change.utcOffset);
        } else {
          ICAL.Timezone.adjust_change(change, 0, 0, 0,
                                          change.prevUtcOffset);
        }

        var cmp = ICAL.Timezone._compare_change_fn(tt_change, change);

        if (cmp >= 0) {
          change_num_to_use = change_num;
        } else {
          step = -1;
        }

        if (step == -1 && change_num_to_use != -1) {
          break;
        }

        change_num += step;

        if (change_num < 0) {
          return 0;
        }

        if (change_num >= this.changes.length) {
          break;
        }
      }

      var zone_change = this.changes[change_num_to_use];
      var utcOffset_change = zone_change.utcOffset - zone_change.prevUtcOffset;

      if (utcOffset_change < 0 && change_num_to_use > 0) {
        var tmp_change = ICAL.helpers.clone(zone_change, true);
        ICAL.Timezone.adjust_change(tmp_change, 0, 0, 0,
                                        tmp_change.prevUtcOffset);

        if (ICAL.Timezone._compare_change_fn(tt_change, tmp_change) < 0) {
          var prev_zone_change = this.changes[change_num_to_use - 1];

          var want_daylight = false; // TODO

          if (zone_change.is_daylight != want_daylight &&
              prev_zone_change.is_daylight == want_daylight) {
            zone_change = prev_zone_change;
          }
        }
      }

      // TODO return is_daylight?
      return zone_change.utcOffset;
    },

    _findNearbyChange: function icaltimezone_find_nearby_change(change) {
      // find the closest match
      var idx = ICAL.helpers.binsearchInsert(
        this.changes,
        change,
        ICAL.Timezone._compare_change_fn
      );

      if (idx >= this.changes.length) {
        return this.changes.length - 1;
      }

      return idx;
    },

    _ensureCoverage: function(aYear) {
      if (ICAL.Timezone._minimumExpansionYear == -1) {
        var today = ICAL.Time.now();
        ICAL.Timezone._minimumExpansionYear = today.year;
      }

      var changesEndYear = aYear;
      if (changesEndYear < ICAL.Timezone._minimumExpansionYear) {
        changesEndYear = ICAL.Timezone._minimumExpansionYear;
      }

      changesEndYear += ICAL.Timezone.EXTRA_COVERAGE;

      if (changesEndYear > ICAL.Timezone.MAX_YEAR) {
        changesEndYear = ICAL.Timezone.MAX_YEAR;
      }

      if (!this.changes.length || this.expandedUntilYear < aYear) {
        var subcomps = this.component.getAllSubcomponents();
        var compLen = subcomps.length;
        var compIdx = 0;

        for (; compIdx < compLen; compIdx++) {
          this._expandComponent(
            subcomps[compIdx], changesEndYear, this.changes
          );
        }

        this.changes.sort(ICAL.Timezone._compare_change_fn);
        this.expandedUntilYear = changesEndYear;
      }
    },

    _expandComponent: function(aComponent, aYear, changes) {
      if (!aComponent.hasProperty("dtstart") ||
          !aComponent.hasProperty("tzoffsetto") ||
          !aComponent.hasProperty("tzoffsetfrom")) {
        return null;
      }

      var dtstart = aComponent.getFirstProperty("dtstart").getFirstValue();
      var change;

      function convert_tzoffset(offset) {
        return offset.factor * (offset.hours * 3600 + offset.minutes * 60);
      }

      function init_changes() {
        var changebase = {};
        changebase.is_daylight = (aComponent.name == "daylight");
        changebase.utcOffset = convert_tzoffset(
          aComponent.getFirstProperty("tzoffsetto").getFirstValue()
        );

        changebase.prevUtcOffset = convert_tzoffset(
          aComponent.getFirstProperty("tzoffsetfrom").getFirstValue()
        );

        return changebase;
      }

      if (!aComponent.hasProperty("rrule") && !aComponent.hasProperty("rdate")) {
        change = init_changes();
        change.year = dtstart.year;
        change.month = dtstart.month;
        change.day = dtstart.day;
        change.hour = dtstart.hour;
        change.minute = dtstart.minute;
        change.second = dtstart.second;

        ICAL.Timezone.adjust_change(change, 0, 0, 0,
                                        -change.prevUtcOffset);
        changes.push(change);
      } else {
        var props = aComponent.getAllProperties("rdate");
        for (var rdatekey in props) {
          /* istanbul ignore if */
          if (!props.hasOwnProperty(rdatekey)) {
            continue;
          }
          var rdate = props[rdatekey];
          var time = rdate.getFirstValue();
          change = init_changes();

          change.year = time.year;
          change.month = time.month;
          change.day = time.day;

          if (time.isDate) {
            change.hour = dtstart.hour;
            change.minute = dtstart.minute;
            change.second = dtstart.second;

            if (dtstart.zone != ICAL.Timezone.utcTimezone) {
              ICAL.Timezone.adjust_change(change, 0, 0, 0,
                                              -change.prevUtcOffset);
            }
          } else {
            change.hour = time.hour;
            change.minute = time.minute;
            change.second = time.second;

            if (time.zone != ICAL.Timezone.utcTimezone) {
              ICAL.Timezone.adjust_change(change, 0, 0, 0,
                                              -change.prevUtcOffset);
            }
          }

          changes.push(change);
        }

        var rrule = aComponent.getFirstProperty("rrule");

        if (rrule) {
          rrule = rrule.getFirstValue();
          change = init_changes();

          if (rrule.until && rrule.until.zone == ICAL.Timezone.utcTimezone) {
            rrule.until.adjust(0, 0, 0, change.prevUtcOffset);
            rrule.until.zone = ICAL.Timezone.localTimezone;
          }

          var iterator = rrule.iterator(dtstart);

          var occ;
          while ((occ = iterator.next())) {
            change = init_changes();
            if (occ.year > aYear || !occ) {
              break;
            }

            change.year = occ.year;
            change.month = occ.month;
            change.day = occ.day;
            change.hour = occ.hour;
            change.minute = occ.minute;
            change.second = occ.second;
            change.isDate = occ.isDate;

            ICAL.Timezone.adjust_change(change, 0, 0, 0,
                                            -change.prevUtcOffset);
            changes.push(change);
          }
        }
      }

      return changes;
    },

    /**
     * The string representation of this timezone.
     * @return {String}
     */
    toString: function toString() {
      return (this.tznames ? this.tznames : this.tzid);
    }
  };

  ICAL.Timezone._compare_change_fn = function icaltimezone_compare_change_fn(a, b) {
    if (a.year < b.year) return -1;
    else if (a.year > b.year) return 1;

    if (a.month < b.month) return -1;
    else if (a.month > b.month) return 1;

    if (a.day < b.day) return -1;
    else if (a.day > b.day) return 1;

    if (a.hour < b.hour) return -1;
    else if (a.hour > b.hour) return 1;

    if (a.minute < b.minute) return -1;
    else if (a.minute > b.minute) return 1;

    if (a.second < b.second) return -1;
    else if (a.second > b.second) return 1;

    return 0;
  };

  /**
   * Convert the date/time from one zone to the next.
   *
   * @param {ICAL.Time} tt                  The time to convert
   * @param {ICAL.Timezone} from_zone       The source zone to convert from
   * @param {ICAL.Timezone} to_zone         The target zone to conver to
   * @return {ICAL.Time}                    The converted date/time object
   */
  ICAL.Timezone.convert_time = function icaltimezone_convert_time(tt, from_zone, to_zone) {
    if (tt.isDate ||
        from_zone.tzid == to_zone.tzid ||
        from_zone == ICAL.Timezone.localTimezone ||
        to_zone == ICAL.Timezone.localTimezone) {
      tt.zone = to_zone;
      return tt;
    }

    var utcOffset = from_zone.utcOffset(tt);
    tt.adjust(0, 0, 0, - utcOffset);

    utcOffset = to_zone.utcOffset(tt);
    tt.adjust(0, 0, 0, utcOffset);

    return null;
  };

  /**
   * Creates a new ICAL.Timezone instance from the passed data object.
   *
   * @param {ICAL.Component|Object} aData options for class
   * @param {String|ICAL.Component} aData.component
   *        If aData is a simple object, then this member can be set to either a
   *        string containing the component data, or an already parsed
   *        ICAL.Component
   * @param {String} aData.tzid      The timezone identifier
   * @param {String} aData.location  The timezone locationw
   * @param {String} aData.tznames   An alternative string representation of the
   *                                  timezone
   * @param {Number} aData.latitude  The latitude of the timezone
   * @param {Number} aData.longitude The longitude of the timezone
   */
  ICAL.Timezone.fromData = function icaltimezone_fromData(aData) {
    var tt = new ICAL.Timezone();
    return tt.fromData(aData);
  };

  /**
   * The instance describing the UTC timezone
   * @type {ICAL.Timezone}
   * @constant
   * @instance
   */
  ICAL.Timezone.utcTimezone = ICAL.Timezone.fromData({
    tzid: "UTC"
  });

  /**
   * The instance describing the local timezone
   * @type {ICAL.Timezone}
   * @constant
   * @instance
   */
  ICAL.Timezone.localTimezone = ICAL.Timezone.fromData({
    tzid: "floating"
  });

  /**
   * Adjust a timezone change object.
   * @private
   * @param {Object} change     The timezone change object
   * @param {Number} days       The extra amount of days
   * @param {Number} hours      The extra amount of hours
   * @param {Number} minutes    The extra amount of minutes
   * @param {Number} seconds    The extra amount of seconds
   */
  ICAL.Timezone.adjust_change = function icaltimezone_adjust_change(change, days, hours, minutes, seconds) {
    return ICAL.Time.prototype.adjust.call(
      change,
      days,
      hours,
      minutes,
      seconds,
      change
    );
  };

  ICAL.Timezone._minimumExpansionYear = -1;
  ICAL.Timezone.MAX_YEAR = 2035; // TODO this is because of time_t, which we don't need. Still usefull?
  ICAL.Timezone.EXTRA_COVERAGE = 5;
})();
