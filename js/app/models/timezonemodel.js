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

app.factory('Timezone',
	function() {
		'use strict';

		var timezone = function Timezone(data) {
			angular.extend(this, {
				_props: {}
			});

			if (data instanceof ICAL.Timezone) {
				this._props.jCal = data;
				this._props.name = data.tzid;
			} else if (typeof data === 'string') {
				var jCal = ICAL.parse(data);
				var components = new ICAL.Component(jCal);
				var iCalTimezone = null;
				if (components.name === 'vtimezone') {
					iCalTimezone = new ICAL.Timezone(components);
				} else {
					iCalTimezone = new ICAL.Timezone(components.getFirstSubcomponent('vtimezone'));
				}
				this._props.jCal = iCalTimezone;
				this._props.name = iCalTimezone.tzid;
			}
		};

		//Timezones are immutable
		timezone.prototype = {
			get jCal() {
				return this._props.jCal;
			},
			get name() {
				return this._props.name;
			}
		};

		return timezone;
	}
);
