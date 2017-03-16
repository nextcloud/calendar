/**
 * ownCloud - Calendar App
 *
 * @author Georg Ehrke
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

app.factory('WebCal', function($http, Calendar, VEvent, TimezoneService, WebCalService, WebCalUtility) {
	'use strict';

	/**
	 * instantiate a webcal object
	 * @param {object} CalendarService
	 * @param {string} url
	 * @param {object} props
	 * @returns {object}
	 * @constructor
	 */
	function WebCal(CalendarService, url, props) {
		const context = {
			calendarService: CalendarService,
			updatedProperties: [],
			storedUrl: props.href, //URL stored in CalDAV
			url: WebCalUtility.fixURL(props.href)
		};

		const iface = Calendar(CalendarService, url, props);
		iface._isAWebCalObject = true;

		context.setUpdated = function(property) {
			if (context.updatedProperties.indexOf(property) === -1) {
				context.updatedProperties.push(property);
			}
		};

		Object.defineProperties(iface, {
			downloadUrl: {
				get: function() {
					return context.url;
				}
			},
			storedUrl: {
				get: function () {
					return context.storedUrl;
				}
			}
		});

		iface.fcEventSource.events = function (start, end, timezone, callback) {
			var fcAPI = this;
			iface.fcEventSource.isRendering = true;
			iface.emit(Calendar.hookFinishedRendering);

			const allowDowngradeToHttp = !context.storedUrl.startsWith('https://');

			const TimezoneServicePromise = TimezoneService.get(timezone);
			const WebCalServicePromise = WebCalService.get(context.url, allowDowngradeToHttp);
			Promise.all([TimezoneServicePromise, WebCalServicePromise]).then(function(results) {
				const [tz, response] = results;
				const promises = [];
				let vevents = [];

				response.vevents.forEach((ics) => {
					try {
						const vevent = VEvent.fromRawICS(iface, ics);
						const promise = vevent.getFcEvent(start, end, tz).then((vevent) => {
							vevents = vevents.concat(vevent);
						}).catch((reason) => {
							iface.addWarning(reason);
							console.log(event, reason);
						});

						promises.push(promise);
					} catch(e) {
						// catch errors in VEvent.fromRawICS
						console.log(e);
					}
				});

				return Promise.all(promises).then(() => {
					callback(vevents);
					fcAPI.reportEventChange();

					iface.fcEventSource.isRendering = false;
					iface.emit(Calendar.hookFinishedRendering);
				});
			}).catch(function(reason) {
				if (reason === 'Unknown timezone' && timezone !== 'UTC') {
					const eventsFn = iface.fcEventSource.events.bind(fcAPI);
					eventsFn(start, end, 'UTC', callback);
				} else if (reason.redirect === true) {
					if (context.storedUrl === reason.new_url) {
						return Promise.reject('Fatal error. Redirected URL matched original URL. Aborting');
					}

					context.storedUrl = reason.new_url;
					context.url = reason.new_url;
					context.setUpdated('storedUrl');
					iface.update();
					const eventsFn = iface.fcEventSource.events.bind(fcAPI);
					eventsFn(start, end, timezone, callback);
				} else {
					iface.addWarning(reason);
					console.log(reason);
					iface.fcEventSource.isRendering = false;
					iface.emit(Calendar.hookFinishedRendering);
				}
			});
		};

		iface.eventsAccessibleViaCalDAV = function() {
			return false;
		};

		const parentGetUpdated = iface.getUpdated;
		iface.getUpdated = function() {
			const updated = parentGetUpdated();
			return updated.concat(context.updatedProperties);
		};

		const parentResetUpdated = iface.resetUpdated;
		iface.resetUpdated = function() {
			parentResetUpdated();
			context.updatedProperties = [];
		};

		iface.delete = function() {
			localStorage.removeItem(iface.storedUrl);
			return context.calendarService.delete(iface);
		};

		return iface;
	}

	WebCal.isWebCal = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isAWebCalObject === true);
	};

	return WebCal;
});
