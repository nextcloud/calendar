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
 * Finds teams by displayname
 *
 * @param {string} query The search-term
 * @return {Promise<void>}
 */
const teamSearchByName = async (query) => {
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

	let teams = []
	if (Array.isArray(results.data.ocs.data.circles)) {
		teams = teams.concat(results.data.ocs.data.circles)
	}
	if (Array.isArray(results.data.ocs.data.exact.circles)) {
		teams = teams.concat(results.data.ocs.data.exact.circles)
	}

	if (teams.length === 0) {
		return []
	}

	return teams.filter((team) => {
		return true
	}).map(team => ({
		displayname: team.label,
		population: team.value.circle.population,
		id: team.value.circle.id,
		instance: team.value.circle.owner.instance,
	}))
}

/**
 * Get members of team by id
 *
 * @param {string} circleId The team id to query
 * @return {Promise<void>}
 */
const teamGetMembers = async (circleId) => {
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
	teamSearchByName,
	teamGetMembers,
}
