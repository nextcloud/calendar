/**
 * ownCloud - Calendar App
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
app.filter('importCalendarFilter',
	function () {
		'use strict';

		return function (calendars, file) {
			var possibleCalendars = [];

			if (typeof file.split === 'undefined') {
				return possibleCalendars;
			}

			angular.forEach(calendars, function(calendar) {
				if (file.split.vevent.length !== 0 && !calendar.components.vevent) {
					return;
				}
				if (file.split.vjournal.length !== 0 && !calendar.components.vjournal) {
					return;
				}
				if (file.split.vtodo.length !== 0 && !calendar.components.vtodo) {
					return;
				}

				possibleCalendars.push(calendar);
			});

			return possibleCalendars;
		};
	}
);
