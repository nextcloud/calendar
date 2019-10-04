/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
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
import getTimezoneManager from '../services/timezoneDataProviderService'
import {
	getDateFromDateTimeValue
} from '../services/dateService.js'
import DurationValue from 'calendar-js/src/values/durationValue.js'
import AttendeeProperty from 'calendar-js/src/properties/attendeeProperty.js'

const state = {}

const mutations = {

	/**
	 * Change the title of the event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.title The new Title
	 */
	changeTitle(state, { calendarObjectInstance, title }) {
		calendarObjectInstance.eventComponent.title = title
		calendarObjectInstance.title = title
	},

	/**
	 * Change the event's start
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Date} data.startDate New start date to set
	 */
	changeStartDate(state, { calendarObjectInstance, startDate }) {
		calendarObjectInstance.eventComponent.startDate.year = startDate.getFullYear()
		calendarObjectInstance.eventComponent.startDate.month = startDate.getMonth() + 1
		calendarObjectInstance.eventComponent.startDate.day = startDate.getDate()
		calendarObjectInstance.eventComponent.startDate.hour = startDate.getHours()
		calendarObjectInstance.eventComponent.startDate.minute = startDate.getMinutes()
		calendarObjectInstance.eventComponent.startDate.second = 0

		const isAllDay = calendarObjectInstance.eventComponent.isAllDay()
		const endDateObj = calendarObjectInstance.eventComponent.endDate.clone()
		const startDateObj = calendarObjectInstance.eventComponent.startDate.clone()

		if (isAllDay) {
			endDateObj.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))

			if (endDateObj.compare(startDateObj) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(endDateObj.timezoneId)
				calendarObjectInstance.eventComponent.endDate
					= calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
				calendarObjectInstance.endDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.endDate)
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			}
		} else {
			if (endDateObj.compare(startDateObj) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(endDateObj.timezoneId)
				calendarObjectInstance.eventComponent.endDate
					= calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
				calendarObjectInstance.endDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.endDate)
			}
		}

		calendarObjectInstance.startDate = startDate
	},

	/**
	 * Change the timezone of the event's start
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.startTimezone New timezone to set for start
	 */
	changeStartTimezone(state, { calendarObjectInstance, startTimezone }) {
		const timezone = getTimezoneManager().getTimezoneForId(startTimezone)
		calendarObjectInstance.eventComponent.startDate.replaceTimezone(timezone)
		calendarObjectInstance.startTimezoneId = startTimezone

		// Either both are floating or both have a timezone, but it can't be mixed
		if (startTimezone === 'floating' || calendarObjectInstance.endTimezoneId === 'floating') {
			calendarObjectInstance.eventComponent.endDate.replaceTimezone(timezone)
			calendarObjectInstance.endTimezoneId = startTimezone
		}
	},

	/**
	 * Change the event's end
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Date} data.endDate New end date to set
	 */
	changeEndDate(state, { calendarObjectInstance, endDate }) {
		calendarObjectInstance.eventComponent.endDate.year = endDate.getFullYear()
		calendarObjectInstance.eventComponent.endDate.month = endDate.getMonth() + 1
		calendarObjectInstance.eventComponent.endDate.day = endDate.getDate()
		calendarObjectInstance.eventComponent.endDate.hour = endDate.getHours()
		calendarObjectInstance.eventComponent.endDate.minute = endDate.getMinutes()
		calendarObjectInstance.eventComponent.endDate.second = 0

		const isAllDay = calendarObjectInstance.eventComponent.isAllDay()
		const endDateObj = calendarObjectInstance.eventComponent.endDate.clone()
		const startDateObj = calendarObjectInstance.eventComponent.startDate.clone()

		if (isAllDay) {
			if (endDateObj.compare(startDateObj) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
				calendarObjectInstance.eventComponent.endDate
					= calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
				calendarObjectInstance.endDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.startDate)
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			}
		} else {
			if (endDateObj.compare(startDateObj) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
				calendarObjectInstance.eventComponent.startDateObj
					= calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
				calendarObjectInstance.startDateObj = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.startDate)
			}
		}
	},

	/**
	 * Change the timezone of the event's end
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.endTimezone New timezone to set for end
	 */
	changeEndTimezone(state, { calendarObjectInstance, endTimezone }) {
		const timezone = getTimezoneManager().getTimezoneForId(endTimezone)
		calendarObjectInstance.eventComponent.startDate.replaceTimezone(timezone)
		calendarObjectInstance.endTimezoneId = endTimezone

		// Either both are floating or both have a timezone, but it can't be mixed
		if (endTimezone === 'floating' || calendarObjectInstance.startTimezoneId === 'floating') {
			calendarObjectInstance.eventComponent.startDate.replaceTimezone(timezone)
			calendarObjectInstance.startTimezoneId = endTimezone
		}
	},

	/**
	 * Switch from a timed event to allday or vice versa
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 */
	toggleAllDay(state, { calendarObjectInstance }) {
		if (!calendarObjectInstance.eventComponent.canModifyAllDay()) {
			return
		}

		// TODO - also make sure dtend is the exclusive end

		const isAllDay = calendarObjectInstance.eventComponent.isAllDay()
		calendarObjectInstance.eventComponent.startDate.isDate = !isAllDay
		calendarObjectInstance.eventComponent.endDate.isDate = !isAllDay
		calendarObjectInstance.isAllDay = calendarObjectInstance.eventComponent.isAllDay()
	},

	/**
	 * Change the location of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.location New location to set
	 */
	changeLocation(state, { calendarObjectInstance, location }) {
		calendarObjectInstance.eventComponent.location = location
		calendarObjectInstance.location = location
	},

	/**
	 * Change the description of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.description New description to set
	 */
	changeDescription(state, { calendarObjectInstance, description }) {
		calendarObjectInstance.eventComponent.description = description
		calendarObjectInstance.description = description
	},

	/**
	 * Change the access class of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.accessClass New access class to set
	 */
	changeAccessClass(state, { calendarObjectInstance, accessClass }) {
		calendarObjectInstance.eventComponent.accessClass = accessClass
		calendarObjectInstance.accessClass = accessClass
	},

	/**
	 * Change the status of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.status New status to set
	 */
	changeStatus(state, { calendarObjectInstance, status }) {
		calendarObjectInstance.eventComponent.status = status
		calendarObjectInstance.status = status
	},

	/**
	 * Change the time-transparency of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.timeTransparency New time-transparency to set
	 */
	changeTimeTransparency(state, { calendarObjectInstance, timeTransparency }) {
		calendarObjectInstance.eventComponent.timeTransparency = timeTransparency
		calendarObjectInstance.timeTransparency = timeTransparency
	},

	/**
	 * Change the customized color of an event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.customColor New color to set
	 */
	changeCustomColor(state, { calendarObjectInstance, customColor }) {
		calendarObjectInstance.eventComponent.customColor = customColor
		calendarObjectInstance.customColor = customColor
	},

	/**
	 * Adds an attendee to the event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.commonName Displayname of attendee
	 * @param {String} data.uri Email address of attendee
	 * @param {String} data.calendarUserType Calendar-user-type of attendee (INDIVIDUAL, GROUP, RESOURCE, ROOM)
	 * @param {String} data.participationStatus Participation Status of attendee
	 * @param {String} data.role Role of Attendee
	 * @param {Boolean} data.rsvp Whether or not to request a response from the attendee
	 * @param {String=} data.language Preferred language of the attendee
	 * @param {String=} data.timezoneId Preferred timezone of the attendee
	 */
	addAttendee(state, { calendarObjectInstance, commonName, uri, calendarUserType = null, participationStatus = null, role = null, rsvp = null, language = null, timezoneId = null }) {
		const attendee = AttendeeProperty.fromNameAndEMail(commonName, uri)

		if (calendarUserType !== null) {
			attendee.userType = calendarUserType
		}
		if (participationStatus !== null) {
			attendee.participationStatus = participationStatus
		}
		if (role !== null) {
			attendee.role = role
		}
		if (rsvp !== null) {
			attendee.rsvp = rsvp
		}
		if (language !== null) {
			attendee.language = language
		}
		if (timezoneId !== null) {
			attendee.updateParameterIfExist('TZID', timezoneId)
		}

		// TODO - use real addAttendeeFrom method
		calendarObjectInstance.eventComponent.addProperty(attendee)
		calendarObjectInstance.attendees.push({
			commonName,
			participationStatus,
			role,
			rsvp,
			uri,
			attendeeProperty: attendee
		})
	},

	/**
	 * Removes an attendee from the event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.attendee The attendee object to remove
	 */
	removeAttendee(state, { calendarObjectInstance, attendee }) {
		calendarObjectInstance.eventComponent.removeAttendee(attendee.attendeeProperty)

		const index = calendarObjectInstance.attendees.indexOf(attendee)
		if (index !== -1) {
			calendarObjectInstance.attendees.splice(index, 1)
		}
	},

	/**
	 * Changes an attendees' participation status
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.attendee The attendee object
	 * @param {String} data.participationStatus New Participation Status of attendee
	 */
	changeAttendeesParticipationStatus(state, { attendee, participationStatus }) {
		attendee.attendeeProperty.participationStatus = participationStatus
		attendee.participationStatus = participationStatus
	},

	/**
	 * Changes an attendees' role
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.attendee The attendee object
	 * @param {String} data.role New role of attendee
	 */
	changeAttendeesRole(state, { attendee, role }) {
		attendee.attendeeProperty.role = role
		attendee.role = role
	},

	/**
	 * Changes an attendees' RVSP
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.attendee The attendee object
	 * @param {Boolean} data.rsvp New RSVP value
	 */
	changeAttendeesRSVP(state, { attendee, rsvp }) {
		attendee.attendeeProperty.rsvp = rsvp
		attendee.rsvp = rsvp
	},

	/**
	 * Set the event's organizer
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String=} data.name Displayname of organizer
	 * @param {String} data.email Email-address of organizer
	 */
	setOrganizer(state, { calendarObjectInstance, name = null, email }) {
		calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail(name, email)
		Vue.set(calendarObjectInstance, 'organizer', {})
		Vue.set(calendarObjectInstance.organizer, 'name', name)
		Vue.set(calendarObjectInstance.organizer, 'uri', email)
	},

	/**
	 * Adds a category to the event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.category Category to add
	 */
	addCategory(state, { calendarObjectInstance, category }) {
		calendarObjectInstance.eventComponent.addCategory(category)
		calendarObjectInstance.categories.push(category)
	},

	/**
	 * Removes a category from the event
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data.category Category to remove
	 */
	removeCategory(state, { calendarObjectInstance, category }) {
		calendarObjectInstance.eventComponent.removeCategory(category)

		const index = calendarObjectInstance.categories.indexOf(category)
		if (index !== -1) {
			calendarObjectInstance.categories.splice(index, 1)
		}
	}
}

const getters = {}

const actions = {

	/**
	 * Change the timezone of the event's start
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data2.startTimezone New timezone to set for start
	 */
	changeStartTimezone({ commit }, { calendarObjectInstance, startTimezone }) {
		commit('changeStartTimezone', { calendarObjectInstance, startTimezone })

		// Simulate a change of the start time to trigger the comparison
		// of start and end and trigger an update of end if necessary
		commit('changeStartDate', {
			calendarObjectInstance,
			startDate: calendarObjectInstance.startDate
		})
	},

	/**
	 * Change the timezone of the event's end
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {String} data2.endTimezone New timezone to set for end
	 */
	endDateTimezone({ commit }, { calendarObjectInstance, endTimezone }) {
		commit('changeEndTimezone', { calendarObjectInstance, endTimezone })

		// Simulate a change of the end time to trigger the comparison
		// of start and end and trigger an update of start if necessary
		commit('changeEndDate', {
			calendarObjectInstance,
			endDate: calendarObjectInstance.endDate
		})
	}
}

export default { state, mutations, getters, actions }
