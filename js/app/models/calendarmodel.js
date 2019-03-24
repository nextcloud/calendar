/**
 * Nextcloud - Calendar App
 *
 * @author Georg Ehrke
 * @author Vinicius Cubas Brand
 * @author Daniel Tygel
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
 * @copyright 2017 Vinicius Cubas Brand <vinicius@eita.org.br>
 * @copyright 2017 Daniel Tygel <dtygel@eita.org.br>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

app.factory('Calendar', function($window, Hook, VEventService, TimezoneService, ColorUtility, StringUtility) {
	'use strict';

	/**
	 * instantiate a calendar object
	 * @param {object} CalendarService
	 * @param {string} url
	 * @param {object} props
	 * @returns {object}
	 * @constructor
	 */
	function Calendar(CalendarService, url, props) {
		url = url || '';
		props = props || {};

		const context = {
			calendarService: CalendarService,
			fcEventSource: {},
			components: props.components,
			mutableProperties: {
				color: props.color,
				displayname: props.displayname,
				enabled: props.enabled,
				order: props.order,
				published: props.published
			},
			updatedProperties: [],
			tmpId: StringUtility.uid(),
			url: url,
			owner: props.owner,
			ownerDisplayname: props.ownerDisplayname,
			shares: props.shares,
			publicToken: props.publicToken,
			publishable: props.publishable,
			warnings: [],
			shareable: props.shareable,
			writable: props.writable,
			writableProperties: props.writableProperties
		};
		const iface = {
			_isACalendarObject: true
		};

		context.fcEventSource.events = function (start, end, timezone, callback) {
			const fcAPI = this;
			context.fcEventSource.isRendering = true;
			iface.emit(Calendar.hookFinishedRendering);

			start = moment(start.stripZone().format());
			end = moment(end.stripZone().format());

			const TimezoneServicePromise = TimezoneService.get(timezone);
			const VEventServicePromise = VEventService.getAll(iface, start, end);
			Promise.all([TimezoneServicePromise, VEventServicePromise]).then(function(results) {
				const [tz, events] = results;
				const promises = [];
				let vevents = [];

				events.forEach((event) => {
					const promise = event.getFcEvent(start, end, tz).then((vevent) => {
						vevents = vevents.concat(vevent);
					}).catch((reason) => {
						iface.addWarning(reason);
						console.log(event, reason);
					});

					promises.push(promise);
				});

				return Promise.all(promises).then(() => {
					callback(vevents);
					fcAPI.eventManager.currentPeriod.release();
					context.fcEventSource.isRendering = false;

					iface.emit(Calendar.hookFinishedRendering);
				});
			}).catch(function(reason) {
				if (reason === 'Unknown timezone' && timezone !== 'UTC') {
					const eventsFn = iface.fcEventSource.events.bind(fcAPI);
					eventsFn(start, end, 'UTC', callback);
				}

				callback([]);
				fcAPI.eventManager.currentPeriod.release();

				iface.addWarning(reason);
				context.fcEventSource.isRendering = false;
				iface.emit(Calendar.hookFinishedRendering);

				console.log(context.url, reason);
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
					const colors = ColorUtility.extractRGBFromHexString(context.mutableProperties.color);
					return ColorUtility.generateTextColorFromRGB(colors.r, colors.g, colors.b);
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
			downloadUrl: {
				get: function() {
					let url = context.url;
					// cut off last slash to have a fancy name for the ics
					if (url.slice(url.length - 1) === '/') {
						url = url.slice(0, url.length - 1);
					}
					url += '?export';

					return url;
				},
				configurable: true
			},
			caldav: {
				get: function() {
					return $window.location.origin + context.url;
				}
			},
			publicToken: {
				get: function() {
					return context.publicToken;
				},
				set: function(publicToken) {
					context.publicToken = publicToken;
				}
			},
			published: {
				get: function() {
					return context.mutableProperties.published;
				},
				set: function(published) {
					context.mutableProperties.published = published;
				}
			},
			publishable: {
				get: function() {
					return context.publishable;
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
			},
			warnings: {
				get: function() {
					return context.warnings;
				}
			},
			owner: {
				get: function() {
					return context.owner;
				}
			},
			ownerDisplayname: {
				get: function() {
					return context.ownerDisplayname;
				}
			}
		});

		iface.hasUpdated = function() {
			return context.updatedProperties.length !== 0;
		};

		iface.getUpdated = function() {
			return context.updatedProperties;
		};

		iface.resetUpdated = function() {
			context.updatedProperties = [];
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
			return context.shares.circles.length !== 0 ||
					context.shares.groups.length !== 0 ||
 					 context.shares.users.length !== 0;
		};

		iface.isPublished = function() {
			return context.mutableProperties.published;
		};

		iface.isPublishable = function() {
			return context.publishable;
		};

		iface.isShareable = function() {
			return context.shareable;
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

		iface.eventsAccessibleViaCalDAV = function() {
			return true;
		};

		iface.refresh = function() {
			// TODO in a follow up PR
		};

		iface.update = function() {
			return context.calendarService.update(iface);
		};

		iface.delete = function() {
			return context.calendarService.delete(iface);
		};

		iface.share = function(shareType, shareWith, shareWithDisplayname, writable, existingShare) {
			return context.calendarService.share(iface, shareType, shareWith, shareWithDisplayname, writable, existingShare);
		};

		iface.unshare = function(shareType, shareWith, writable, existingShare) {
			return context.calendarService.unshare(iface, shareType, shareWith, writable, existingShare);
		};

		iface.publish = function() {
			return context.calendarService.publish(iface);
		};

		iface.unpublish = function() {
			return context.calendarService.unpublish(iface);
		};

		Object.assign(
			iface,
			Hook(context)
		);

		return iface;
	}

	Calendar.isCalendar = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isACalendarObject === true);
	};

	Calendar.hookFinishedRendering = 1;
	Calendar.hookColorChanged = 2;
	Calendar.hookDisplaynameChanged = 3;
	Calendar.hookEnabledChanged = 4;
	Calendar.hookOrderChanged = 5;

	return Calendar;
});
