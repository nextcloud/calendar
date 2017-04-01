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

app.service('TimezoneService', function (TimezoneDataProvider, Timezone) {
	'use strict';

	const context = {};

	// List of available timezones
	const timezoneList = Object.keys(TimezoneDataProvider.zones);

	context.isOlsonTimezone = (tzName) => {
		const hasSlash = tzName.indexOf('/') !== -1;
		const hasSpace = tzName.indexOf(' ') !== -1;
		const startsWithETC = tzName.startsWith('Etc');
		const startsWithUS = tzName.startsWith('US/');

		return hasSlash && !hasSpace && !startsWithETC && !startsWithUS;
	};

	/**
	 * get the browser's timezone id
	 * @returns {string}
	 */
	this.current = function () {
		const tz = jstz.determine();
		let tzname = tz ? tz.name() : 'UTC';

		if (TimezoneDataProvider.aliases[tzname]) {
			return TimezoneDataProvider.aliases[tzname].aliasTo;
		}

		return tzname;
	};


	/**
	 * get a timezone object by it's id
	 * @param tzid
	 * @returns {Promise}
	 */
	this.get = function (tzid) {
		if (TimezoneDataProvider.aliases[tzid]) {
			tzid = TimezoneDataProvider.aliases[tzid].aliasTo;
		}

		// GMT maps to UTC, so only check UTC
		if (tzid === 'UTC') {
			return Promise.resolve(new Timezone(ICAL.TimezoneService.get('UTC')));
		} else if (tzid === 'floating') {
			return Promise.resolve(new Timezone(ICAL.Timezone.localTimezone));
		}

		if (!TimezoneDataProvider.zones.hasOwnProperty(tzid)) {
			return Promise.reject('Unknown timezone');
		}

		const ics = TimezoneDataProvider.zones[tzid].ics;
		return Promise.resolve(new Timezone(ics));
	};

	/**
	 * list all timezone ids
	 * @returns {Promise}
	 */
	this.listAll = function () {
		const olsonAliases = [];
		angular.forEach(TimezoneDataProvider.aliases, (value, key) => {
			if (context.isOlsonTimezone(key)) {
				olsonAliases.push(key);
			}
		});

		const timezones = timezoneList.concat(olsonAliases).concat(['UTC']);
		timezones.sort();

		return Promise.resolve(timezones);
	};
});
