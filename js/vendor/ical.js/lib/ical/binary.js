/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */


/**
 * This symbol is further described later on
 * @ignore
 */
ICAL.Binary = (function() {

  /**
   * @classdesc
   * Represents the BINARY value type, which contains extra methods for
   * encoding and decoding.
   *
   * @class
   * @alias ICAL.Binary
   * @param {String} aValue     The binary data for this value
   */
  function Binary(aValue) {
    this.value = aValue;
  }

  Binary.prototype = {
    /**
     * The type name, to be used in the jCal object.
     * @default "binary"
     * @constant
     */
    icaltype: "binary",

    /**
     * Base64 decode the current value
     *
     * @return {String}         The base64-decoded value
     */
    decodeValue: function decodeValue() {
      return this._b64_decode(this.value);
    },

    /**
     * Encodes the passed parameter with base64 and sets the internal
     * value to the result.
     *
     * @param {String} aValue      The raw binary value to encode
     */
    setEncodedValue: function setEncodedValue(aValue) {
      this.value = this._b64_encode(aValue);
    },

    _b64_encode: function base64_encode(data) {
      // http://kevin.vanzonneveld.net
      // +   original by: Tyler Akins (http://rumkin.com)
      // +   improved by: Bayron Guevara
      // +   improved by: Thunder.m
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Pellentesque Malesuada
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Rafał Kukawski (http://kukawski.pl)
      // *     example 1: base64_encode('Kevin van Zonneveld');
      // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
      // mozilla has this native
      // - but breaks in 2.0.0.12!
      //if (typeof this.window['atob'] == 'function') {
      //    return atob(data);
      //}
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = "",
        tmp_arr = [];

      if (!data) {
        return data;
      }

      do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);

      enc = tmp_arr.join('');

      var r = data.length % 3;

      return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);

    },

    _b64_decode: function base64_decode(data) {
      // http://kevin.vanzonneveld.net
      // +   original by: Tyler Akins (http://rumkin.com)
      // +   improved by: Thunder.m
      // +      input by: Aman Gupta
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Onno Marsman
      // +   bugfixed by: Pellentesque Malesuada
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
      // *     returns 1: 'Kevin van Zonneveld'
      // mozilla has this native
      // - but breaks in 2.0.0.12!
      //if (typeof this.window['btoa'] == 'function') {
      //    return btoa(data);
      //}
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
                "abcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];

      if (!data) {
        return data;
      }

      data += '';

      do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
          tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
          tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
          tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
      } while (i < data.length);

      dec = tmp_arr.join('');

      return dec;
    },

    /**
     * The string representation of this value
     * @return {String}
     */
    toString: function() {
      return this.value;
    }
  };

  /**
   * Creates a binary value from the given string.
   *
   * @param {String} aString        The binary value string
   * @return {ICAL.Binary}          The binary value instance
   */
  Binary.fromString = function(aString) {
    return new Binary(aString);
  };

  return Binary;
}());
