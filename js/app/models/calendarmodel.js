app.factory('Calendar', ['$filter', function($filter) {
	'use strict';

	function Calendar(url, props) {
		angular.extend(this, {
			_propertiesBackup: {},
			_properties: {
				url: url,
				enabled: props['{http://owncloud.org/ns}calendar-enabled'] === '1',
				displayname: props['{DAV:}displayname'] || 'Unnamed',
				color: props['{http://apple.com/ns/ical/}calendar-color'] || '#1d2d44',
				order: parseInt(props['{http://apple.com/ns/ical/}calendar-order']) || 0,
				components: {
					vevent: false,
					vjournal: false,
					vtodo: false
				},
				cruds: {
					create: true,
					read: true,
					update: true,
					delete: true,
					share: true
					//TODO - implement me
				},
				list: {
					edit: false,
					loading: true,
					locked: false
				}
			},
			_updatedProperties: []
		});

		var components = props['{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set'];
		for (var i=0; i < components.length; i++) {
			var name = components[i].attributes.getNamedItem('name').textContent.toLowerCase();
			if (this._properties.components.hasOwnProperty(name)) {
				this._properties.components[name] = true;
			}
		}
	}

	Calendar.prototype = {
		get url() {
			return this._properties.url;
		},
		get enabled() {
			return this._properties.enabled;
		},
		set enabled(enabled) {
			this._properties.enabled = enabled;
			this._setUpdated('enabled');
		},
		get displayname() {
			return this._properties.displayname;
		},
		set displayname(displayname) {
			this._properties.displayname = displayname;
			this._setUpdated('displayname');
		},
		get color() {
			return this._properties.color;
		},
		set color(color) {
			this._properties.color = color;
			this._setUpdated('color');
		},
		get order() {
			return this._properties.order;
		},
		set order(order) {
			this._properties.order = order;
			this._setUpdated('order');
		},
		get components() {
			return this._properties.components;
		},
		set components(components) {
			this._properties.components = components;
			this._setUpdated('components');
		},
		get cruds() {
			return this._properties.cruds;
		},
		get list() {
			return this._properties.list;
		},
		set list(list) {
			this._properties.list = list;
		},
		_setUpdated: function(propName) {
			if (this._updatedProperties.indexOf(propName) == -1) {
				this._updatedProperties.push(propName);
			}
		},
		get updatedProperties() {
			return this._updatedProperties;
		},
		resetUpdatedProperties: function() {
			this._updatedProperties = [];
		},
		prepareUpdate: function() {
			this._properties.list.edit = true;
			this._propertiesBackup = angular.copy(this._properties);
			this._setUpdated('components');
		},
		resetToPreviousState: function() {
			this._properties = angular.copy(this._propertiesBackup);
			this._properties.list.edit = false;
			this._propertiesBackup = {};
		}
	};

	return Calendar;
}]);