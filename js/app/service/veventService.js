/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
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

app.service('VEventService', function(DavClient, StringUtility, XMLUtility, VEvent) {
	'use strict';

	const context = {
		calendarDataPropName: '{' + DavClient.NS_IETF + '}calendar-data',
		eTagPropName: '{' + DavClient.NS_DAV + '}getetag',
		self: this
	};

	/**
	 * get url for event
	 * @param {VEvent} event
	 * @returns {string}
	 */
	context.getEventUrl = function(event) {
		return event.calendar.url + event.uri;
	};

	/**
	 * get a time-range string from moment object
	 * @param {moment} momentObject
	 * @returns {string}
	 */
	context.getTimeRangeString = function(momentObject) {
		const utc = momentObject.utc();
		return utc.format('YYYYMMDD') + 'T' + utc.format('HHmmss') + 'Z';
	};

	/**
	 * get all events from a calendar within a time-range
	 * @param {Calendar} calendar
	 * @param {moment} start
	 * @param {moment} end
	 * @returns {Promise}
	 */
	this.getAll = function (calendar, start, end) {
		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton([DavClient.NS_IETF, 'c:calendar-query']);
		dPropChildren.push({
			name: [DavClient.NS_DAV, 'd:prop'],
			children: [{
				name: [DavClient.NS_DAV, 'd:getetag']
			}, {
				name: [DavClient.NS_IETF, 'c:calendar-data']
			}]
		});
		dPropChildren.push({
			name: [DavClient.NS_IETF, 'c:filter'],
			children: [{
				name: [DavClient.NS_IETF, 'c:comp-filter'],
				attributes: [
					['name', 'VCALENDAR']
				],
				children: [{
					name: [DavClient.NS_IETF, 'c:comp-filter'],
					attributes: [
						['name', 'VEVENT']
					],
					children: [{
						name: [DavClient.NS_IETF, 'c:time-range'],
						attributes: [
							['start', context.getTimeRangeString(start)],
							['end', context.getTimeRangeString(end)]
						]
					}]
				}]
			}]
		});

		const url = calendar.url;
		const headers = {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': OC.requestToken
		};
		const xml = XMLUtility.serialize(skeleton);

		return DavClient.request('REPORT', url, headers, xml).then(function (response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return Promise.reject(response.status);
			}

			const vevents = [];
			for (let key in response.body) {
				if (!response.body.hasOwnProperty(key)) {
					continue;
				}

				const obj = response.body[key];
				const props = obj.propStat[0].properties;
				const calendarData = props[context.calendarDataPropName];
				const etag = props[context.eTagPropName];
				const uri = obj.href.substr(obj.href.lastIndexOf('/') + 1);

				try {
					const vevent = VEvent.fromRawICS(calendar, calendarData, uri, etag);
					vevents.push(vevent);
				} catch (e) {
					console.log(e);
				}
			}

			return vevents;
		});
	};

	/**
	 * get an event by uri from a calendar
	 * @param {Calendar} calendar
	 * @param {string} uri
	 * @returns {Promise}
	 */
	this.get = function (calendar, uri) {
		const url = calendar.url + uri;
		const headers = {
			'requesttoken': OC.requestToken
		};

		return DavClient.request('GET', url, headers, '').then(function (response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return Promise.reject(response.status);
			}

			const calendarData = response.body;
			const etag = response.xhr.getResponseHeader('ETag');

			try {
				return VEvent.fromRawICS(calendar, calendarData, uri, etag);
			} catch (e) {
				console.log(e);
				return Promise.reject(e);
			}
		});
	};

	/**
	 * create a new event
	 * @param {Calendar} calendar
	 * @param {data} data
	 * @param {boolean} returnEvent
	 * @returns {Promise}
	 */
	this.create = function (calendar, data, returnEvent=true) {
		const headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': OC.requestToken
		};
		const uri = StringUtility.uid('Nextcloud', 'ics');
		const url = calendar.url + uri;

		return DavClient.request('PUT', url, headers, data).then(function (response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return Promise.reject(response.status);
			}

			if (returnEvent) {
				return context.self.get(calendar, uri);
			} else {
				return true;
			}
		});
	};

	/**
	 * update an event
	 * @param {VEvent} event
	 * @returns {Promise}
	 */
	this.update = function (event) {
		const url = context.getEventUrl(event);
		const headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};
		const payload = event.data;

		return DavClient.request('PUT', url, headers, payload).then(function (response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return Promise.reject(response.status);
			}

			// update etag of existing event
			event.etag = response.xhr.getResponseHeader('ETag');

			return true;
		});
	};

	/**
	 * delete an event
	 * @param {VEvent} event
	 * @returns {Promise}
	 */
	this.delete = function (event) {
		const url = context.getEventUrl(event);
		const headers = {
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('DELETE', url, headers, '').then(function (response) {
			if (DavClient.wasRequestSuccessful(response.status)) {
				return true;
			} else {
				return Promise.reject(response.status);
			}
		});
	};
});
