/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import HttpClient from '@nextcloud/axios'
import { getLinkToConfig } from '../utils/settings.js'

/**
 *
 * @param {string} key Config-key to set
 * @param {string | number | boolean} value Config-value to set
 * @return {Promise<void>}
 */
const setConfig = async (key, value) => {
	await HttpClient.post(getLinkToConfig(key), { value })
}

export {
	setConfig,
}
