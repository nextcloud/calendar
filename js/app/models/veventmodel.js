/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
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

app.factory('VEvent', ['$filter', 'fcHelper', 'objectConverter', function($filter, fcHelper, objectConverter) {
	'use strict';

	function VEvent(calendar, props, uri) {
		angular.extend(this, {
			calendar: calendar,
			data: props['{urn:ietf:params:xml:ns:caldav}calendar-data'],
			uri: uri,
			etag: props['{DAV:}getetag'] || null,
			getFcEvent: function(start, end, timezone) {
				return fcHelper.renderCalData(this, start, end, timezone);
			},
			getSimpleData: function(fcEvent) {
				var vevent = fcHelper.getCorrectEvent(fcEvent, this.data);
				return objectConverter.parse(vevent);
			},
			drop: function(fcEvent, delta) {
				var data = fcHelper.dropEvent(fcEvent, delta, this.data);
				if (data === null) {
					return false;
				}

				this.data = data;
				return true;
			},
			resize: function(fcEvent, delta) {
				var data = fcHelper.resizeEvent(fcEvent, delta, this.data);
				if (data === null) {
					return false;
				}

				this.data = data;
				return true;
			}
		});
	}

	return VEvent;
}]);
