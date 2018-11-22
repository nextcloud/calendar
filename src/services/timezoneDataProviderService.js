/**
 * @copyright Copyright (c) 2018 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import tzData from '../../timezones/zones.json'
import ICAL from 'ical.js'

console.debug(`The calendar app is using version ${tzData.version} of the timezone database`)

/**
 * Checks whether the given timezone is a so-called Olsen Timezone
 * @see https://en.wikipedia.org/wiki/Tz_database
 *
 * @param {String} tzName name of timezone
 * @returns {boolean}
 */
export function isOlsonTimezone(tzName) {
	const hasSlash = tzName.indexOf('/') !== -1
	const hasSpace = tzName.indexOf(' ') !== -1
	const startsWithETC = tzName.startsWith('Etc')
	const startsWithUS = tzName.startsWith('US/')

	return hasSlash && !hasSpace && !startsWithETC && !startsWithUS
}

/**
 * checks if timezone is just an alias
 *
 * @param {String} tzName name of timezone
 * @returns {boolean}
 */
export function isAlias(tzName) {
	return tzData.aliases.hasOwnProperty(tzName)
}

/**
 * gets timezone object for given name
 *
 * @param {String} tzName  name of timezone
 * @returns {icaltimezone}
 */
export function getTimezone(tzName) {
	if (isAlias(tzName)) {
		return getTimezone(tzData.aliases[tzName])
	}

	// GMT maps to UTC, so only check UTC
	if (tzName === 'UTC') {
		return ICAL.TimezoneService.get('UTC')
	} else if (tzName === 'floating') {
		return ICAL.Timezone.localTimezone
	}

	if (!tzData.zones.hasOwnProperty(tzName)) {
		throw new Error('Unknown timezone')
	}

	const ics = tzData.zones[tzName].ics
	const jCal = ICAL.parse(ics)
	const components = new ICAL.Component(jCal)
	if (components.name === 'vtimezone') {
		return new ICAL.Timezone(components)
	} else {
		return new ICAL.Timezone(components.getFirstSubcomponent('vtimezone'))
	}
}

/**
 * lists all timezones available (without aliases)
 *
 * @returns {String[]}
 */
export function listAllTimezones() {
	const olsonAliases = []
	tzData.aliases.forEach((value, key) => {
		if (isOlsonTimezone(key)) {
			olsonAliases.push(key)
		}
	})

	const timezones = Object.keys(tzData.zones).concat(olsonAliases)
	timezones.sort()

	return timezones
}
