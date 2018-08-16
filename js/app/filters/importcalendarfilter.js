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
app.filter('importCalendarFilter', function () {
	'use strict';

	return function (calendars, file) {
		if (!Array.isArray(calendars) || typeof file !== 'object' || !file || typeof file.splittedICal !== 'object' || !file.splittedICal) {
			return [];
		}

		var events = file.splittedICal.vevents.length,
			journals = file.splittedICal.vjournals.length,
			todos = file.splittedICal.vtodos.length;

		return calendars.filter(function(calendar) {
			if (events !== 0 && !calendar.components.vevent) {
				return false;
			}
			if (journals !== 0 && !calendar.components.vjournal) {
				return false;
			}
			if (todos !== 0 && !calendar.components.vtodo) {
				return false;
			}

			return true;
		});
	};
});
