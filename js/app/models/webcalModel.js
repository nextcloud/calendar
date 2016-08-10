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

	function WebCal(url, props) {
		const context = {
			storedUrl: props.href, //URL stored in CalDAV
			url: WebCalUtility.fixURL(props.href)
		};

		const iface = Calendar(url, props);
		iface._isAWebCalObject = true;

		Object.defineProperties(iface, {
			downloadUrl: {
				get: function() {
					return context.url;
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
				let vevents = [];

				response.vevents.forEach(function(ical) {
					try {
						const vevent = new VEvent(iface, ical, '', '');
						const events = vevent.getFcEvent(start, end, tz);
						vevents = vevents.concat(events);
					} catch (err) {
						iface.addWarning(err.toString());
						console.log(err);
						console.log(event);
					}
				});

				callback(vevents);
				fcAPI.reportEvents(fcAPI.clientEvents());

				iface.fcEventSource.isRendering = false;
				iface.emit(Calendar.hookFinishedRendering);
			}).catch(function(reason) {
				iface.addWarning(reason);
				console.log(reason);
				iface.fcEventSource.isRendering = false;
				iface.emit(Calendar.hookFinishedRendering);
			});
		};

		iface.eventsAccessibleViaCalDAV = function() {
			return false;
		};

		return iface;
	}

	WebCal.isWebCal = function(obj) {
		return (typeof obj === 'object' && obj !== null && obj._isAWebCalObject === false);
	};

	return WebCal;
});
