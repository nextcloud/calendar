/**
 * @copyright Copyright (c) 2018 Georg Ehrke
 * @copyright Copyright (c) 2018 John Molakvoæ
 * @copyright Copyright (c) 2018 Thomas Citharel
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 * @author Thomas Citharel <tcit@tcit.fr>
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
import Vue from 'vue'
import ICAL from 'ical.js'
import parseIcs from '../services/parseIcs'
import defaultColor from '../services/defaultColor'
import client from '../services/cdav'
import Event from '../models/event'
import pLimit from 'p-limit'

const calendarModel = {
	id: '',
	displayName: '',
	color: '',
	enabled: true, // is the calendar visible in the grid
	loading: false, // is the calendar loading events
	components: [],
	owner: '',
	shares: [],
	publishURL: null,
	url: '',
	readOnly: false,
	order: 0,
	isSharedWithMe: false,
	canBeShared: false,
	canBePublished: false,
	dav: false
}

const state = {
	calendars: []
}

/**
 * map a dav collection to our calendar object model
 *
 * @param {Object} calendar the calendar object from the cdav library
 * @returns {Object}
 */
export function mapDavCollectionToCalendar(calendar) {
	return {
		// get last part of url
		id: calendar.url.split('/').slice(-2, -1)[0], // TODO - improve me
		displayName: calendar.displayname,
		color: calendar.color || defaultColor(),
		enabled: !!calendar.enabled,
		components: calendar.components,
		owner: calendar.owner,
		readOnly: !calendar.isWriteable(),
		order: calendar.order || 0,
		url: calendar.url,
		dav: calendar,
		shares: calendar.shares
			.filter((sharee) => sharee.href !== client.currentUserPrincipal.principalScheme) // public shares create a share with yourself ... should be fixed in server
			.map(sharee => Object.assign({}, mapDavShareeToSharee(sharee))),
		publishURL: calendar.publishURL || null,
		isSharedWithMe: calendar.owner !== client.currentUserPrincipal.principalUrl,
		canBeShared: calendar.isShareable(),
		canBePublished: calendar.isPublishable(),
	}
}

/**
 * map a dav collection to our calendar object model
 *
 * @param {Object} sharee the sharee object from the cdav library shares
 * @returns {Object}
 */
export function mapDavShareeToSharee(sharee) {
	const id = sharee.href.split('/').slice(-1)[0]
	const name = sharee['common-name']
		? sharee['common-name']
		: id

	return {
		displayName: name,
		id: id,
		writeable: sharee.access[0].endsWith('read-write'),
		isGroup: sharee.href.indexOf('principal:principals/groups/') === 0,
		uri: sharee.href
	}
}

const mutations = {

	/**
	 * Add calendar into state
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar calendar the calendar to add
	 */
	addCalendar(state, { calendar }) {
		// extend the calendar to the default model
		state.calendars.push(Object.assign({}, calendarModel, calendar))
	},

	/**
	 * Delete calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to delete
	 */
	deleteCalendar(state, { calendar }) {
		state.calendars.splice(state.calendars.indexOf(calendar), 1)
	},

	/**
	 * Toggle whether a calendar is Enabled
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to toggle
	 */
	toggleCalendarEnabled(context, { calendar }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.enabled = !calendar.enabled
	},

	/**
	 * Rename a calendar
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newName the new name of the calendar
	 */
	renameCalendar(context, { calendar, newName }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.displayName = newName
	},

	/**
	 * Change calendar's color
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newColor the new color of the calendar
	 */
	changeCalendarColor(context, { calendar, newColor }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.color = newColor
	},

	/**
	 * Change calendar's order
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to rename
	 * @param {String} data.newOrder the new order of the calendar
	 */
	changeCalendarOrder(context, { calendar, newOrder }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.order = newOrder
	},

	/**
	 * Share calendar with a user or group
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.user the userId
	 * @param {string} data.displayName the displayName
	 * @param {string} data.uri the sharing principalScheme uri
	 * @param {Boolean} data.isGroup is this a group ?
	 */
	shareCalendar(state, { calendar, user, displayName, uri, isGroup }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		const newSharee = {
			displayName,
			id: user,
			writeable: false,
			isGroup,
			uri
		}
		calendar.shares.push(newSharee)
	},

	/**
	 * Remove Sharee from calendar shares list
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.uri the sharee uri
	 */
	unshareCalendar(state, { calendar, uri }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		let shareIndex = calendar.shares.findIndex(sharee => sharee.uri === uri)
		calendar.shares.splice(shareIndex, 1)
	},

	/**
	 * Toggle sharee's writable permission
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.uri the sharee uri
	 */
	toggleCalendarShareWritable(state, { calendar, uri }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		let sharee = calendar.shares.find(sharee => sharee.uri === uri)
		sharee.writeable = !sharee.writeable
	},

	/**
	 * Publish a calendar calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to publish
	 * @param {String} data.publishURL published URL of calendar
	 */
	publishCalendar(state, { calendar, publishURL }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.publishURL = publishURL
	},

	/**
	 * Unpublish a calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to unpublish
	 */
	unpublishCalendar(state, { calendar }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		calendar.publishURL = null
	}
}

const getters = {
	sortedCalendars(state) {
		console.debug(state.calendars)
		return state.calendars
			.filter(calendar => calendar.components.includes('VEVENT'))
			.filter(calendar => !calendar.readOnly)
			.sort((a, b) => a.order - b.order)
	},
	sortedSubscriptions(state) {
		return state.calendars
			.filter(calendar => calendar.components.includes('VEVENT'))
			.filter(calendar => calendar.readOnly)
			.sort((a, b) => a.order - b.order)
	},
	enabledCalendars(state) {
		return state.calendars
			.filter(calendar => calendar.components.includes('VEVENT'))
			.filter(calendar => calendar.enabled)
	}
}

const actions = {

	/**
	 * Retrieve and commit calendars
	 *
	 * @param {Object} context the store mutations
	 * @returns {Promise<Array>} the calendars
	 */
	async getCalendars(context) {
		const calendars = await client.calendarHomes[0].findAllCalendars()
		calendars.map(mapDavCollectionToCalendar).forEach(calendar => {
			context.commit('addCalendar', { calendar })
		})

		return [1]
	},

	/**
	 * Append a new calendar to array of existing calendars
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the new calendar to append
	 * @returns {Promise}
	 */
	async appendCalendar(context, { calendar }) {
		const { displayName, color, order } = calendar
		return client.calendarHomes[0].createCalendarCollection(displayName, color, ['VEVENT'], order)
			.then((response) => {
				calendar = mapDavCollectionToCalendar(response)
				context.commit('addCalendar', { calendar })
			})
			.catch((error) => { throw error })
	},

	/**
	 * Append a new subscription to array of existing calendars
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the new subscription calendar to append
	 * @param {String} data.source source of new subscription
	 * @returns {Promise}
	 */
	async appendSubscription(context, { calendar, source }) {
		const { displayName, color, order } = calendar
		return client.calendarHomes[0].createSubscribedCollection(displayName, color, source, order)
			.then((response) => {
				calendar = mapDavCollectionToCalendar(response)
				context.commit('addCalendar', { calendar })
			})
			.catch((error) => { throw error })
	},

	/**
	 * Delete a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to delete
	 * @returns {Promise}
	 */
	async deleteCalendar(context, { calendar }) {
		return calendar.dav.delete()
			.then((response) => {
				context.commit('deleteCalendar', { calendar })
			})
			.catch((error) => { throw error })
	},

	/**
	 * Toggle whether a calendar is enabled
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @returns {Promise}
	 */
	async toggleCalendarEnabled(context, { calendar }) {
		calendar.dav.enabled = !calendar.dav.enabled
		return calendar.dav.update()
			.then((response) => context.commit('toggleCalendarEnabled', { calendar }))
			.catch((error) => { throw error })
	},

	/**
	 * Rename a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newName the new name of the calendar
	 * @returns {Promise}
	 */
	async renameCalendar(context, { calendar, newName }) {
		calendar.dav.displayname = newName
		return calendar.dav.update()
			.then((response) => context.commit('renameCalendar', { calendar, newName }))
			.catch((error) => { throw error })
	},

	/**
	 * Change a calendar's color
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newColor the new color of the calendar
	 * @returns {Promise}
	 */
	async changeCalendarColor(context, { calendar, newColor }) {
		calendar.dav.color = newColor
		return calendar.dav.update()
			.then((response) => context.commit('changeCalendarColor', { calendar, newColor }))
			.catch((error) => { throw error })
	},

	/**
	 * Change a calendar's order
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to modify
	 * @param {String} data.newOrder the new order of the calendar
	 * @returns {Promise}
	 */
	async changeCalendarOrder(context, { calendar, newOrder }) {
		calendar.dav.order = newOrder
		return calendar.dav.update()
			.then((response) => context.commit('changeCalendarOrder', { calendar, newOrder }))
			.catch((error) => { throw error })
	},

	/**
	 * Change order of multiple calendars
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Array} new order of calendars
	 */
	async changeMultipleCalendarOrders(context, { calendars }) {
		// TODO - implement me
		// TODO - extract new order from order of calendars in array
		// send proppatch to all calendars
		// limit number of requests similar to import
	},

	/**
	 * Share calendar with User or Group
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to share
	 * @param {string} data.user the userId
	 * @param {string} data.displayName the displayName
	 * @param {string} data.uri the sharing principalScheme uri
	 * @param {Boolean} data.isGroup is this a group ?
	 */
	async shareCalendar(context, { calendar, user, displayName, uri, isGroup }) {
		// Share calendar with entered group or user
		try {
			await calendar.dav.share(uri)
			context.commit('shareCalendar', { calendar, user, displayName, uri, isGroup })
		} catch (error) {
			throw error
		}
	},

	/**
	 * Toggle permissions of calendar Sharees writeable rights
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @param {string} data.uri the sharing principalScheme uri
	 */
	async toggleCalendarShareWritable(context, { calendar, uri }) {
		try {
			const sharee = calendar.shares.find(sharee => sharee.uri === uri)
			await calendar.dav.share(uri, !sharee.writeable)
			context.commit('toggleCalendarShareWritable', { calendar, uri })
		} catch (error) {
			throw error
		}
	},

	/**
	 * Remove sharee from calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @param {string} data.uri the sharing principalScheme uri
	 */
	async unshareCalendar(context, { calendar, uri }) {
		try {
			await calendar.dav.unshare(uri)
			context.commit('unshareCalendar', { calendar, uri })
		} catch (error) {
			throw error
		}
	},

	/**
	 * Publish a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @returns {Promise<void>}
	 */
	async publishCalendar(context, { calendar }) {
		return calendar.dav.publish()
			.then((response) => {
				const publishURL = calendar.dav.publishURL
				context.commit('publishCalendar', { calendar, publishURL })
			})
			.catch((error) => { throw error })
	},

	/**
	 * Unpublish a calendar
	 *
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to change
	 * @returns {Promise<void>}
	 */
	async unpublishCalendar(context, { calendar }) {
		return calendar.dav.unpublish()
			.then((response) => context.commit('unpublishCalendar', { calendar }))
			.catch((error) => { throw error })
	},

	/**
	 * Retrieve the events of the specified calendar
	 * and commit the results
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to get events from
	 * @param {Date} data.from the date to start querying events from
	 * @param {Date} data.to the last date to query events from
	 * @returns {Promise}
	 */
	async getEventsFromCalendar(context, { calendar, from, to }) {

		// TODO

		return calendar.dav.findByType('VEVENT')
			.then((response) => {
				// We don't want to lose the url information
				// so we need to parse one by one
				const events = response.map(item => {
					let event = new Event(item.data, calendar)
					Vue.set(event, 'dav', item)
					return event
				})
				context.commit('appendEventsToCalendar', { calendar, events })
				context.commit('appendEvents', events)
				return events
			})
			.catch((error) => {
				// unrecoverable error, if no events were loaded,
				// remove the calendar
				// TODO: create a failed calendar state and show that there was an issue?
				context.commit('deleteCalendar', calendar)
				console.error(error)
			})
	},

	/**
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {String} data.ics The ICS data to import
	 * @param {Object} data.calendar the calendar to import the ics data into
	 */
	async importEventsIntoCalendar(context, { ics, calendar }) {
		const events = parseIcs(ics, calendar)
		context.commit('changeStage', 'importing')

		// max simultaneous requests
		const limit = pLimit(3)
		const requests = []

		// create the array of requests to send
		events.map(async event => {
			// Get vcard string
			try {
				let vData = ICAL.stringify(event.vCard.jCal)
				// push event to server and use limit
				requests.push(limit(() => event.calendar.dav.createVCard(vData)
					.then((response) => {
						// setting the event dav property
						Vue.set(event, 'dav', response)

						// success, update store
						context.commit('addEvent', event)
						context.commit('addEventToCalendar', event)
						context.commit('incrementAccepted')
					})
					.catch((error) => {
						// error
						context.commit('incrementDenied')
						console.error(error)
					})
				))
			} catch (e) {
				context.commit('incrementDenied')
			}
		})

		Promise.all(requests).then(() => {
			context.commit('changeStage', 'default')
		})
	},
}

export default { state, mutations, getters, actions }
