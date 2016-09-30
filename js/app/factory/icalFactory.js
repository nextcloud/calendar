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

app.service('ICalFactory', function() {
	'use strict';

	const self = this;

	/**
	 * create a new ICAL calendar object
	 * @returns {ICAL.Component}
	 */
	this.new = function() {
		const root = new ICAL.Component(['vcalendar', [], []]);

		const version = angular.element('#fullcalendar').attr('data-appVersion');
		root.updatePropertyWithValue('prodid', '-//Nextcloud calendar v' + version);

		root.updatePropertyWithValue('version', '2.0');
		root.updatePropertyWithValue('calscale', 'GREGORIAN');

		return root;
	};

	/**
	 * create a new ICAL calendar object that contains a calendar
	 * @param uid
	 * @returns ICAL.Component
	 */
	this.newEvent = function(uid) {
		const comp = self.new();

		const event = new ICAL.Component('vevent');
		comp.addSubcomponent(event);

		event.updatePropertyWithValue('created', ICAL.Time.now());
		event.updatePropertyWithValue('dtstamp', ICAL.Time.now());
		event.updatePropertyWithValue('last-modified', ICAL.Time.now());
		event.updatePropertyWithValue('uid', uid);

		//add a dummy dtstart, so it's a valid ics
		event.updatePropertyWithValue('dtstart', ICAL.Time.now());

		return comp;
	};
});
