/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */

"use strict";

(function() {
  /**
   * @classdesc
   * This class represents the "period" value type, with various calculation
   * and manipulation methods.
   *
   * @description
   * The passed data object cannot contain both and end date and a duration.
   *
   * @class
   * @param {Object} aData                  An object with members of the period
   * @param {ICAL.Time=} aData.start        The start of the period
   * @param {ICAL.Time=} aData.end          The end of the period
   * @param {ICAL.Duration=} aData.duration The duration of the period
   */
  ICAL.Period = function icalperiod(aData) {
    this.wrappedJSObject = this;

    if (aData && 'start' in aData) {
      if (aData.start && !(aData.start instanceof ICAL.Time)) {
        throw new TypeError('.start must be an instance of ICAL.Time');
      }
      this.start = aData.start;
    }

    if (aData && aData.end && aData.duration) {
      throw new Error('cannot accept both end and duration');
    }

    if (aData && 'end' in aData) {
      if (aData.end && !(aData.end instanceof ICAL.Time)) {
        throw new TypeError('.end must be an instance of ICAL.Time');
      }
      this.end = aData.end;
    }

    if (aData && 'duration' in aData) {
      if (aData.duration && !(aData.duration instanceof ICAL.Duration)) {
        throw new TypeError('.duration must be an instance of ICAL.Duration');
      }
      this.duration = aData.duration;
    }
  };

  ICAL.Period.prototype = {

    /**
     * The start of the period
     * @type {ICAL.Time}
     */
    start: null,

    /**
     * The end of the period
     * @type {ICAL.Time}
     */
    end: null,

    /**
     * The duration of the period
     * @type {ICAL.Duration}
     */
    duration: null,

    /**
     * The class identifier.
     * @constant
     * @type {String}
     * @default "icalperiod"
     */
    icalclass: "icalperiod",

    /**
     * The type name, to be used in the jCal object.
     * @constant
     * @type {String}
     * @default "period"
     */
    icaltype: "period",

    /**
     * Returns a clone of the duration object.
     *
     * @return {ICAL.Period}      The cloned object
     */
    clone: function() {
      return ICAL.Period.fromData({
        start: this.start ? this.start.clone() : null,
        end: this.end ? this.end.clone() : null,
        duration: this.duration ? this.duration.clone() : null
      });
    },

    /**
     * Calculates the duration of the period, either directly or by subtracting
     * start from end date.
     *
     * @return {ICAL.Duration}      The calculated duration
     */
    getDuration: function duration() {
      if (this.duration) {
        return this.duration;
      } else {
        return this.end.subtractDate(this.start);
      }
    },

    /**
     * Calculates the end date of the period, either directly or by adding
     * duration to start date.
     *
     * @return {ICAL.Time}          The calculated end date
     */
    getEnd: function() {
      if (this.end) {
        return this.end;
      } else {
        var end = this.start.clone();
        end.addDuration(this.duration);
        return end;
      }
    },

    /**
     * The string representation of this period.
     * @return {String}
     */
    toString: function toString() {
      return this.start + "/" + (this.end || this.duration);
    },

    /**
     * The jCal representation of this period type.
     * @return {Object}
     */
    toJSON: function() {
      return [this.start.toString(), (this.end || this.duration).toString()];
    },

    /**
     * The iCalendar string representation of this period.
     * @return {String}
     */
    toICALString: function() {
      return this.start.toICALString() + "/" +
             (this.end || this.duration).toICALString();
    }
  };

  /**
   * Creates a new {@link ICAL.Period} instance from the passed string.
   *
   * @param {String} str            The string to parse
   * @param {ICAL.Property} prop    The property this period will be on
   * @return {ICAL.Period}          The created period instance
   */
  ICAL.Period.fromString = function fromString(str, prop) {
    var parts = str.split('/');

    if (parts.length !== 2) {
      throw new Error(
        'Invalid string value: "' + str + '" must contain a "/" char.'
      );
    }

    var options = {
      start: ICAL.Time.fromDateTimeString(parts[0], prop)
    };

    var end = parts[1];

    if (ICAL.Duration.isValueString(end)) {
      options.duration = ICAL.Duration.fromString(end);
    } else {
      options.end = ICAL.Time.fromDateTimeString(end, prop);
    }

    return new ICAL.Period(options);
  };

  /**
   * Creates a new {@link ICAL.Period} instance from the given data object.
   * The passed data object cannot contain both and end date and a duration.
   *
   * @param {Object} aData                  An object with members of the period
   * @param {ICAL.Time=} aData.start        The start of the period
   * @param {ICAL.Time=} aData.end          The end of the period
   * @param {ICAL.Duration=} aData.duration The duration of the period
   * @return {ICAL.Period}                  The period instance
   */
  ICAL.Period.fromData = function fromData(aData) {
    return new ICAL.Period(aData);
  };

  /**
   * Returns a new period instance from the given jCal data array. The first
   * member is always the start date string, the second member is either a
   * duration or end date string.
   *
   * @param {Array<String,String>} aData    The jCal data array
   * @param {ICAL.Property} aProp           The property this jCal data is on
   * @return {ICAL.Period}                  The period instance
   */
  ICAL.Period.fromJSON = function(aData, aProp) {
    if (ICAL.Duration.isValueString(aData[1])) {
      return ICAL.Period.fromData({
        start: ICAL.Time.fromDateTimeString(aData[0], aProp),
        duration: ICAL.Duration.fromString(aData[1])
      });
    } else {
      return ICAL.Period.fromData({
        start: ICAL.Time.fromDateTimeString(aData[0], aProp),
        end: ICAL.Time.fromDateTimeString(aData[1], aProp)
      });
    }
  };
})();
