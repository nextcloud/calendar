/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Portions Copyright (C) Philipp Kewisch, 2011-2015 */


/**
 * This symbol is further described later on
 * @ignore
 */
ICAL.Property = (function() {
  'use strict';

  var NAME_INDEX = 0;
  var PROP_INDEX = 1;
  var TYPE_INDEX = 2;
  var VALUE_INDEX = 3;

  var design = ICAL.design;

  /**
   * @classdesc
   * Provides a layer on top of the raw jCal object for manipulating a single
   * property, with its parameters and value.
   *
   * @description
   * Its important to note that mutations done in the wrapper
   * directly mutate the jCal object used to initialize.
   *
   * Can also be used to create new properties by passing
   * the name of the property (as a String).
   *
   * @class
   * @alias ICAL.Property
   * @param {Array|String} jCal         Raw jCal representation OR
   *  the new name of the property
   *
   * @param {ICAL.Component=} parent    Parent component
   */
  function Property(jCal, parent) {
    this._parent = parent || null;

    if (typeof(jCal) === 'string') {
      // We are creating the property by name and need to detect the type
      this.jCal = [jCal, {}, design.defaultType];
      this.jCal[TYPE_INDEX] = this.getDefaultType();
    } else {
      this.jCal = jCal;
    }
    this._updateType();
  }

  Property.prototype = {

    /**
     * The value type for this property
     * @readonly
     * @type {String}
     */
    get type() {
      return this.jCal[TYPE_INDEX];
    },

    /**
     * The name of this property, in lowercase.
     * @readonly
     * @type {String}
     */
    get name() {
      return this.jCal[NAME_INDEX];
    },

    /**
     * The parent component for this property.
     * @type {ICAL.Component}
     */
    get parent() {
      return this._parent;
    },

    set parent(p) {
      // Before setting the parent, check if the design set has changed. If it
      // has, we later need to update the type if it was unknown before.
      var designSetChanged = !this._parent || (p && p._designSet != this._parent._designSet);

      this._parent = p;

      if (this.type == design.defaultType && designSetChanged) {
        this.jCal[TYPE_INDEX] = this.getDefaultType();
        this._updateType();
      }

      return p;
    },

    /**
     * The design set for this property, e.g. icalendar vs vcard
     *
     * @type {ICAL.design.designSet}
     * @private
     */
    get _designSet() {
      return this.parent ? this.parent._designSet : design.defaultSet;
    },

    /**
     * Updates the type metadata from the current jCal type and design set.
     *
     * @private
     */
    _updateType: function() {
      var designSet = this._designSet;

      if (this.type in designSet.value) {
        var designType = designSet.value[this.type];

        if ('decorate' in designSet.value[this.type]) {
          this.isDecorated = true;
        } else {
          this.isDecorated = false;
        }

        if (this.name in designSet.property) {
          this.isMultiValue = ('multiValue' in designSet.property[this.name]);
          this.isStructuredValue = ('structuredValue' in designSet.property[this.name]);
        }
      }
    },

    /**
     * Hydrate a single value. The act of hydrating means turning the raw jCal
     * value into a potentially wrapped object, for example {@link ICAL.Time}.
     *
     * @private
     * @param {Number} index        The index of the value to hydrate
     * @return {Object}             The decorated value.
     */
    _hydrateValue: function(index) {
      if (this._values && this._values[index]) {
        return this._values[index];
      }

      // for the case where there is no value.
      if (this.jCal.length <= (VALUE_INDEX + index)) {
        return null;
      }

      if (this.isDecorated) {
        if (!this._values) {
          this._values = [];
        }
        return (this._values[index] = this._decorate(
          this.jCal[VALUE_INDEX + index]
        ));
      } else {
        return this.jCal[VALUE_INDEX + index];
      }
    },

    /**
     * Decorate a single value, returning its wrapped object. This is used by
     * the hydrate function to actually wrap the value.
     *
     * @private
     * @param {?} value         The value to decorate
     * @return {Object}         The decorated value
     */
    _decorate: function(value) {
      return this._designSet.value[this.type].decorate(value, this);
    },

    /**
     * Undecorate a single value, returning its raw jCal data.
     *
     * @private
     * @param {Object} value         The value to undecorate
     * @return {?}                   The undecorated value
     */
    _undecorate: function(value) {
      return this._designSet.value[this.type].undecorate(value, this);
    },

    /**
     * Sets the value at the given index while also hydrating it. The passed
     * value can either be a decorated or undecorated value.
     *
     * @private
     * @param {?} value             The value to set
     * @param {Number} index        The index to set it at
     */
    _setDecoratedValue: function(value, index) {
      if (!this._values) {
        this._values = [];
      }

      if (typeof(value) === 'object' && 'icaltype' in value) {
        // decorated value
        this.jCal[VALUE_INDEX + index] = this._undecorate(value);
        this._values[index] = value;
      } else {
        // undecorated value
        this.jCal[VALUE_INDEX + index] = value;
        this._values[index] = this._decorate(value);
      }
    },

    /**
     * Gets a parameter on the property.
     *
     * @param {String}        name   Property name (lowercase)
     * @return {Array|String}        Property value
     */
    getParameter: function(name) {
      if (name in this.jCal[PROP_INDEX]) {
        return this.jCal[PROP_INDEX][name];
      } else {
        return undefined;
      }
    },

    /**
     * Sets a parameter on the property.
     *
     * @param {String}       name     The parameter name
     * @param {Array|String} value    The parameter value
     */
    setParameter: function(name, value) {
      var lcname = name.toLowerCase();
      if (typeof value === "string" &&
          lcname in this._designSet.param &&
          'multiValue' in this._designSet.param[lcname]) {
          value = [value];
      }
      this.jCal[PROP_INDEX][name] = value;
    },

    /**
     * Removes a parameter
     *
     * @param {String} name     The parameter name
     */
    removeParameter: function(name) {
      delete this.jCal[PROP_INDEX][name];
    },

    /**
     * Get the default type based on this property's name.
     *
     * @return {String}     The default type for this property
     */
    getDefaultType: function() {
      var name = this.jCal[NAME_INDEX];
      var designSet = this._designSet;

      if (name in designSet.property) {
        var details = designSet.property[name];
        if ('defaultType' in details) {
          return details.defaultType;
        }
      }
      return design.defaultType;
    },

    /**
     * Sets type of property and clears out any existing values of the current
     * type.
     *
     * @param {String} type     New iCAL type (see design.*.values)
     */
    resetType: function(type) {
      this.removeAllValues();
      this.jCal[TYPE_INDEX] = type;
      this._updateType();
    },

    /**
     * Finds the first property value.
     *
     * @return {String}         First property value
     */
    getFirstValue: function() {
      return this._hydrateValue(0);
    },

    /**
     * Gets all values on the property.
     *
     * NOTE: this creates an array during each call.
     *
     * @return {Array}          List of values
     */
    getValues: function() {
      var len = this.jCal.length - VALUE_INDEX;

      if (len < 1) {
        // its possible for a property to have no value.
        return [];
      }

      var i = 0;
      var result = [];

      for (; i < len; i++) {
        result[i] = this._hydrateValue(i);
      }

      return result;
    },

    /**
     * Removes all values from this property
     */
    removeAllValues: function() {
      if (this._values) {
        this._values.length = 0;
      }
      this.jCal.length = 3;
    },

    /**
     * Sets the values of the property.  Will overwrite the existing values.
     * This can only be used for multi-value properties.
     *
     * @param {Array} values    An array of values
     */
    setValues: function(values) {
      if (!this.isMultiValue) {
        throw new Error(
          this.name + ': does not not support mulitValue.\n' +
          'override isMultiValue'
        );
      }

      var len = values.length;
      var i = 0;
      this.removeAllValues();

      if (len > 0 &&
          typeof(values[0]) === 'object' &&
          'icaltype' in values[0]) {
        this.resetType(values[0].icaltype);
      }

      if (this.isDecorated) {
        for (; i < len; i++) {
          this._setDecoratedValue(values[i], i);
        }
      } else {
        for (; i < len; i++) {
          this.jCal[VALUE_INDEX + i] = values[i];
        }
      }
    },

    /**
     * Sets the current value of the property. If this is a multi-value
     * property, all other values will be removed.
     *
     * @param {String|Object} value     New property value.
     */
    setValue: function(value) {
      this.removeAllValues();
      if (typeof(value) === 'object' && 'icaltype' in value) {
        this.resetType(value.icaltype);
      }

      if (this.isDecorated) {
        this._setDecoratedValue(value, 0);
      } else {
        this.jCal[VALUE_INDEX] = value;
      }
    },

    /**
     * Returns the Object representation of this component. The returned object
     * is a live jCal object and should be cloned if modified.
     * @return {Object}
     */
    toJSON: function() {
      return this.jCal;
    },

    /**
     * The string representation of this component.
     * @return {String}
     */
    toICALString: function() {
      return ICAL.stringify.property(
        this.jCal, this._designSet, true
      );
    }
  };

  /**
   * Create an {@link ICAL.Property} by parsing the passed iCalendar string.
   *
   * @param {String} str                        The iCalendar string to parse
   * @param {ICAL.design.designSet=} designSet  The design data to use for this property
   * @return {ICAL.Property}                    The created iCalendar property
   */
  Property.fromString = function(str, designSet) {
    return new Property(ICAL.parse.property(str, designSet));
  };

  return Property;
}());
