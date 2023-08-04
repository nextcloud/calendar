/**
 * @copyright Copyright (c) 2023 Jonas Heinrich
 *
 * @author Jonas Heinrich <heinrich@synyx.net>
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import HttpClient from '@nextcloud/axios'
import {
	generateOcsUrl,
	linkTo,
} from '@nextcloud/router'

/**
 * Finds circles by displayname
 *
 * @param {string} query The search-term
 * @return {Promise<void>}
 */
const circleSearchByName = async (query) => {
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

	return circles.filter((circle) => {
		return true
	}).map(circle => ({
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
const circleGetMembers = async (circleId) => {
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
	circleSearchByName,
	circleGetMembers,
}
