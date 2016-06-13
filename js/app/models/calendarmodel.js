app.factory('Calendar', function($window, Hook, VEventService, TimezoneService, ColorUtilityService, RandomStringService) {
	'use strict';

	function Calendar(url, props) {
		const context = {
			fcEventSource: {},
			components: props.components,
			mutableProperties: {
				color: props.color,
				displayname: props.displayname,
				enabled: props.enabled,
				order: props.order
			},
			updatedProperties: [],
			tmpId: RandomStringService.generate(),
			url: url,
			owner: props.owner,
			shares: props.sharedWith,
			warnings: [],
			shareable: props.shareable,
			writable: props.writable,
			writableProperties: props.writableProperties
		};
		const iface = {
			_isACalendarObject: true
		};

		context.fcEventSource.events = function (start, end, timezone, callback) {
			TimezoneService.get(timezone).then(function (tz) {
				context.fcEventSource.isRendering = true;
				iface.emit(Calendar.hookFinishedRendering);

				VEventService.getAll(iface, start, end).then(function (events) {
					var vevents = [];
					for (var i = 0; i < events.length; i++) {
						var vevent;
						try {
							vevent = events[i].getFcEvent(start, end, tz);
						} catch (err) {
							iface.addWarning(err.toString());
							console.log(err);
							console.log(events[i]);
							continue;
						}
						vevents = vevents.concat(vevent);
					}

					callback(vevents);
					context.fcEventSource.isRendering = false;

					iface.emit(Calendar.hookFinishedRendering);
				});
			});
		};
		context.fcEventSource.editable = context.writable;
		context.fcEventSource.calendar = iface;
		context.fcEventSource.isRendering = false;

		context.setUpdated = function(property) {
			if (context.updatedProperties.indexOf(property) === -1) {
				context.updatedProperties.push(property);
			}
		};

		Object.defineProperties(iface, {
			color: {
				get: function() {
					return context.mutableProperties.color;
				},
				set: function(color) {
					var oldColor = context.mutableProperties.color;
					if (color === oldColor) {
						return;
					}
					context.mutableProperties.color = color;
					context.setUpdated('color');
					iface.emit(Calendar.hookColorChanged, color, oldColor);
				}
			},
			textColor: {
				get: function() {
					const colors = ColorUtilityService.extractRGBFromHexString(context.mutableProperties.color);
					return ColorUtilityService.generateTextColorFromRGB(colors.r, colors.g, colors.b);
				}
			},
			displayname: {
				get: function() {
					return context.mutableProperties.displayname;
				},
				set: function(displayname) {
					var oldDisplayname = context.mutableProperties.displayname;
					if (displayname === oldDisplayname) {
						return;
					}
					context.mutableProperties.displayname = displayname;
					context.setUpdated('displayname');
					iface.emit(Calendar.hookDisplaynameChanged, displayname, oldDisplayname);
				}
			},
			enabled: {
				get: function() {
					return context.mutableProperties.enabled;
				},
				set: function(enabled) {
					var oldEnabled = context.mutableProperties.enabled;
					if (enabled === oldEnabled) {
						return;
					}
					context.mutableProperties.enabled = enabled;
					context.setUpdated('enabled');
					iface.emit(Calendar.hookEnabledChanged, enabled, oldEnabled);
				}
			},
			order: {
				get: function() {
					return context.mutableProperties.order;
				},
				set: function(order) {
					var oldOrder = context.mutableProperties.order;
					if (order === oldOrder) {
						return;
					}
					context.mutableProperties.order = order;
					context.setUpdated('order');
					iface.emit(Calendar.hookOrderChanged, order, oldOrder);
				}

			},
			components: {
				get: function() {
					return context.components;
				}
			},
			url: {
				get: function() {
					return context.url;
				}
			},
			caldav: {
				get: function() {
					return $window.location.origin + context.url;
				}
			},
			fcEventSource: {
				get: function() {
					return context.fcEventSource;
				}
			},
			shares: {
				get: function() {
					return context.shares;
				}
			},
			tmpId: {
				get: function() {
					return context.tmpId;
				}
			}
		});

		iface.hasUpdated = function() {
			return context.updatedProperties.length !== 0;
		};

		iface.getUpdated = function() {
			return context.updatedProperties;
		};

		iface.addWarning = function(msg) {
			context.warnings.push(msg);
		};

		iface.hasWarnings = function() {
			return context.warnings.length > 0;
		};

		iface.resetWarnings = function() {
			context.warnings = [];
		};

		iface.toggleEnabled = function() {
			context.mutableProperties.enabled = !context.mutableProperties.enabled;
			context.setUpdated('enabled');
			iface.emit(Calendar.hookEnabledChanged, context.mutableProperties.enabled, !context.mutableProperties.enabled);
		};

		iface.isShared = function() {
			return context.shares.groups.length !== 0 ||
					context.shares.users.length !== 0;
		};

		iface.isPublished = function() {
			return false;
		};

		iface.isShareable = function() {
			return context.shareable;
		};

		iface.isPublishable = function() {
			return false;
		};

		iface.isRendering = function() {
			return context.fcEventSource.isRendering;
		};

		iface.isWritable = function() {
			return context.writable;
		};

		iface.arePropertiesWritable = function() {
			return context.writableProperties;
		};

		Object.assign(
			iface,
			Hook(context)
		);

		return iface;
	}

	Calendar.isCalendar = function(obj) {
		return obj instanceof Calendar || (typeof obj === 'object' && obj !== null && obj._isACalendarObject !== null);
	};

	Calendar.hookFinishedRendering = 1;
	Calendar.hookColorChanged = 2;
	Calendar.hookDisplaynameChanged = 3;
	Calendar.hookEnabledChanged = 4;
	Calendar.hookOrderChanged = 5;

	return Calendar;
});
