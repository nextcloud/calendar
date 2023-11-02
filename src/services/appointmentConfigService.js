/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { generateUrl } from '@nextcloud/router'
import axios from '@nextcloud/axios'
import AppointmentConfig from '../models/appointmentConfig.js'
import logger from '../utils/logger.js'

/**
 * Create a new appointment config in the backend
 *
 * @param {AppointmentConfig} config The config to save
 * @return {Promise<AppointmentConfig>} Full appointment config with an id
 */
export async function createConfig(config) {
	logger.debug('Creating appointment config', { config })
	const url = generateUrl('/apps/calendar/v1/appointment_configs')

	const response = await axios.post(url, config)
	return new AppointmentConfig(response.data.data)
}

/**
 * Delete a stored appointment config from the backend
 *
 * @param {number} id The id of the config
 * @return {Promise<void>}
 */
export async function deleteConfig(id) {
	logger.debug('Deleting appointment config', { id })
	const url = generateUrl('/apps/calendar/v1/appointment_configs/{id}', {
		id,
	})

	await axios.delete(url)
}

/**
 * Update an appointment config in the backend
 *
 * @param {AppointmentConfig} config The config to update
 * @return {Promise<AppointmentConfig>} Updated appointment config as stored in the backend
 */
export async function updateConfig(config) {
	logger.debug('Updating appointment config', { config })
	const url = generateUrl('/apps/calendar/v1/appointment_configs/{id}', {
		id: config.id,
	})

	const response = await axios.put(url, config)
	return new AppointmentConfig(response.data.data)
}
