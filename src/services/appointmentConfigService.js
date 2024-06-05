/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
