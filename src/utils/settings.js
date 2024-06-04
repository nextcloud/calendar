/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { linkTo } from '@nextcloud/router'

/**
 * Get URL to modify config-key
 *
 * @param {string} key URL of config-key to modify
 * @return {string}
 */
export function getLinkToConfig(key) {
	return [
		linkTo('calendar', 'index.php'),
		'v1/config',
		key,
	].join('/')
}
