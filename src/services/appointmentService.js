/**
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license AGPL-3.0-or-later
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'

/**
 * @param config {object} the appointment config object
 * @param date {string} selected availability date in yyyy-m-d format
 * @param timeZone {String} target time zone for the time stamps
 */
export async function findSlots(config, date, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{token}/slots?dateSelected={date}&timeZone={timeZone}', {
		token: config.token,
		date,
		timeZone,
	})

	const response = await axios.get(url)

	return response.data.data
}

/**
 * @param config
 * @param slot
 * @param displayName
 * @param email
 * @param description
 * @param timeZone
 */
export async function bookSlot(config, slot, displayName, email, description, timeZone) {
	const url = generateUrl('/apps/calendar/appointment/{token}/book', {
		token: config.token,
	})

	const response = await axios.post(url, {
		start: slot.start,
		end: slot.end,
		displayName,
		email,
		description,
		timeZone,
	})

	return response.data.data
}
