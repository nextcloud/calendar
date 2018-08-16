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

app.service('DavClient', function($window) {
	'use strict';

	const client = new dav.Client({
		baseUrl: OC.linkToRemote('dav/calendars'),
		xmlNamespaces: {
			'DAV:': 'd',
			'urn:ietf:params:xml:ns:caldav': 'c',
			'http://apple.com/ns/ical/': 'aapl',
			'http://owncloud.org/ns': 'oc',
			'http://nextcloud.com/ns': 'nc',
			'http://calendarserver.org/ns/': 'cs'
		}
	});

	client.NS_DAV = 'DAV:';
	client.NS_IETF = 'urn:ietf:params:xml:ns:caldav';
	client.NS_APPLE = 'http://apple.com/ns/ical/';
	client.NS_OWNCLOUD = 'http://owncloud.org/ns';
	client.NS_NEXTCLOUD = 'http://nextcloud.com/ns';
	client.NS_CALENDARSERVER = 'http://calendarserver.org/ns/';

	/**
	 * get absolute url for path
	 * @param {string} path
	 * @returns {string}
	 */
	client.buildUrl = function(path) {
		if (path.substr(0,1) !== '/') {
			path = '/' + path;
		}

		return $window.location.origin + path;
	};

	/**
	 * get a nodes full name including its namespace
	 * @param {Node} node
	 * @returns {string}
	 */
	client.getNodesFullName = function(node) {
		return '{' + node.namespaceURI + '}' + node.localName;
	};

	/**
	 * get response code from http response
	 * @param {string} t
	 * @returns {Number}
	 */
	client.getResponseCodeFromHTTPResponse = function(t) {
		return parseInt(t.split(' ')[1]);
	};

	/**
	 * check if request was successful
	 * @param {Number} status
	 * @returns {boolean}
	 */
	client.wasRequestSuccessful = function(status) {
		return (status >= 200 && status <= 299);
	};

	return client;
});
