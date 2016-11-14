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

app.service('WebCalUtility', function($rootScope) {
	'use strict';

	/**
	 * check if downgrading is allowed
	 * @param {string} url
	 * @returns {boolean}
	 */
	this.allowDowngrade = function(url) {
		return !url.startsWith('https://');
	};

	/**
	 * construct proxy url
	 * @param url
	 * @returns {string}
	 */
	this.buildProxyURL = function(url) {
		return $rootScope.baseUrl + 'proxy?url=' + encodeURIComponent(url);
	};

	/**
	 * check if a downgrade is possible
	 * @param {string} url
	 * @param {boolean} allowDowngradeToHttp
	 * @returns {boolean}
	 */
	this.downgradePossible = function(url, allowDowngradeToHttp) {
		return url.startsWith('https://') && allowDowngradeToHttp;
	};

	/**
	 * downgrade a url from https to insecure http
	 * @param {string} url
	 * @returns {string}
	 */
	this.downgradeURL = function(url) {
		if (url.startsWith('https://')) {
			return 'http://' + url.substr(8);
		}
	};

	/**
	 * replace webcal:// in a url
	 * @param {string} url
	 * @returns {string}
	 */
	this.fixURL = function(url) {
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		} else if (url.startsWith('webcal://')) {
			return 'https://' + url.substr(9);
		} else {
			return 'https://' + url;
		}
	};
});
