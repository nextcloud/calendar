import axios from '@nextcloud/axios'
import { generateUrl } from '@nextcloud/router'
import { translate as t } from '@nextcloud/l10n'

/**
 * @param {string} endpoint Endpoint name
 */
function getUrl(endpoint) {
	return generateUrl('apps/bbb/' + endpoint)
}

/**
 * @return {Promise<Array>}
 */
export async function listBbbRooms() {
	let response
	try {
		response = await axios.get(getUrl('rooms'))
		// eslint-disable-next-line no-console
		console.log(response)
		if (Array.isArray(response.data)) {
			return response.data
		} else {
			throw new Error('invalid BBB response')
		}
	} catch (error) {
		console.debug(error)
		throw error
	}
}

/**
 * @param {string|null} title title, defaults to 'Video link for event' if empty
 * @return {Promise<string>}
 */
export async function createBbbRoom(title = null) {

	// get restriction first: https://github.com/sualko/cloud_bbb/blob/master/ts/Common/Api.ts#L96
	const restriction = (await axios.get(getUrl('restrictions/user'))).data

	// https://github.com/sualko/cloud_bbb/blob/master/ts/Common/Api.ts#L11
	const accessTypes = {
		Public: 'public',
		Password: 'password',
		WaitingRoom: 'waiting_room',
		WaitingRoomAll: 'waiting_room_all',
		Internal: 'internal',
		InternalRestricted: 'internal_restricted',
	}

	// https://github.com/sualko/cloud_bbb/blob/master/ts/Manager/App.tsx#L87

	let access = accessTypes.Public

	const disabledRoomTypes = restriction?.roomTypes || []
	if (disabledRoomTypes.length > 0 && disabledRoomTypes.indexOf(access) > -1) {
		access = Object.values(accessTypes).filter(a => disabledRoomTypes.indexOf(a) < 0)[0]
	}

	const maxParticipants = restriction?.maxParticipants || 0

	// https://github.com/sualko/cloud_bbb/blob/master/ts/Common/Api.ts#L167

	const response = await axios.post(getUrl('rooms'), {
		name: title || t('calendar', 'Video link for event'),
		welcome: '',
		maxParticipants,
		record: false,
		access,
	})

	if (!response.data.uid) {
		throw new Error('invalid response from "rooms" endpoint, missing uid')
	}

	return makeRoomUrlFromToken(response.data.uid)
}

/**
 * @param {string} [token=''] token
 * @return {string}
 */
export function makeRoomUrlFromToken(token = '') {
	// https://github.com/sualko/cloud_bbb/blob/master/ts/Common/Api.ts#L148
	// TODO: url shortener
	return window.location.protocol + '//' + window.location.host + getUrl('b/' + token)
}

/**
 * Checks whether the description already contains a BBB link
 *
 * @param {?string} description Description of event
 * @return {boolean}
 */
export function doesDescriptionContainBbbLink(description) {
	if (!description) {
		return false
	}
	const fakeUrl = makeRoomUrlFromToken('')
	return description.includes(fakeUrl)
}
