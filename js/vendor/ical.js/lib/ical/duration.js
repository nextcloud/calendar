/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */

"use strict";

(function() {
  var DURATION_LETTERS = /([PDWHMTS]{1,1})/;

  /**
   * @classdesc
   * This class represents the "duration" value type, with various calculation
   * and manipulation methods.
   *
   * @class
   * @alias ICAL.Duration
   * @param {Object} data               An object with members of the duration
   * @param {Number} data.weeks         Duration in weeks
   * @param {Number} data.days          Duration in days
   * @param {Number} data.hours         Duration in hours
   * @param {Number} data.minutes       Duration in minutes
   * @param {Number} data.seconds       Duration in seconds
   * @param {Boolean} data.isNegative   If true, the duration is negative
   */
  ICAL.Duration = function icalduration(data) {
    this.wrappedJSObject = this;
    this.fromData(data);
  };

  ICAL.Duration.prototype = {
    /**
     * The weeks in this duration
     * @type {Number}
     * @default 0
     */
    weeks: 0,

    /**
     * The days in this duration
     * @type {Number}
     * @default 0
     */
    days: 0,

    /**
     * The days in this duration
     * @type {Number}
     * @default 0
     */
    hours: 0,

    /**
     * The minutes in this duration
     * @type {Number}
     * @default 0
     */
    minutes: 0,

    /**
     * The seconds in this duration
     * @type {Number}
     * @default 0
     */
    seconds: 0,

    /**
     * The seconds in this duration
     * @type {Boolean}
     * @default false
     */
    isNegative: false,

    /**
     * The class identifier.
     * @constant
     * @type {String}
     * @default "icalduration"
     */
    icalclass: "icalduration",

    /**
     * The type name, to be used in the jCal object.
     * @constant
     * @type {String}
     * @default "duration"
     */
    icaltype: "duration",

    /**
     * Returns a clone of the duration object.
     *
     * @return {ICAL.Duration}      The cloned object
     */
    clone: function clone() {
      return ICAL.Duration.fromData(this);
    },

    /**
     * The duration value expressed as a number of seconds.
     *
     * @return {Number}             The duration value in seconds
     */
    toSeconds: function toSeconds() {
      var seconds = this.seconds + 60 * this.minutes + 3600 * this.hours +
                    86400 * this.days + 7 * 86400 * this.weeks;
      return (this.isNegative ? -seconds : seconds);
    },

    /**
     * Reads the passed seconds value into this duration object. Afterwards,
     * members like {@link ICAL.Duration#days days} and {@link ICAL.Duration#weeks weeks} will be set up
     * accordingly.
     *
     * @param {Number} aSeconds     The duration value in seconds
     * @return {ICAL.Duration}      Returns this instance
     */
    fromSeconds: function fromSeconds(aSeconds) {
      var secs = Math.abs(aSeconds);

      this.isNegative = (aSeconds < 0);
      this.days = ICAL.helpers.trunc(secs / 86400);

      // If we have a flat number of weeks, use them.
      if (this.days % 7 == 0) {
        this.weeks = this.days / 7;
        this.days = 0;
      } else {
        this.weeks = 0;
      }

      secs -= (this.days + 7 * this.weeks) * 86400;

      this.hours = ICAL.helpers.trunc(secs / 3600);
      secs -= this.hours * 3600;

      this.minutes = ICAL.helpers.trunc(secs / 60);
      secs -= this.minutes * 60;

      this.seconds = secs;
      return this;
    },

    /**
     * Sets up the current instance using members from the passed data object.
     *
     * @param {Object} aData               An object with members of the duration
     * @param {Number} aData.weeks         Duration in weeks
     * @param {Number} aData.days          Duration in days
     * @param {Number} aData.hours         Duration in hours
     * @param {Number} aData.minutes       Duration in minutes
     * @param {Number} aData.seconds       Duration in seconds
     * @param {Boolean} aData.isNegative   If true, the duration is negative
     */
    fromData: function fromData(aData) {
      var propsToCopy = ["weeks", "days", "hours",
                         "minutes", "seconds", "isNegative"];
      for (var key in propsToCopy) {
        /* istanbul ignore if */
        if (!propsToCopy.hasOwnProperty(key)) {
          continue;
        }
        var prop = propsToCopy[key];
        if (aData && prop in aData) {
          this[prop] = aData[prop];
        } else {
          this[prop] = 0;
        }
      }
    },

    /**
     * Resets the duration instance to the default values, i.e. PT0S
     */
    reset: function reset() {
      this.isNegative = false;
      this.weeks = 0;
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    },

    /**
     * Compares the duration instance with another one.
     *
     * @param {ICAL.Duration} aOther        The instance to compare with
     * @return {Number}                     -1, 0 or 1 for less/equal/greater
     */
    compare: function compare(aOther) {
      var thisSeconds = this.toSeconds();
      var otherSeconds = aOther.toSeconds();
      return (thisSeconds > otherSeconds) - (thisSeconds < otherSeconds);
    },

    /**
     * Normalizes the duration instance. For example, a duration with a value
     * of 61 seconds will be normalized to 1 minute and 1 second.
     */
    normalize: function normalize() {
      this.fromSeconds(this.toSeconds());
    },

    /**
     * The string representation of this duration.
     * @return {String}
     */
    toString: function toString() {
      if (this.toSeconds() == 0) {
        return "PT0S";
      } else {
        var str = "";
        if (this.isNegative) str += "-";
        str += "P";
        if (this.weeks) str += this.weeks + "W";
        if (this.days) str += this.days + "D";

        if (this.hours || this.minutes || this.seconds) {
          str += "T";
          if (this.hours) str += this.hours + "H";
          if (this.minutes) str += this.minutes + "M";
          if (this.seconds) str += this.seconds + "S";
        }
        return str;
      }
    },

    /**
     * The iCalendar string representation of this duration.
     * @return {String}
     */
    toICALString: function() {
      return this.toString();
    }
  };

  /**
   * Returns a new ICAL.Duration instance from the passed seconds value.
   *
   * @param {Number} aSeconds       The seconds to create the instance from
   * @return {ICAL.Duration}        The newly created duration instance
   */
  ICAL.Duration.fromSeconds = function icalduration_from_seconds(aSeconds) {
    return (new ICAL.Duration()).fromSeconds(aSeconds);
  };

  /**
   * Internal helper function to handle a chunk of a duration.
   *
   * @param {String} letter type of duration chunk
   * @param {String} number numeric value or -/+
   * @param {Object} dict target to assign values to
   */
  function parseDurationChunk(letter, number, object) {
    var type;
    switch (letter) {
      case 'P':
        if (number && number === '-') {
          object.isNegative = true;
        } else {
          object.isNegative = false;
        }
        // period
        break;
      case 'D':
        type = 'days';
        break;
      case 'W':
        type = 'weeks';
        break;
      case 'H':
        type = 'hours';
        break;
      case 'M':
        type = 'minutes';
        break;
      case 'S':
        type = 'seconds';
        break;
      default:
        // Not a valid chunk
        return 0;
    }

    if (type) {
      if (!number && number !== 0) {
        throw new Error(
          'invalid duration value: Missing number before "' + letter + '"'
        );
      }
      var num = parseInt(number, 10);
      if (ICAL.helpers.isStrictlyNaN(num)) {
        throw new Error(
          'invalid duration value: Invalid number "' + number + '" before "' + letter + '"'
        );
      }
      object[type] = num;
    }

    return 1;
  }

  /**
   * Checks if the given string is an iCalendar duration value.
   *
   * @param {String} value      The raw ical value
   * @return {Boolean}          True, if the given value is of the
   *                              duration ical type
   */
  ICAL.Duration.isValueString = function(string) {
    return (string[0] === 'P' || string[1] === 'P');
  };

  /**
   * Creates a new {@link ICAL.Duration} instance from the passed string.
   *
   * @param {String} aStr       The string to parse
   * @return {ICAL.Duration}    The created duration instance
   */
  ICAL.Duration.fromString = function icalduration_from_string(aStr) {
    var pos = 0;
    var dict = Object.create(null);
    var chunks = 0;

    while ((pos = aStr.search(DURATION_LETTERS)) !== -1) {
      var type = aStr[pos];
      var numeric = aStr.substr(0, pos);
      aStr = aStr.substr(pos + 1);

      chunks += parseDurationChunk(type, numeric, dict);
    }

    if (chunks < 2) {
      // There must be at least a chunk with "P" and some unit chunk
      throw new Error(
        'invalid duration value: Not enough duration components in "' + aStr + '"'
      );
    }

    return new ICAL.Duration(dict);
  };

  /**
   * Creates a new ICAL.Duration instance from the given data object.
   *
   * @param {Object} aData               An object with members of the duration
   * @param {Number} aData.weeks         Duration in weeks
   * @param {Number} aData.days          Duration in days
   * @param {Number} aData.hours         Duration in hours
   * @param {Number} aData.minutes       Duration in minutes
   * @param {Number} aData.seconds       Duration in seconds
   * @param {Boolean} aData.isNegative   If true, the duration is negative
   * @return {ICAL.Duration}             The createad duration instance
   */
  ICAL.Duration.fromData = function icalduration_from_data(aData) {
    return new ICAL.Duration(aData);
  };
})();
