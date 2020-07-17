/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
import { getTimezoneManager } from 'calendar-js'
import logger from '../utils/logger.js'

const timezoneManager = getTimezoneManager()
let initialized = false

/**
 * Gets the timezone-manager
 * initializes it if necessary
 *
 * @returns {TimezoneManager}
 */
export default function() {
	if (!initialized) {
		initialize()
	}

	return timezoneManager
}

/**
 * Initializes the timezone-manager with all timezones shipped by the calendar app
 */
function initialize() {
	logger.debug(`The calendar app is using version ${tzData.version} of the timezone database`)

	for (const tzid in tzData.zones) {
		if (Object.prototype.hasOwnProperty.call(tzData.zones, [tzid])) {
			const ics = [
				'BEGIN:VTIMEZONE',
				'TZID:' + tzid,
				...tzData.zones[tzid].ics,
				'END:VTIMEZONE',
			].join('\r\n')
			timezoneManager.registerTimezoneFromICS(tzid, ics)
		}
	}

	for (const tzid in tzData.aliases) {
		if (Object.prototype.hasOwnProperty.call(tzData.aliases, [tzid])) {
			timezoneManager.registerAlias(tzid, tzData.aliases[tzid].aliasTo)
		}
	}

	initialized = true
}
