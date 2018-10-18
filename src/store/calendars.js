import Vue from 'vue'
import ICAL from 'ical.js'
import parseIcs from '../services/parseIcs'
import client from '../services/cdav'
import Event from '../models/event'
import pLimit from 'p-limit'

const calendarModel = {
	id: '',
	displayName: '',
	enabled: true,
	owner: '',
	shares: [],
	events: {},
	url: '',
	readOnly: false,
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
		id: calendar.url.split('/').slice(-2, -1)[0],
		displayName: calendar.displayname,
		enabled: calendar.enabled !== false,
		owner: calendar.owner,
		readOnly: calendar.readOnly !== false,
		url: calendar.url,
		dav: calendar
	}
}

const mutations = {

	/**
	 * Add calendar into state
	 *
	 * @param {Object} state the store data
	 * @param {Object} calendar the calendar to add
	 */
	addCalendar(state, calendar) {
		// extend the calendar to the default model
		state.calendars.push(Object.assign({}, calendarModel, calendar))
	},

	/**
	 * Delete calendar
	 *
	 * @param {Object} state the store data
	 * @param {Object} calendar the calendar to delete
	 */
	deleteCalendar(state, calendar) {
		state.calendars.splice(state.calendars.indexOf(calendar), 1)
	},

	/**
	 * Toggle whether a calendar is Enabled
	 * @param {Object} context the store mutations
	 * @param {Object} calendar the calendar to toggle
	 */
	toggleCalendarEnabled(context, calendar) {
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
	 * Append a list of events to an calendar
	 * and remove duplicates
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar to add the event to
	 * @param {Event[]} data.events array of events to append
	 */
	appendEventsToCalendar(state, { calendar, events }) {
		calendar = state.calendars.find(search => search === calendar)

		// convert list into an array and remove duplicate
		calendar.events = events.reduce((list, event) => {
			if (list[event.uid]) {
				console.debug('Duplicate event overrided', list[event.uid], event)
			}
			Vue.set(list, event.uid, event)
			return list
		}, calendar.events)
	},

	/**
	 * Add an event to an calendar and overwrite if duplicate uid
	 *
	 * @param {Object} state the store data
	 * @param {Event} event the event to add
	 */
	addEventToCalendar(state, event) {
		let calendar = state.calendars.find(search => search.id === event.calendar.id)
		Vue.set(calendar.events, event.uid, event)
	},

	/**
	 * Delete an event in a specified calendar
	 *
	 * @param {Object} state the store data
	 * @param {Event} event the event to delete
	 */
	deleteEventFromCalendar(state, event) {
		let calendar = state.calendars.find(search => search.id === event.calendar.id)
		Vue.delete(calendar, event.uid)
	},

	/**
	 * Share calendar with a user or group
	 *
	 * @param {Object} state the store data
	 * @param {Object} data destructuring object
	 * @param {Object} data.calendar the calendar
	 * @param {string} data.sharee the sharee
	 * @param {string} data.id id
	 * @param {Boolean} data.group group
	 */
	shareCalendar(state, { calendar, sharee, id, group }) {
		calendar = state.calendars.find(search => search.id === calendar.id)
		let newSharee = {
			displayname: sharee,
			id,
			writeable: false,
			group
		}
		calendar.shares.push(newSharee)
	},

	/**
	 * Remove Sharee from calendar shares list
	 *
	 * @param {Object} state the store data
	 * @param {Object} sharee the sharee
	 */
	removeSharee(state, sharee) {
		let calendar = state.calendars.find(search => {
			for (let i in search.shares) {
				if (search.shares[i] === sharee) {
					return true
				}
			}
		})
		calendar.shares.splice(calendar.shares.indexOf(sharee), 1)
	},

	/**
	 * Toggle sharee's writable permission
	 *
	 * @param {Object} state the store data
	 * @param {Object} sharee the sharee
	 */
	updateShareeWritable(state, sharee) {
		let calendar = state.calendars.find(search => {
			for (let i in search.shares) {
				if (search.shares[i] === sharee) {
					return true
				}
			}
		})
		sharee = calendar.shares.find(search => search === sharee)
		sharee.writeable = !sharee.writeable
	}

}

const getters = {
	getCalendars: state => state.calendar
}

const actions = {

	/**
	 * Retrieve and commit calendars
	 *
	 * @param {Object} context the store mutations
	 * @returns {Promise<Array>} the calendars
	 */
	async getCalendars(context) {
		let calendars = await client.calendarHomes[0].findAllCalendars()
			.then(calendars => {
				return calendars.map(calendar => {
					return mapDavCollectionToCalendar(calendar)
				})
			})

		calendars.forEach(calendar => {
			context.commit('addCalendar', calendar)
		})

		return calendars
	},

	/**
	 * Append a new calendar to array of existing calendars
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} calendar The calendar to append
	 * @returns {Promise}
	 */
	async appendCalendar(context, calendar) {
		return client.calendarHomes[0].createCalendarCollection(calendar.displayName)
			.then((response) => {
				calendar = mapDavCollectionToCalendar(response)
				context.commit('addCalendar', calendar)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Delete calendar
	 * @param {Object} context the store mutations Current context
	 * @param {Object} calendar the calendar to delete
	 * @returns {Promise}
	 */
	async deleteCalendar(context, calendar) {
		return calendar.dav.delete()
			.then((response) => {
				// delete all the events from the store that belong to this calendar
				Object.values(calendar.events)
					.forEach(event => context.commit('deleteEvent', event))
				// then delete the calendar
				context.commit('deleteCalendar', calendar)
			})
			.catch((error) => { throw error })
	},

	/**
	 * Toggle whether a calendar is Enabled
	 * @param {Object} context the store mutations Current context
	 * @param {Object} calendar the calendar to toggle
	 * @returns {Promise}
	 */
	async toggleCalendarEnabled(context, calendar) {
		calendar.dav.enabled = !calendar.dav.enabled
		return calendar.dav.update()
			.then((response) => context.commit('toggleCalendarEnabled', calendar))
			.catch((error) => { throw error })
	},

	/**
	 * Rename a calendar
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data.calendar the calendar to rename
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
	 * Retrieve the events of the specified calendar
	 * and commit the results
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} importDetails = { ics, calendar }
	 * @returns {Promise}
	 */
	async getEventsFromCalendar(context, { calendar }) {
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
	 * @param {Object} importDetails = { ics, calendar }
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

	/**
	 * Remove sharee from calendar
	 * @param {Object} context the store mutations Current context
	 * @param {Object} sharee calendar sharee object
	 */
	removeSharee(context, sharee) {
		context.commit('removeSharee', sharee)
	},

	/**
	 * Toggle permissions of calendar Sharees writeable rights
	 * @param {Object} context the store mutations Current context
	 * @param {Object} sharee calendar sharee object
	 */
	toggleShareeWritable(context, sharee) {
		context.commit('updateShareeWritable', sharee)
	},

	/**
	 * Share calendar with User or Group
	 * @param {Object} context the store mutations Current context
	 * @param {Object} data.calendar the calendar
	 * @param {String} data.sharee the sharee
	 * @param {Boolean} data.id id
	 * @param {Boolean} data.group group
	 */
	shareCalendar(context, { calendar, sharee, id, group }) {
		// Share calendar with entered group or user
		context.commit('shareCalendar', { calendar, sharee, id, group })
	},

	/**
	 * Move an event to the provided calendar
	 *
	 * @param {Object} context the store mutations
	 * @param {Object} data destructuring object
	 * @param {Event} data.event the event to move
	 * @param {Object} data.calendar the calendar to move the event to
	 */
	async moveEventToCalendar(context, { event, calendar }) {
		// only local move if the event doesn't exists on the server
		if (event.dav) {
			// TODO: implement proper move
			// await events.dav.move(calendar.dav)
			// 	.catch((error) => {
			// 		console.error(error)
			// 		OC.Notification.showTemporary(t('calendars', 'An error occurred'))
			// 	})
			let vData = ICAL.stringify(event.vCard.jCal)
			let newDav
			await calendar.dav.createVCard(vData)
				.then((response) => { newDav = response })
				.catch((error) => { throw error })
			await event.dav.delete()
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendars', 'An error occurred'))
				})
			await Vue.set(event, 'dav', newDav)
		}
		await context.commit('deleteEventFromCalendar', event)
		await context.commit('updateEventCalendar', { event, calendar })
		await context.commit('addEventToCalendar', event)
	}
}

export default { state, mutations, getters, actions }
