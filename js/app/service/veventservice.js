/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <beingminimal@gmail.com>
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

app.service('VEventService', ['DavClient', 'VEvent', 'RandomStringService', function(DavClient, VEvent, RandomStringService) {
	'use strict';

	var _this = this;

	this._xmls = new XMLSerializer();

	this.getAll = function(calendar, start, end) {
		var xmlDoc = document.implementation.createDocument('', '', null);
		var cCalQuery = xmlDoc.createElement('c:calendar-query');
		cCalQuery.setAttribute('xmlns:c', 'urn:ietf:params:xml:ns:caldav');
		cCalQuery.setAttribute('xmlns:d', 'DAV:');
		cCalQuery.setAttribute('xmlns:a', 'http://apple.com/ns/ical/');
		cCalQuery.setAttribute('xmlns:o', 'http://owncloud.org/ns');
		xmlDoc.appendChild(cCalQuery);

		var dProp = xmlDoc.createElement('d:prop');
		cCalQuery.appendChild(dProp);

		var dGetEtag = xmlDoc.createElement('d:getetag');
		dProp.appendChild(dGetEtag);

		var cCalendarData = xmlDoc.createElement('c:calendar-data');
		dProp.appendChild(cCalendarData);

		var cFilter = xmlDoc.createElement('c:filter');
		cCalQuery.appendChild(cFilter);

		var cCompFilterVCal = xmlDoc.createElement('c:comp-filter');
		cCompFilterVCal.setAttribute('name', 'VCALENDAR');
		cFilter.appendChild(cCompFilterVCal);

		var cCompFilterVEvent = xmlDoc.createElement('c:comp-filter');
		cCompFilterVEvent.setAttribute('name', 'VEVENT');
		cCompFilterVCal.appendChild(cCompFilterVEvent);

		var cTimeRange = xmlDoc.createElement('c:time-range');
		cTimeRange.setAttribute('start', this._getTimeRangeStamp(start));
		cTimeRange.setAttribute('end', this._getTimeRangeStamp(end));
		cCompFilterVEvent.appendChild(cTimeRange);

		var url = calendar.url;
		var headers = {
			'Content-Type': 'application/xml; charset=utf-8',
			'Depth': 1,
			'requesttoken': OC.requestToken
		};
		var body = this._xmls.serializeToString(cCalQuery);

		return DavClient.request('REPORT', url, headers, body).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				//TODO - something went wrong
				return;
			}

			var vevents = [];

			for (var i in response.body) {
				var object = response.body[i];
				var properties = object.propStat[0].properties;

				var data = properties['{urn:ietf:params:xml:ns:caldav}calendar-data'];
				var etag = properties['{DAV:}getetag'];
				var uri = object.href.substr(object.href.lastIndexOf('/') + 1);

				var vevent;
				//try {
					vevent = new VEvent(calendar, data, etag, uri);
				//} catch(e) {
				//	console.log(e);
				//	continue;
				//}
				vevents.push(vevent);
			}

			return vevents;
		});
	};

	this.get = function(calendar, uri) {
		var url = calendar.url + uri;
		return DavClient.request('GET', url, {'requesttoken' : OC.requestToken}, '').then(function(response) {
			return new VEvent(calendar, response.body, response.xhr.getResponseHeader('ETag'), uri);
		});
	};

	this.create = function(calendar, data, returnEvent) {
		if (typeof returnEvent === 'undefined') {
			returnEvent = true;
		}

		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'requesttoken': OC.requestToken
		};
		var uri = this._generateRandomUri();
		var url = calendar.url + uri;

		return DavClient.request('PUT', url, headers, data).then(function(response) {
			if (!DavClient.wasRequestSuccessful(response.status)) {
				return false;
				// TODO - something went wrong, do smth about it
			}

			return returnEvent ?
				_this.get(calendar, uri) :
				true;
		});
	};

	this.update = function(event) {
		var url = event.calendar.url + event.uri;
		var headers = {
			'Content-Type': 'text/calendar; charset=utf-8',
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('PUT', url, headers, event.data).then(function(response) {
			event.etag = response.xhr.getResponseHeader('ETag');
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this.delete = function(event) {
		var url = event.calendar.url + event.uri;
		var headers = {
			'If-Match': event.etag,
			'requesttoken': OC.requestToken
		};

		return DavClient.request('DELETE', url, headers, '').then(function(response) {
			return DavClient.wasRequestSuccessful(response.status);
		});
	};

	this._generateRandomUri = function() {
		var uri = 'ownCloud-';
		uri += RandomStringService.generate();
		uri += RandomStringService.generate();
		uri += '.ics';

		return uri;
	};

	this._getTimeRangeStamp = function(momentObject) {
		return momentObject.format('YYYYMMDD') + 'T' + momentObject.format('HHmmss') + 'Z';
	};

}]);
