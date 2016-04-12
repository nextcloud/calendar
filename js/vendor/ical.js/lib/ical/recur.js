/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */

"use strict";

(function() {
  var DOW_MAP = {
    SU: ICAL.Time.SUNDAY,
    MO: ICAL.Time.MONDAY,
    TU: ICAL.Time.TUESDAY,
    WE: ICAL.Time.WEDNESDAY,
    TH: ICAL.Time.THURSDAY,
    FR: ICAL.Time.FRIDAY,
    SA: ICAL.Time.SATURDAY
  };

  var REVERSE_DOW_MAP = {};
  for (var key in DOW_MAP) {
    /* istanbul ignore else */
    if (DOW_MAP.hasOwnProperty(key)) {
      REVERSE_DOW_MAP[DOW_MAP[key]] = key;
    }
  }

  var COPY_PARTS = ["BYSECOND", "BYMINUTE", "BYHOUR", "BYDAY",
                    "BYMONTHDAY", "BYYEARDAY", "BYWEEKNO",
                    "BYMONTH", "BYSETPOS"];

  /**
   * @classdesc
   * This class represents the "recur" value type, with various calculation
   * and manipulation methods.
   *
   * @class
   * @alias ICAL.Recur
   * @param {Object} data                       An object with members of the recurrence
   * @param {ICAL.Recur.frequencyValues} freq   The frequency value
   * @param {Number=} data.interval             The INTERVAL value
   * @param {ICAL.Time.weekDay=} data.wkst      The week start value
   * @param {ICAL.Time=} data.until             The end of the recurrence set
   * @param {Number=} data.count                The number of occurrences
   * @param {Array.<Number>=} data.bysecond     The seconds for the BYSECOND part
   * @param {Array.<Number>=} data.byminute     The minutes for the BYMINUTE part
   * @param {Array.<Number>=} data.byhour       The hours for the BYHOUR part
   * @param {Array.<String>=} data.byday        The BYDAY values
   * @param {Array.<Number>=} data.bymonthday   The days for the BYMONTHDAY part
   * @param {Array.<Number>=} data.byyearday    The days for the BYYEARDAY part
   * @param {Array.<Number>=} data.byweekno     The weeks for the BYWEEKNO part
   * @param {Array.<Number>=} data.bymonth      The month for the BYMONTH part
   * @param {Array.<Number>=} data.bysetpos     The positionals for the BYSETPOS part
   */
  ICAL.Recur = function icalrecur(data) {
    this.wrappedJSObject = this;
    this.parts = {};

    if (data && typeof(data) === 'object') {
      this.fromData(data);
    }
  };

  ICAL.Recur.prototype = {
    /**
     * An object holding the BY-parts of the recurrence rule
     * @type {Object}
     */
    parts: null,

    /**
     * The interval value for the recurrence rule.
     * @type {Number}
     */
    interval: 1,

    /**
     * The week start day
     *
     * @type {ICAL.Time.weekDay}
     * @default ICAL.Time.MONDAY
     */
    wkst: ICAL.Time.MONDAY,

    /**
     * The end of the recurrence
     * @type {?ICAL.Time}
     */
    until: null,

    /**
     * The maximum number of occurrences
     * @type {?Number}
     */
    count: null,

    /**
     * The frequency value.
     * @type {ICAL.Recur.frequencyValues}
     */
    freq: null,

    /**
     * The class identifier.
     * @constant
     * @type {String}
     * @default "icalrecur"
     */
    icalclass: "icalrecur",

    /**
     * The type name, to be used in the jCal object.
     * @constant
     * @type {String}
     * @default "recur"
     */
    icaltype: "recur",

    /**
     * Create a new iterator for this recurrence rule. The passed start date
     * must be the start date of the event, not the start of the range to
     * search in.
     *
     * @example
     * var recur = comp.getFirstPropertyValue('rrule');
     * var dtstart = comp.getFirstPropertyValue('dtstart');
     * var iter = recur.iterator(dtstart);
     * for (var next = iter.next(); next; next = iter.next()) {
     *   if (next.compare(rangeStart) < 0) {
     *     continue;
     *   }
     *   console.log(next.toString());
     * }
     *
     * @param {ICAL.Time} aStart        The item's start date
     * @return {ICAL.RecurIterator}     The recurrence iterator
     */
    iterator: function(aStart) {
      return new ICAL.RecurIterator({
        rule: this,
        dtstart: aStart
      });
    },

    /**
     * Returns a clone of the recurrence object.
     *
     * @return {ICAL.Recur}      The cloned object
     */
    clone: function clone() {
      return new ICAL.Recur(this.toJSON());
    },

    /**
     * Checks if the current rule is finite, i.e. has a count or until part.
     *
     * @return {Boolean}        True, if the rule is finite
     */
    isFinite: function isfinite() {
      return !!(this.count || this.until);
    },

    /**
     * Checks if the current rule has a count part, and not limited by an until
     * part.
     *
     * @return {Boolean}        True, if the rule is by count
     */
    isByCount: function isbycount() {
      return !!(this.count && !this.until);
    },

    /**
     * Adds a component (part) to the recurrence rule. This is not a component
     * in the sense of {@link ICAL.Component}, but a part of the recurrence
     * rule, i.e. BYMONTH.
     *
     * @param {String} aType            The name of the component part
     * @param {Array|String} aValue     The component value
     */
    addComponent: function addPart(aType, aValue) {
      var ucname = aType.toUpperCase();
      if (ucname in this.parts) {
        this.parts[ucname].push(aValue);
      } else {
        this.parts[ucname] = [aValue];
      }
    },

    /**
     * Sets the component value for the given by-part.
     *
     * @param {String} aType        The component part name
     * @param {Array} aValues       The component values
     */
    setComponent: function setComponent(aType, aValues) {
      this.parts[aType.toUpperCase()] = aValues.slice();
    },

    /**
     * Gets (a copy) of the requested component value.
     *
     * @param {String} aType        The component part name
     * @return {Array}              The component part value
     */
    getComponent: function getComponent(aType) {
      var ucname = aType.toUpperCase();
      return (ucname in this.parts ? this.parts[ucname].slice() : []);
    },

    /**
     * Retrieves the next occurrence after the given recurrence id. See the
     * guide on {@tutorial terminology} for more details.
     *
     * NOTE: Currently, this method iterates all occurrences from the start
     * date. It should not be called in a loop for performance reasons. If you
     * would like to get more than one occurrence, you can iterate the
     * occurrences manually, see the example on the
     * {@link ICAL.Recur#iterator iterator} method.
     *
     * @param {ICAL.Time} aStartTime        The start of the event series
     * @param {ICAL.Time} aRecurrenceId     The date of the last occurrence
     * @return {ICAL.Time}                  The next occurrence after
     */
    getNextOccurrence: function getNextOccurrence(aStartTime, aRecurrenceId) {
      var iter = this.iterator(aStartTime);
      var next, cdt;

      do {
        next = iter.next();
      } while (next && next.compare(aRecurrenceId) <= 0);

      if (next && aRecurrenceId.zone) {
        next.zone = aRecurrenceId.zone;
      }

      return next;
    },

    /**
     * Sets up the current instance using members from the passed data object.
     *
     * @param {Object} data                       An object with members of the recurrence
     * @param {ICAL.Recur.frequencyValues} freq   The frequency value
     * @param {Number=} data.interval             The INTERVAL value
     * @param {ICAL.Time.weekDay=} data.wkst      The week start value
     * @param {ICAL.Time=} data.until             The end of the recurrence set
     * @param {Number=} data.count                The number of occurrences
     * @param {Array.<Number>=} data.bysecond     The seconds for the BYSECOND part
     * @param {Array.<Number>=} data.byminute     The minutes for the BYMINUTE part
     * @param {Array.<Number>=} data.byhour       The hours for the BYHOUR part
     * @param {Array.<String>=} data.byday        The BYDAY values
     * @param {Array.<Number>=} data.bymonthday   The days for the BYMONTHDAY part
     * @param {Array.<Number>=} data.byyearday    The days for the BYYEARDAY part
     * @param {Array.<Number>=} data.byweekno     The weeks for the BYWEEKNO part
     * @param {Array.<Number>=} data.bymonth      The month for the BYMONTH part
     * @param {Array.<Number>=} data.bysetpos     The positionals for the BYSETPOS part
     */
    fromData: function(data) {
      for (var key in data) {
        var uckey = key.toUpperCase();

        if (uckey in partDesign) {
          if (Array.isArray(data[key])) {
            this.parts[uckey] = data[key];
          } else {
            this.parts[uckey] = [data[key]];
          }
        } else {
          this[key] = data[key];
        }
      }

      if (this.wkst && typeof this.wkst != "number") {
        this.wkst = ICAL.Recur.icalDayToNumericDay(this.wkst);
      }

      if (this.until && !(this.until instanceof ICAL.Time)) {
        this.until = ICAL.Time.fromString(this.until);
      }
    },

    /**
     * The jCal representation of this recurrence type.
     * @return {Object}
     */
    toJSON: function() {
      var res = Object.create(null);
      res.freq = this.freq;

      if (this.count) {
        res.count = this.count;
      }

      if (this.interval > 1) {
        res.interval = this.interval;
      }

      for (var k in this.parts) {
        /* istanbul ignore if */
        if (!this.parts.hasOwnProperty(k)) {
          continue;
        }
        var kparts = this.parts[k];
        if (Array.isArray(kparts) && kparts.length == 1) {
          res[k.toLowerCase()] = kparts[0];
        } else {
          res[k.toLowerCase()] = ICAL.helpers.clone(this.parts[k]);
        }
      }

      if (this.until) {
        res.until = this.until.toString();
      }
      if ('wkst' in this && this.wkst !== ICAL.Time.DEFAULT_WEEK_START) {
        res.wkst = ICAL.Recur.numericDayToIcalDay(this.wkst);
      }
      return res;
    },

    /**
     * The string representation of this recurrence rule.
     * @return {String}
     */
    toString: function icalrecur_toString() {
      // TODO retain order
      var str = "FREQ=" + this.freq;
      if (this.count) {
        str += ";COUNT=" + this.count;
      }
      if (this.interval > 1) {
        str += ";INTERVAL=" + this.interval;
      }
      for (var k in this.parts) {
        /* istanbul ignore else */
        if (this.parts.hasOwnProperty(k)) {
          str += ";" + k + "=" + this.parts[k];
        }
      }
      if (this.until) {
        str += ';UNTIL=' + this.until.toString();
      }
      if ('wkst' in this && this.wkst !== ICAL.Time.DEFAULT_WEEK_START) {
        str += ';WKST=' + ICAL.Recur.numericDayToIcalDay(this.wkst);
      }
      return str;
    }
  };

  function parseNumericValue(type, min, max, value) {
    var result = value;

    if (value[0] === '+') {
      result = value.substr(1);
    }

    result = ICAL.helpers.strictParseInt(result);

    if (min !== undefined && value < min) {
      throw new Error(
        type + ': invalid value "' + value + '" must be > ' + min
      );
    }

    if (max !== undefined && value > max) {
      throw new Error(
        type + ': invalid value "' + value + '" must be < ' + min
      );
    }

    return result;
  }

  /**
   * Convert an ical representation of a day (SU, MO, etc..)
   * into a numeric value of that day.
   *
   * @param {String} string     The iCalendar day name
   * @return {Number}           Numeric value of given day
   */
  ICAL.Recur.icalDayToNumericDay = function toNumericDay(string) {
    //XXX: this is here so we can deal
    //     with possibly invalid string values.

    return DOW_MAP[string];
  };

  /**
   * Convert a numeric day value into its ical representation (SU, MO, etc..)
   *
   * @param {Number} num        Numeric value of given day
   * @return {String}           The ICAL day value, e.g SU,MO,...
   */
  ICAL.Recur.numericDayToIcalDay = function toIcalDay(num) {
    //XXX: this is here so we can deal with possibly invalid number values.
    //     Also, this allows consistent mapping between day numbers and day
    //     names for external users.
    return REVERSE_DOW_MAP[num];
  };

  var VALID_DAY_NAMES = /^(SU|MO|TU|WE|TH|FR|SA)$/;
  var VALID_BYDAY_PART = /^([+-])?(5[0-3]|[1-4][0-9]|[1-9])?(SU|MO|TU|WE|TH|FR|SA)$/;

  /**
   * Possible frequency values for the FREQ part
   * (YEARLY, MONTHLY, WEEKLY, DAILY, HOURLY, MINUTELY, SECONDLY)
   *
   * @typedef {String} frequencyValues
   * @memberof ICAL.Recur
   */

  var ALLOWED_FREQ = ['SECONDLY', 'MINUTELY', 'HOURLY',
                      'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  var optionDesign = {
    FREQ: function(value, dict, fmtIcal) {
      // yes this is actually equal or faster then regex.
      // upside here is we can enumerate the valid values.
      if (ALLOWED_FREQ.indexOf(value) !== -1) {
        dict.freq = value;
      } else {
        throw new Error(
          'invalid frequency "' + value + '" expected: "' +
          ALLOWED_FREQ.join(', ') + '"'
        );
      }
    },

    COUNT: function(value, dict, fmtIcal) {
      dict.count = ICAL.helpers.strictParseInt(value);
    },

    INTERVAL: function(value, dict, fmtIcal) {
      dict.interval = ICAL.helpers.strictParseInt(value);
      if (dict.interval < 1) {
        // 0 or negative values are not allowed, some engines seem to generate
        // it though. Assume 1 instead.
        dict.interval = 1;
      }
    },

    UNTIL: function(value, dict, fmtIcal) {
      if (fmtIcal) {
        if (value.length > 10) {
          dict.until = ICAL.design.icalendar.value['date-time'].fromICAL(value);
        } else {
          dict.until = ICAL.design.icalendar.value.date.fromICAL(value);
        }
      } else {
        dict.until = ICAL.Time.fromString(value);
      }
    },

    WKST: function(value, dict, fmtIcal) {
      if (VALID_DAY_NAMES.test(value)) {
        dict.wkst = ICAL.Recur.icalDayToNumericDay(value);
      } else {
        throw new Error('invalid WKST value "' + value + '"');
      }
    }
  };

  var partDesign = {
    BYSECOND: parseNumericValue.bind(this, 'BYSECOND', 0, 60),
    BYMINUTE: parseNumericValue.bind(this, 'BYMINUTE', 0, 59),
    BYHOUR: parseNumericValue.bind(this, 'BYHOUR', 0, 23),
    BYDAY: function(value) {
      if (VALID_BYDAY_PART.test(value)) {
        return value;
      } else {
        throw new Error('invalid BYDAY value "' + value + '"');
      }
    },
    BYMONTHDAY: parseNumericValue.bind(this, 'BYMONTHDAY', -31, 31),
    BYYEARDAY: parseNumericValue.bind(this, 'BYYEARDAY', -366, 366),
    BYWEEKNO: parseNumericValue.bind(this, 'BYWEEKNO', -53, 53),
    BYMONTH: parseNumericValue.bind(this, 'BYMONTH', 0, 12),
    BYSETPOS: parseNumericValue.bind(this, 'BYSETPOS', -366, 366)
  };


  /**
   * Creates a new {@link ICAL.Recur} instance from the passed string.
   *
   * @param {String} string         The string to parse
   * @return {ICAL.Recur}           The created recurrence instance
   */
  ICAL.Recur.fromString = function(string) {
    var data = ICAL.Recur._stringToData(string, false);
    return new ICAL.Recur(data);
  };

  /**
   * Creates a new {@link ICAL.Recur} instance using members from the passed
   * data object.
   *
   * @param {Object} aData                      An object with members of the recurrence
   * @param {ICAL.Recur.frequencyValues} freq   The frequency value
   * @param {Number=} aData.interval            The INTERVAL value
   * @param {ICAL.Time.weekDay=} aData.wkst     The week start value
   * @param {ICAL.Time=} aData.until            The end of the recurrence set
   * @param {Number=} aData.count               The number of occurrences
   * @param {Array.<Number>=} aData.bysecond    The seconds for the BYSECOND part
   * @param {Array.<Number>=} aData.byminute    The minutes for the BYMINUTE part
   * @param {Array.<Number>=} aData.byhour      The hours for the BYHOUR part
   * @param {Array.<String>=} aData.byday       The BYDAY values
   * @param {Array.<Number>=} aData.bymonthday  The days for the BYMONTHDAY part
   * @param {Array.<Number>=} aData.byyearday   The days for the BYYEARDAY part
   * @param {Array.<Number>=} aData.byweekno    The weeks for the BYWEEKNO part
   * @param {Array.<Number>=} aData.bymonth     The month for the BYMONTH part
   * @param {Array.<Number>=} aData.bysetpos    The positionals for the BYSETPOS part
   */
  ICAL.Recur.fromData = function(aData) {
    return new ICAL.Recur(aData);
  };

  /**
   * Converts a recurrence string to a data object, suitable for the fromData
   * method.
   *
   * @param {String} string     The string to parse
   * @param {Boolean} fmtIcal   If true, the string is considered to be an
   *                              iCalendar string
   * @return {ICAL.Recur}       The recurrence instance
   */
  ICAL.Recur._stringToData = function(string, fmtIcal) {
    var dict = Object.create(null);

    // split is slower in FF but fast enough.
    // v8 however this is faster then manual split?
    var values = string.split(';');
    var len = values.length;

    for (var i = 0; i < len; i++) {
      var parts = values[i].split('=');
      var ucname = parts[0].toUpperCase();
      var lcname = parts[0].toLowerCase();
      var name = (fmtIcal ? lcname : ucname);
      var value = parts[1];

      if (ucname in partDesign) {
        var partArr = value.split(',');
        var partArrIdx = 0;
        var partArrLen = partArr.length;

        for (; partArrIdx < partArrLen; partArrIdx++) {
          partArr[partArrIdx] = partDesign[ucname](partArr[partArrIdx]);
        }
        dict[name] = (partArr.length == 1 ? partArr[0] : partArr);
      } else if (ucname in optionDesign) {
        optionDesign[ucname](value, dict, fmtIcal);
      } else {
        // Don't swallow unknown values. Just set them as they are.
        dict[lcname] = value;
      }
    }

    return dict;
  };
})();
