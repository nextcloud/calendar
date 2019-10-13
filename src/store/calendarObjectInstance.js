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
} from '../utils/date.js'
import DurationValue from 'calendar-js/src/values/durationValue.js'
import AttendeeProperty from 'calendar-js/src/properties/attendeeProperty.js'
import DateTimeValue from 'calendar-js/src/values/dateTimeValue.js'
import RecurValue from 'calendar-js/src/values/recurValue.js'
import Property from 'calendar-js/src/properties/property.js'
import { getBySetPositionAndBySetFromDate, getWeekDayFromDate } from '../utils/recurrence.js'
import { getDefaultCalendarObjectInstanceObject } from '../models/calendarObjectInstance.js'

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
		// If the event is using DURATION, endDate is dynamically generated.
		// In order to alter it, we need to explicitly set DTEND
		const endDateObject = calendarObjectInstance.eventComponent.endDate
		calendarObjectInstance.eventComponent.endDate = endDateObject

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
				calendarObjectInstance.eventComponent.startDate
					= calendarObjectInstance.eventComponent.endDate.getInTimezone(timezone)
				calendarObjectInstance.startDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.startDate)
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			}
		} else {
			if (endDateObj.compare(startDateObj) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
				calendarObjectInstance.eventComponent.startDate
					= calendarObjectInstance.eventComponent.endDate.getInTimezone(timezone)
				calendarObjectInstance.startDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.startDate)
			}
		}

		calendarObjectInstance.endDate = endDate
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
	toggleAttendeeRSVP(state, { attendee }) {
		const oldRSVP = attendee.attendeeProperty.rsvp
		attendee.attendeeProperty.rsvp = !oldRSVP
		attendee.rsvp = !oldRSVP
	},

	/**
	 * Set the event's organizer
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {String=} data.commonName Displayname of organizer
	 * @param {String} data.email Email-address of organizer
	 */
	setOrganizer(state, { calendarObjectInstance, commonName = null, email }) {
		calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail(commonName, email)
		Vue.set(calendarObjectInstance, 'organizer', {})
		Vue.set(calendarObjectInstance.organizer, 'commonName', commonName)
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
	},

	/**
	 * Change the interval of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.interval The new interval to set
	 */
	changeRecurrenceInterval(state, { calendarObjectInstance, recurrenceRule, interval }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.interval = interval
			recurrenceRule.interval = interval

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the frequency of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.frequency The new frequency to set
	 */
	changeRecurrenceFrequency(state, { calendarObjectInstance, recurrenceRule, frequency }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.frequency = frequency
			recurrenceRule.frequency = frequency

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the count limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.count The new count to set
	 */
	changeRecurrenceCount(state, { calendarObjectInstance, recurrenceRule, count }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.count = count
			recurrenceRule.count = count
			recurrenceRule.until = null

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {Date} data.until The new until to set
	 */
	changeRecurrenceUntil(state, { calendarObjectInstance, recurrenceRule, until }) {
		if (recurrenceRule.recurrenceRuleValue) {

			recurrenceRule.recurrenceRuleValue.until = DateTimeValue.fromJSDate(until)
			recurrenceRule.until = until
			recurrenceRule.count = null

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Changes the recurrence-rule to never end
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	changeRecurrenceToInfinite(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.setToInfinite()
			recurrenceRule.until = null
			recurrenceRule.count = null

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Reset the By-parts of the recurrence rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	resetRecurrenceByParts(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const parts = [
				'BYSECOND',
				'BYMINUTE',
				'BYHOUR',
				'BYDAY',
				'BYMONTHDAY',
				'BYYEARDAY',
				'BYWEEKNO',
				'BYMONTH',
				'BYSETPOS'
			]

			for (const part of parts) {
				recurrenceRule.recurrenceRuleValue.setComponent(part, [])
			}

			Vue.set(recurrenceRule, 'byDay', [])
			Vue.set(recurrenceRule, 'byMonth', [])
			Vue.set(recurrenceRule, 'byMonthDay', [])
			Vue.set(recurrenceRule, 'bySetPosition', null)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Reset the By-parts of the recurrence rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	setDefaultRecurrenceByPartsForWeekly(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byDay = getWeekDayFromDate(calendarObjectInstance.startDate)
			recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
			recurrenceRule.byDay.push(byDay)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Reset the By-parts of the recurrence rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	setDefaultRecurrenceByPartsForMonthly(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byMonthDay = calendarObjectInstance.startDate.getDate().toString()
			recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
			recurrenceRule.byMonthDay.push(byMonthDay)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	setDefaultRecurrenceByPartsForMonthlyBySetPosition(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const {
				byDay,
				bySetPosition
			} = getBySetPositionAndBySetFromDate(calendarObjectInstance.startDate)
			recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
			recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])

			recurrenceRule.byDay.push(byDay)
			recurrenceRule.bySetPosition = bySetPosition

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Reset the By-parts of the recurrence rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	setDefaultRecurrenceByPartsForYearly(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byMonth = calendarObjectInstance.startDate.getMonth() + 1 // Javascript months are zero-based
			recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
			recurrenceRule.byMonth.push(byMonth)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byDay The new until to set
	 */
	addByDayToRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byDay }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byDayList = recurrenceRule.recurrenceRuleValue.getComponent('BYDAY')
			const index = byDayList.indexOf(byDay)
			if (index === -1) {
				byDayList.push(byDay)
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', byDayList)
			}

			const index2 = recurrenceRule.byDay.indexOf(byDay)
			if (index2 === -1) {
				recurrenceRule.byDay.push(byDay)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byDay The new until to set
	 */
	removeByDayFromRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byDay }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byDayList = recurrenceRule.recurrenceRuleValue.getComponent('BYDAY')
			const index = byDayList.indexOf(byDay)
			if (index !== -1) {
				byDayList.splice(index, 1)
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', byDayList)
			}

			const index2 = recurrenceRule.byDay.indexOf(byDay)
			if (index2 !== -1) {
				recurrenceRule.byDay.splice(index2, 1)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byMonthDay The new until to set
	 */
	addByMonthDayToRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byMonthDay }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byMonthDayList = recurrenceRule.recurrenceRuleValue.getComponent('BYMONTHDAY')
			const index = byMonthDayList.indexOf(byMonthDay)
			if (index === -1) {
				byMonthDayList.push(byMonthDay)
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', byMonthDayList)
			}

			const index2 = recurrenceRule.byMonthDay.indexOf(byMonthDay)
			if (index2 === -1) {
				recurrenceRule.byMonthDay.push(byMonthDay)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byMonthDay The new until to set
	 */
	removeByMonthDayFromRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byMonthDay }) {
		if (recurrenceRule.recurrenceRuleValue) {
			const byMonthDayList = recurrenceRule.recurrenceRuleValue.getComponent('BYMONTHDAY')
			const index = byMonthDayList.indexOf(byMonthDay)
			if (index !== -1) {
				byMonthDayList.splice(index, 1)
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', byMonthDayList)
			}

			const index2 = recurrenceRule.byMonthDay.indexOf(byMonthDay)
			if (index2 !== -1) {
				recurrenceRule.byMonthDay.splice(index2, 1)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byMonth The new until to set
	 */
	addByMonthToRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byMonth }) {
		if (recurrenceRule.recurrenceRuleValue) {
			console.debug('addByMonthToRecurrenceRule', byMonth)

			const byMonthList = recurrenceRule.recurrenceRuleValue.getComponent('BYMONTH')
			const index = byMonthList.indexOf(byMonth)
			if (index === -1) {
				byMonthList.push(byMonth)
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', byMonthList)
			}

			const index2 = recurrenceRule.byMonth.indexOf(byMonth)
			if (index2 === -1) {
				recurrenceRule.byMonth.push(byMonth)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.byMonth The new until to set
	 */
	removeByMonthFromRecurrenceRule(state, { calendarObjectInstance, recurrenceRule, byMonth }) {
		if (recurrenceRule.recurrenceRuleValue) {
			console.debug('removeByMonthFromRecurrenceRule', byMonth)

			const byMonthList = recurrenceRule.recurrenceRuleValue.getComponent('BYMONTH')
			const index = byMonthList.indexOf(byMonth)
			if (index !== -1) {
				byMonthList.splice(index, 1)
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', byMonthList)
			}

			const index2 = recurrenceRule.byMonth.indexOf(byMonth)
			if (index2 !== -1) {
				recurrenceRule.byMonth.splice(index2, 1)
			}

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String[]} data.byDay The new until to set
	 */
	changeRecurrenceByDay(state, { calendarObjectInstance, recurrenceRule, byDay }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', byDay)
			Vue.set(recurrenceRule, 'byDay', byDay)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Change the until limit of the recurrence-rule
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data.bySetPosition The new until to set
	 */
	changeRecurrenceBySetPosition(state, { calendarObjectInstance, recurrenceRule, bySetPosition }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])
			Vue.set(recurrenceRule, 'bySetPosition', bySetPosition)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	unsetRecurrenceBySetPosition(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [])
			Vue.set(recurrenceRule, 'bySetPosition', null)

			console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
		}
	},

	/**
	 * Remove the recurrence-rule from the calendarObjectInstance
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	removeRecurrenceRuleFromCalendarObjectInstance(state, { calendarObjectInstance, recurrenceRule }) {
		if (recurrenceRule.recurrenceRuleValue) {
			calendarObjectInstance.eventComponent.deleteAllProperties('RRULE')
			Vue.set(calendarObjectInstance, 'recurrenceRule', getDefaultCalendarObjectInstanceObject().recurrenceRule)

			console.debug(calendarObjectInstance)
			console.debug(recurrenceRule)
		}
	},

	/**
	 * Add a new recurrence-rule to the calendarObjectInstance
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 */
	addRecurrenceRuleFromCalendarObjectInstance(state, { calendarObjectInstance }) {
		const recurrenceValue = RecurValue.fromData({})
		const recurrenceProperty = new Property('RRULE', recurrenceValue)
		calendarObjectInstance.eventComponent.addProperty(recurrenceProperty)
		calendarObjectInstance.recurrenceRule.recurrenceRuleValue = recurrenceValue
	},

	/**
	 *
	 * @param {Object} state The Vuex state
	 * @param {Object} data The destructuring object
	 * @param {Object} data.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data.recurrenceRule The recurrenceRule object to modify
	 */
	markRecurrenceRuleAsSupported(state, { calendarObjectInstance, recurrenceRule }) {
		recurrenceRule.isUnsupported = false
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
	changeEndTimezone({ commit }, { calendarObjectInstance, endTimezone }) {
		commit('changeEndTimezone', { calendarObjectInstance, endTimezone })

		// Simulate a change of the end time to trigger the comparison
		// of start and end and trigger an update of start if necessary
		commit('changeEndDate', {
			calendarObjectInstance,
			endDate: calendarObjectInstance.endDate
		})
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Function} data.dispatch The Vuex dispatch function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data2.frequency The new frequency to set
	 */
	changeRecurrenceFrequency({ commit, dispatch }, { calendarObjectInstance, recurrenceRule, frequency }) {

		console.debug(calendarObjectInstance)
		console.debug(recurrenceRule)
		console.debug(frequency)

		if (recurrenceRule.frequency === 'NONE' && frequency !== 'NONE') {
			// Add a new recurrence-rule
			commit('addRecurrenceRuleFromCalendarObjectInstance', { calendarObjectInstance })
			commit('resetRecurrenceByParts', { calendarObjectInstance, recurrenceRule })
			commit('changeRecurrenceFrequency', {
				calendarObjectInstance,
				recurrenceRule: calendarObjectInstance.recurrenceRule,
				frequency
			})
			commit('changeRecurrenceInterval', {
				calendarObjectInstance,
				recurrenceRule: calendarObjectInstance.recurrenceRule,
				interval: 1
			})
			commit('changeRecurrenceToInfinite', {
				calendarObjectInstance,
				recurrenceRule: calendarObjectInstance.recurrenceRule,
			})
			dispatch('setDefaultRecurrenceByParts', { calendarObjectInstance, recurrenceRule, frequency })

			console.debug(`changed from none to ${frequency}`)
		} else if (recurrenceRule.frequency !== 'NONE' && frequency === 'NONE') {
			console.debug('calling removeRecurrenceRuleFromCalendarObjectInstance')
			// Remove the recurrence-rule
			commit('removeRecurrenceRuleFromCalendarObjectInstance', { calendarObjectInstance, recurrenceRule })
		} else {
			// Change frequency of existing recurrence-rule
			commit('resetRecurrenceByParts', { calendarObjectInstance, recurrenceRule })
			commit('changeRecurrenceFrequency', {
				calendarObjectInstance,
				recurrenceRule: calendarObjectInstance.recurrenceRule,
				frequency
			})
			dispatch('setDefaultRecurrenceByParts', { calendarObjectInstance, recurrenceRule, frequency })
		}
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 * @param {String} data2.frequency The new frequency to set
	 */
	setDefaultRecurrenceByParts({ commit }, { calendarObjectInstance, recurrenceRule, frequency }) {
		switch (frequency) {
		case 'WEEKLY':
			commit('setDefaultRecurrenceByPartsForWeekly', { calendarObjectInstance, recurrenceRule })
			break

		case 'MONTHLY':
			commit('setDefaultRecurrenceByPartsForMonthly', { calendarObjectInstance, recurrenceRule })
			break

		case 'YEARLY':
			commit('setDefaultRecurrenceByPartsForYearly', { calendarObjectInstance, recurrenceRule })
			break
		}
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	setRecurrenceToInfinite({ commit }, { calendarObjectInstance, recurrenceRule }) {
		commit('changeRecurrenceToInfinite', {
			calendarObjectInstance,
			recurrenceRule
		})
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	changeMonthlyRecurrenceFromByDayToBySetPosition({ commit }, { calendarObjectInstance, recurrenceRule }) {
		console.debug('changeMonthlyRecurrenceFromByDayToBySetPosition')
		commit('resetRecurrenceByParts', { calendarObjectInstance, recurrenceRule })
		commit('setDefaultRecurrenceByPartsForMonthlyBySetPosition', { calendarObjectInstance, recurrenceRule })
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	changeMonthlyRecurrenceFromBySetPositionToByDay({ commit }, { calendarObjectInstance, recurrenceRule }) {
		console.debug('changeMonthlyRecurrenceFromBySetPositionToByDay')
		commit('resetRecurrenceByParts', { calendarObjectInstance, recurrenceRule })
		commit('setDefaultRecurrenceByPartsForMonthly', { calendarObjectInstance, recurrenceRule })
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	enableYearlyRecurrenceBySetPosition({ commit }, { calendarObjectInstance, recurrenceRule }) {
		commit('setDefaultRecurrenceByPartsForMonthlyBySetPosition', {
			calendarObjectInstance,
			recurrenceRule
		})
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	disableYearlyRecurrenceBySetPosition({ commit }, { calendarObjectInstance, recurrenceRule }) {
		commit('changeRecurrenceByDay', {
			calendarObjectInstance,
			recurrenceRule,
			byDay: []
		})
		commit('unsetRecurrenceBySetPosition', {
			calendarObjectInstance,
			recurrenceRule
		})
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	enableRecurrenceLimitByUntil({ commit }, { calendarObjectInstance, recurrenceRule }) {
		let until
		switch (recurrenceRule.frequency) {
		// Defaults to 7 days
		case 'DAILY':
			until = new Date(calendarObjectInstance.startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
			break

		// Defaults to 4 weeks
		case 'WEEKLY':
			until = new Date(calendarObjectInstance.startDate.getTime() + 4 * 7 * 24 * 60 * 60 * 1000)
			break

		// Defaults to 10 year
		case 'YEARLY':
			until = new Date(
				calendarObjectInstance.startDate.getFullYear() + 10,
				calendarObjectInstance.startDate.getMonth(),
				calendarObjectInstance.startDate.getDate(),
				23,
				59,
				59
			)
			break

		// Defaults to 12 months
		case 'MONTHLY':
		default:
			until = new Date(
				calendarObjectInstance.startDate.getFullYear() + 1,
				calendarObjectInstance.startDate.getMonth(),
				calendarObjectInstance.startDate.getDate(),
				23,
				59,
				59
			)
			break
		}

		commit('changeRecurrenceToInfinite', { calendarObjectInstance, recurrenceRule })
		commit('changeRecurrenceUntil', {
			calendarObjectInstance,
			recurrenceRule,
			until
		})
	},

	/**
	 *
	 * @param {Object} data The destructuring object for Vuex
	 * @param {Function} data.commit The Vuex commit function
	 * @param {Object} data2 The destructuring object for data
	 * @param {Object} data2.calendarObjectInstance The calendarObjectInstance object
	 * @param {Object} data2.recurrenceRule The recurrenceRule object to modify
	 */
	enableRecurrenceLimitByCount({ commit }, { calendarObjectInstance, recurrenceRule }) {
		commit('changeRecurrenceToInfinite', { calendarObjectInstance, recurrenceRule })
		commit('changeRecurrenceCount', {
			calendarObjectInstance,
			recurrenceRule,
			count: 2 // Default value is two
		})
	}

}

export default { state, mutations, getters, actions }
