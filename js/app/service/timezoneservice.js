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

app.service('TimezoneService', ['$rootScope', '$http', 'Timezone', 'TimezoneListProvider',
	function ($rootScope, $http, Timezone, TimezoneListProvider) {
		'use strict';

		var _this = this;
		this._timezones = {};

		this._timezones.UTC = new Timezone(ICAL.TimezoneService.get('UTC'));
		this._timezones.GMT = this._timezones.UTC;
		this._timezones.Z = this._timezones.UTC;
		this._timezones.FLOATING = new Timezone(ICAL.Timezone.localTimezone);

		this.listAll = function () {
			return TimezoneListProvider;
		};

		this.get = function (tzid) {
			tzid = tzid.toUpperCase();


			if (_this._timezones[tzid]) {
				return new Promise(function (resolve) {
					resolve(_this._timezones[tzid]);
				});
			}

			_this._timezones[tzid] = $http({
				method: 'GET',
				url: $rootScope.baseUrl + 'timezones/' + tzid + '.ics'
			}).then(function (response) {
				if (response.status >= 200 && response.status <= 299) {
					var timezone = new Timezone(response.data);
					_this._timezones[tzid] = timezone;

					return timezone;
				}
			});

			return _this._timezones[tzid];
		};

		this.getCurrent = function () {
			return this.get(this.current());
		};

		this.current = function () {
			var tz = jstz.determine();
			var tzname = tz ? tz.name() : 'UTC';

			switch(tzname) {
				case 'Etc/UTC':
					tzname = 'UTC';
					break;

				default:
					break;
			}

			return tzname;
		};
	}
]);
