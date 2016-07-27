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
app.service('StringUtility', function () {
	'use strict';

	this.uid = function() {
			return Math.random().toString(36).substr(2).toUpperCase() +
				Math.random().toString(36).substr(2).toUpperCase();
	};

	this.uri = function(start, isAvailable) {
		start = start || '';

		var uri = start.toString().toLowerCase()
			.replace(/\s+/g, '-')           // Replace spaces with -
			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
			.replace(/\-\-+/g, '-')         // Replace multiple - with single -
			.replace(/^-+/, '')             // Trim - from start of text
			.replace(/-+$/, '');            // Trim - from end of text

		if (uri === '') {
			uri = '-';
		}

		if (isAvailable(uri)) {
			return uri;
		}

		if (uri.indexOf('-') === -1) {
			uri = uri + '-1';
			if (isAvailable(uri)) {
				return uri;
			}
		}

		// === false because !undefined = true, possible infinite loop
		do {
			var positionLastDash = uri.lastIndexOf('-');
			var firstPart = uri.substr(0, positionLastDash);
			var lastPart = uri.substr(positionLastDash + 1);

			if (lastPart.match(/^\d+$/)) {
				lastPart = parseInt(lastPart);
				lastPart++;

				uri = firstPart + '-' + lastPart;
			} else {
				uri = uri + '-1';
			}
		} while(isAvailable(uri) === false);

		return uri;
	};
});