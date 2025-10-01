/**
 * SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import HttpClient from '@nextcloud/axios'
import {
	generateOcsUrl,
	linkTo,
} from '@nextcloud/router'
import logger from '../utils/logger.js'

/**
 * Finds circles by displayname
 *
 * @param {string} query The search-term
 * @return {Promise<void>}
 */
async function circleSearchByName(query) {
	let results
	try {
		results = await HttpClient.get(generateOcsUrl('apps/files_sharing/api/v1/') + 'sharees', {
			params: {
				format: 'json',
				search: query,
				perPage: 200,
				itemType: 'pringroucipals',
			},
		})
	} catch (error) {
		logger.error(`Failed to fetch circles: ${error}`, {
			query,
			error,
		})
		return []
	}

	if (results.data.ocs.meta.status === 'failure') {
		return []
	}

	let circles = []
	if (Array.isArray(results.data.ocs.data.circles)) {
		circles = circles.concat(results.data.ocs.data.circles)
	}
	if (Array.isArray(results.data.ocs.data.exact.circles)) {
		circles = circles.concat(results.data.ocs.data.exact.circles)
	}

	if (circles.length === 0) {
		return []
	}

	return circles.map((circle) => ({
		displayname: circle.label,
		population: circle.value.circle.population,
		id: circle.value.circle.id,
		instance: circle.value.circle.owner.instance,
	}))
}

/**
 * Get members of circle by id
 *
 * @param {string} circleId The circle id to query
 * @return {Promise<void>}
 */
async function circleGetMembers(circleId) {
	let results
	try {
		results = await HttpClient.get(linkTo('calendar', 'index.php') + '/v1/circles/getmembers', {
			params: {
				format: 'json',
				circleId,
			},
		})
	} catch (error) {
		console.debug(error)
		return []
	}
	return results
}

export {
	circleGetMembers,
	circleSearchByName,
}
