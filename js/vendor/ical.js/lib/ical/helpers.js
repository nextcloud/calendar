/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */


/* istanbul ignore next */
/* jshint ignore:start */
if (typeof module === 'object') {
  // CommonJS, where exports may be different each time.
  ICAL = module.exports;
} else if (typeof ICAL !== 'object') {/* istanbul ignore next */
  /** @ignore */
  this.ICAL = {};
}
/* jshint ignore:end */


/**
 * The number of characters before iCalendar line folding should occur
 * @type {Number}
 * @default 75
 */
ICAL.foldLength = 75;


/**
 * The character(s) to be used for a newline. The default value is provided by
 * rfc5545.
 * @type {String}
 * @default "\r\n"
 */
ICAL.newLineChar = '\r\n';


/**
 * Helper functions used in various places within ical.js
 * @namespace
 */
ICAL.helpers = {
  /**
   * Checks if the given type is of the number type and also NaN.
   *
   * @param {Number} number     The number to check
   * @return {Boolean}          True, if the number is strictly NaN
   */
  isStrictlyNaN: function(number) {
    return typeof(number) === 'number' && isNaN(number);
  },

  /**
   * Parses a string value that is expected to be an integer, when the valid is
   * not an integer throws a decoration error.
   *
   * @param {String} string     Raw string input
   * @return {Number}           Parsed integer
   */
  strictParseInt: function(string) {
    var result = parseInt(string, 10);

    if (ICAL.helpers.isStrictlyNaN(result)) {
      throw new Error(
        'Could not extract integer from "' + string + '"'
      );
    }

    return result;
  },

  /**
   * Creates or returns a class instance of a given type with the initialization
   * data if the data is not already an instance of the given type.
   *
   * @example
   * var time = new ICAL.Time(...);
   * var result = ICAL.helpers.formatClassType(time, ICAL.Time);
   *
   * (result instanceof ICAL.Time)
   * // => true
   *
   * result = ICAL.helpers.formatClassType({}, ICAL.Time);
   * (result isntanceof ICAL.Time)
   * // => true
   *
   *
   * @param {Object} data       object initialization data
   * @param {Object} type       object type (like ICAL.Time)
   * @return {?}                An instance of the found type.
   */
  formatClassType: function formatClassType(data, type) {
    if (typeof(data) === 'undefined') {
      return undefined;
    }

    if (data instanceof type) {
      return data;
    }
    return new type(data);
  },

  /**
   * Identical to indexOf but will only match values when they are not preceded
   * by a backslash character.
   *
   * @param {String} buffer         String to search
   * @param {String} search         Value to look for
   * @param {Number} pos            Start position
   * @return {Number}               The position, or -1 if not found
   */
  unescapedIndexOf: function(buffer, search, pos) {
    while ((pos = buffer.indexOf(search, pos)) !== -1) {
      if (pos > 0 && buffer[pos - 1] === '\\') {
        pos += 1;
      } else {
        return pos;
      }
    }
    return -1;
  },

  /**
   * Find the index for insertion using binary search.
   *
   * @param {Array} list            The list to search
   * @param {?} seekVal             The value to insert
   * @param {function(?,?)} cmpfunc The comparison func, that can
   *                                  compare two seekVals
   * @return {Number}               The insert position
   */
  binsearchInsert: function(list, seekVal, cmpfunc) {
    if (!list.length)
      return 0;

    var low = 0, high = list.length - 1,
        mid, cmpval;

    while (low <= high) {
      mid = low + Math.floor((high - low) / 2);
      cmpval = cmpfunc(seekVal, list[mid]);

      if (cmpval < 0)
        high = mid - 1;
      else if (cmpval > 0)
        low = mid + 1;
      else
        break;
    }

    if (cmpval < 0)
      return mid; // insertion is displacing, so use mid outright.
    else if (cmpval > 0)
      return mid + 1;
    else
      return mid;
  },

  /**
   * Convenience function for debug output
   * @private
   */
  dumpn: /* istanbul ignore next */ function() {
    if (!ICAL.debug) {
      return;
    }

    if (typeof (console) !== 'undefined' && 'log' in console) {
      ICAL.helpers.dumpn = function consoleDumpn(input) {
        console.log(input);
      };
    } else {
      ICAL.helpers.dumpn = function geckoDumpn(input) {
        dump(input + '\n');
      };
    }

    ICAL.helpers.dumpn(arguments[0]);
  },

  /**
   * Clone the passed object or primitive. By default a shallow clone will be
   * executed.
   *
   * @param {*} aSrc            The thing to clone
   * @param {Boolean=} aDeep    If true, a deep clone will be performed
   * @return {*}                The copy of the thing
   */
  clone: function(aSrc, aDeep) {
    if (!aSrc || typeof aSrc != "object") {
      return aSrc;
    } else if (aSrc instanceof Date) {
      return new Date(aSrc.getTime());
    } else if ("clone" in aSrc) {
      return aSrc.clone();
    } else if (Array.isArray(aSrc)) {
      var arr = [];
      for (var i = 0; i < aSrc.length; i++) {
        arr.push(aDeep ? ICAL.helpers.clone(aSrc[i], true) : aSrc[i]);
      }
      return arr;
    } else {
      var obj = {};
      for (var name in aSrc) {
        // uses prototype method to allow use of Object.create(null);
        /* istanbul ignore else */
        if (Object.prototype.hasOwnProperty.call(aSrc, name)) {
          if (aDeep) {
            obj[name] = ICAL.helpers.clone(aSrc[name], true);
          } else {
            obj[name] = aSrc[name];
          }
        }
      }
      return obj;
    }
  },

  /**
   * Performs iCalendar line folding. A line ending character is inserted and
   * the next line begins with a whitespace.
   *
   * @example
   * SUMMARY:This line will be fold
   *  ed right in the middle of a word.
   *
   * @param {String} aLine      The line to fold
   * @return {String}           The folded line
   */
  foldline: function foldline(aLine) {
    var result = "";
    var line = aLine || "";

    while (line.length) {
      result += ICAL.newLineChar + " " + line.substr(0, ICAL.foldLength);
      line = line.substr(ICAL.foldLength);
    }
    return result.substr(ICAL.newLineChar.length + 1);
  },

  /**
   * Pads the given string or number with zeros so it will have at least two
   * characters.
   *
   * @param {String|Number} data    The string or number to pad
   * @return {String}               The number padded as a string
   */
  pad2: function pad(data) {
    if (typeof(data) !== 'string') {
      // handle fractions.
      if (typeof(data) === 'number') {
        data = parseInt(data);
      }
      data = String(data);
    }

    var len = data.length;

    switch (len) {
      case 0:
        return '00';
      case 1:
        return '0' + data;
      default:
        return data;
    }
  },

  /**
   * Truncates the given number, correctly handling negative numbers.
   *
   * @param {Number} number     The number to truncate
   * @return {Number}           The truncated number
   */
  trunc: function trunc(number) {
    return (number < 0 ? Math.ceil(number) : Math.floor(number));
  },

  /**
   * Poor-man's cross-browser inheritance for JavaScript. Doesn't support all
   * the features, but enough for our usage.
   *
   * @param {Function} base     The base class constructor function.
   * @param {Function} child    The child class constructor function.
   * @param {Object} extra      Extends the prototype with extra properties
   *                              and methods
   */
  inherits: function(base, child, extra) {
    function F() {}
    F.prototype = base.prototype;
    child.prototype = new F();

    if (extra) {
      ICAL.helpers.extend(extra, child.prototype);
    }
  },

  /**
   * Poor-man's cross-browser object extension. Doesn't support all the
   * features, but enough for our usage. Note that the target's properties are
   * not overwritten with the source properties.
   *
   * @example
   * var child = ICAL.helpers.extend(parent, {
   *   "bar": 123
   * });
   *
   * @param {Object} source     The object to extend
   * @param {Object} target     The object to extend with
   * @return {Object}           Returns the target.
   */
  extend: function(source, target) {
    for (var key in source) {
      var descr = Object.getOwnPropertyDescriptor(source, key);
      if (descr && !Object.getOwnPropertyDescriptor(target, key)) {
        Object.defineProperty(target, key, descr);
      }
    }
    return target;
  }
};
