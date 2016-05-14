app.factory('Calendar', ['$rootScope', '$filter', 'VEventService', 'TimezoneService', 'RandomStringService', function($rootScope, $filter, VEventService, TimezoneService, RandomStringService) {
	'use strict';

	function generateTextColor(r,g,b) {
		var brightness = (((r * 299) + (g * 587) + (b * 114)) / 1000);
		return (brightness > 130) ? '#000000' : '#FAFAFA';
	}

	function Calendar(url, props) {
		var self = this;

		var enabled = props.enabled;
		if (typeof enabled === 'undefined') {
			if (typeof props.owner !== 'undefined') {
				enabled = props.owner === oc_current_user;
			} else {
				enabled = false;
			}
		}
		if (typeof props.color !== 'undefined') {
			if (props.color.length === 9) {
				props.color = props.color.substr(0,7);
			}
		} else {
			props.color = '#1d2d44';
		}

		angular.extend(this, {
			_mutableProperties: {
				displayname: props.displayname,
				enabled: enabled,
				color: props.color,
				order: props.order
			}
		});

		delete props.displayname;
		delete props.enabled;
		delete props.color;
		delete props.order;

		angular.extend(this, props, {
			_callbacks: {
				enabled: function() {}
			},
			_propertiesBackup: {},
			updatedProperties: [],
			caldav: window.location.origin + url,
			url: url,
			tmpId: RandomStringService.generate(),
			warnings: [],
			fcEventSource: {
				events: function (start, end, timezone, callback) {
					TimezoneService.get(timezone).then(function(tz) {
						self.list.loading = true;
						self.fcEventSource.isRendering = true;
						$rootScope.$broadcast('reloadCalendarList');

						VEventService.getAll(self, start, end).then(function(events) {
							var vevents = [];
							for (var i = 0; i < events.length; i++) {
								var vevent;
								try {
									vevent = events[i].getFcEvent(start, end, tz);
								} catch (err) {
									self.warnings.push(err.toString());
									console.log(err);
									console.log(events[i]);
									continue;
								}
								vevents = vevents.concat(vevent);
							}

							callback(vevents);
							self.fcEventSource.isRendering = false;

							self.list.loading = false;
							$rootScope.$broadcast('reloadCalendarList');
						});
					});
				},
				editable: this.writable,
				calendar: this,
				isRendering: false
			},
			list: {
				edit: false,
				loading: this.enabled,
				locked: false,
				editingShares: false
			},
			registerCallback: function(prop, callback) {
				this._callbacks[prop] = callback;
			},
			_setUpdated: function(propName) {
				if (this.updatedProperties.indexOf(propName) === -1) {
					this.updatedProperties.push(propName);
				}

				var callback = this._callbacks[propName] || function(){};
				callback(this._mutableProperties[propName]);
			},
			resetUpdatedProperties: function() {
				this.updatedProperties = [];
			},
			prepareUpdate: function() {
				this.list.edit = true;
				this._propertiesBackup = angular.copy(this._mutableProperties);
			},
			resetToPreviousState: function() {
				this._mutableProperties = angular.copy(this._propertiesBackup);
				this.list.edit = false;
				this.dropPreviousState();
			},
			dropPreviousState: function() {
				this._propertiesBackup = {};
			},
			toggleSharesEditor: function() {
				this.list.editingShares = !this.list.editingShares;
			}
		});
	}

	Calendar.prototype = {
		hasWarnings: function() {
			return this.warnings.length > 0;
		},
		get enabled() {
			return this._mutableProperties.enabled;
		},
		set enabled(enabled) {
			this._mutableProperties.enabled = enabled;
			this._setUpdated('enabled');
		},
		get displayname() {
			return this._mutableProperties.displayname;
		},
		set displayname(displayname) {
			this._mutableProperties.displayname = displayname;
			this._setUpdated('displayname');
		},
		get color() {
			return this._mutableProperties.color;
		},
		set color(color) {
			this._mutableProperties.color = color;
			this._setUpdated('color');
		},
		get order() {
			return this._mutableProperties.order;
		},
		set order(order) {
			this._mutableProperties.order = order;
			this._setUpdated('order');
		},
		get textColor() {
			var color = this.color;
			var fallbackColor = '#fff';
			var c;
			switch (color.length) {
				case 4:
					c = color.match(/^#([0-9a-f]{3})$/i)[1];
					if (c) {
						return generateTextColor(
							parseInt(c.charAt(0),16)*0x11,
							parseInt(c.charAt(1),16)*0x11,
							parseInt(c.charAt(2),16)*0x11
						);
					}
					return fallbackColor;

				case 7:
				case 9:
					var regex = new RegExp('^#([0-9a-f]{' + (color.length - 1) + '})$', 'i');
					c = color.match(regex)[1];
					if (c) {
						return generateTextColor(
							parseInt(c.substr(0,2),16),
							parseInt(c.substr(2,2),16),
							parseInt(c.substr(4,2),16)
						);
					}
					return fallbackColor;

				default:
					return fallbackColor;
			}
		}
	};

	return Calendar;
}]);
