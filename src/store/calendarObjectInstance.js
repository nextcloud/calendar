/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import {
	getDateFromDateTimeValue,
} from '../utils/date.js'
import { AttendeeProperty, Property, DateTimeValue, DurationValue, RecurValue, AttachmentProperty, Parameter } from '@nextcloud/calendar-js'
import { getBySetPositionAndBySetFromDate, getWeekDayFromDate } from '../utils/recurrence.js'
import {
	copyCalendarObjectInstanceIntoEventComponent,
	getDefaultEventObject,
	mapEventComponentToEventObject,
} from '../models/event.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getTotalSecondsFromAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents,
	updateAlarms,
} from '../utils/alarms.js'
import { mapAlarmComponentToAlarmObject } from '../models/alarm.js'
import { getObjectAtRecurrenceId } from '../utils/calendarObject.js'
import logger from '../utils/logger.js'
import { getRFCProperties } from '../models/rfcProps.js'
import { generateUrl } from '@nextcloud/router'
import { updateTalkParticipants } from '../services/talkService.js'
import useCalendarObjectsStore from './calendarObjects.js'
import useCalendarsStore from './calendars.js'
import useSettingsStore from './settings.js'
import { getClosestCSS3ColorNameForHex, getHexForColorName } from '../utils/color.js'

import { defineStore } from 'pinia'
import Vue from 'vue'

export default defineStore('calendarObjectInstance', {
	state: () => {
		return {
			isNew: null,
			calendarObject: null,
			calendarObjectInstance: null,
			existingEvent: {
				objectId: null,
				recurrenceId: null,
			},
		}
	},
	actions: {
		/**
		 * Set a calendar-object-instance that will be opened in the editor (existing event)
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObject The calendar-object currently being edited
		 * @param {object} data.calendarObjectInstance The calendar-object-instance currently being edited
		 * @param {string} data.objectId The objectId of the calendar-object
		 * @param {number} data.recurrenceId The recurrence-id of the calendar-object-instance
		 */
		setCalendarObjectInstanceForExistingEvent({
			calendarObject,
			calendarObjectInstance,
			objectId,
			recurrenceId,
		}) {
			this.isNew = false
			this.calendarObject = calendarObject
			this.calendarObjectInstance = calendarObjectInstance
			this.existingEvent.objectId = objectId
			this.existingEvent.recurrenceId = recurrenceId
		},

		/**
		 * Set a calendar-object-instance that will be opened in the editor (new event)
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObject The calendar-object currently being created
		 * @param {object} data.calendarObjectInstance The calendar-object-instance currently being crated
		 */
		setCalendarObjectInstanceForNewEvent({
			calendarObject,
			calendarObjectInstance,
		}) {
			this.isNew = true
			this.calendarObject = calendarObject
			this.calendarObjectInstance = calendarObjectInstance
			this.existingEvent.objectId = null
			this.existingEvent.recurrenceId = null
		},

		resetCalendarObjectInstanceObjectIdAndRecurrenceId() {
			this.isNew = false
			this.calendarObject = null
			this.calendarObjectInstance = null
			this.existingEvent.objectId = null
			this.existingEvent.recurrenceId = null
		},

		/**
		 * Change the title of the event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.title The new Title
		 */
		changeTitle({ calendarObjectInstance, title }) {
			calendarObjectInstance.eventComponent.title = title
			calendarObjectInstance.title = title
		},

		/**
		 * Change the event's start
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {Date} data.startDate New start date to set
		 */
		changeStartDateMutation({
			calendarObjectInstance,
			startDate,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.startTimezone New timezone to set for start
		 */
		changeStartTimezoneMutation({
			calendarObjectInstance,
			startTimezone,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {Date} data.endDate New end date to set
		 */
		changeEndDateMutation({
			calendarObjectInstance,
			endDate,
		}) {
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
				}

				// endDate is inclusive, but DTEND needs to be exclusive, so always add one day
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			} else {
				// Is end before start?
				if (endDateObj.compare(startDateObj) === -1) {
					// Is end more than one day before start?
					endDateObj.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
					if (endDateObj.compare(startDateObj) === -1) {
						const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
						calendarObjectInstance.eventComponent.startDate
							= calendarObjectInstance.eventComponent.endDate.getInTimezone(timezone)
						calendarObjectInstance.startDate = getDateFromDateTimeValue(calendarObjectInstance.eventComponent.startDate)
					} else {
						// add one day to endDate if the endDate is before the startDate which allows to easily create events that reach over or to 0:00
						calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
						endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
					}
				}
			}

			calendarObjectInstance.endDate = endDate
		},

		/**
		 * Change the timezone of the event's end
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.endTimezone New timezone to set for end
		 */
		changeEndTimezoneMutation({
			calendarObjectInstance,
			endTimezone,
		}) {
			const timezone = getTimezoneManager().getTimezoneForId(endTimezone)
			calendarObjectInstance.eventComponent.endDate.replaceTimezone(timezone)
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
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 */
		toggleAllDayMutation({ calendarObjectInstance }) {
			if (!calendarObjectInstance.eventComponent.canModifyAllDay()) {
				return
			}

			const isAllDay = calendarObjectInstance.eventComponent.isAllDay()
			calendarObjectInstance.eventComponent.startDate.isDate = !isAllDay
			calendarObjectInstance.eventComponent.endDate.isDate = !isAllDay
			calendarObjectInstance.isAllDay = calendarObjectInstance.eventComponent.isAllDay()

			// isAllDay = old value
			if (isAllDay) {
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))
			} else {
				calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			}
		},

		/**
		 * Changes the time of a timed event to the default values
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 */
		changeTimeToDefaultForTimedEvents({ calendarObjectInstance }) {
			const startDate = calendarObjectInstance.eventComponent.startDate
			const endDate = calendarObjectInstance.eventComponent.endDate
			if (startDate.hour === 0 && startDate.minute === 0 && endDate.hour === 0 && endDate.minute === 0) {
				startDate.hour = 10
				endDate.hour = 11

				calendarObjectInstance.startDate = getDateFromDateTimeValue(startDate)
				calendarObjectInstance.endDate = getDateFromDateTimeValue(endDate)
			}
		},

		/**
		 * Change the location of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.location New location to set
		 */
		changeLocation({
			calendarObjectInstance,
			location,
		}) {
			// Special case: delete Apple-specific location property to avoid inconsistencies
			calendarObjectInstance.eventComponent.deleteAllProperties('X-APPLE-STRUCTURED-LOCATION')

			calendarObjectInstance.eventComponent.location = location
			calendarObjectInstance.location = location
		},

		/**
		 * Change the description of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.description New description to set
		 */
		changeDescription({
			calendarObjectInstance,
			description,
		}) {
			// To avoid inconsistencies (bug #3863), remove all parameters (e.g., ALTREP) upon modification
			const descriptionProperty = calendarObjectInstance.eventComponent.getFirstProperty('Description')
			if (descriptionProperty) {
				for (const parameter of descriptionProperty.getParametersIterator()) {
					descriptionProperty.deleteParameter(parameter.name)
				}
			}

			// Delete custom description properties
			calendarObjectInstance.eventComponent.deleteAllProperties('X-ALT-DESC')

			calendarObjectInstance.eventComponent.description = description
			calendarObjectInstance.description = description
		},

		/**
		 * Change the access class of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.accessClass New access class to set
		 */
		changeAccessClass({ calendarObjectInstance, accessClass }) {
			calendarObjectInstance.eventComponent.accessClass = accessClass
			calendarObjectInstance.accessClass = accessClass
		},

		/**
		 * Change the status of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.status New status to set
		 */
		changeStatus({ calendarObjectInstance, status }) {
			calendarObjectInstance.eventComponent.status = status
			calendarObjectInstance.status = status
		},

		/**
		 * Change the time-transparency of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.timeTransparency New time-transparency to set
		 */
		changeTimeTransparency({ calendarObjectInstance, timeTransparency }) {
			calendarObjectInstance.eventComponent.timeTransparency = timeTransparency
			calendarObjectInstance.timeTransparency = timeTransparency
		},

		/**
		 * Change the customized color of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string | null} data.customColor New color to set
		 */
		changeCustomColor({ calendarObjectInstance, customColor }) {
			if (customColor === null) {
				calendarObjectInstance.eventComponent.deleteAllProperties('COLOR')
				// TODO: get rid of Vue.set in Vue 3
				Vue.set(calendarObjectInstance, 'customColor', null)
				return
			}

			const cssColorName = getClosestCSS3ColorNameForHex(customColor)
			const hexColorOfCssName = getHexForColorName(cssColorName)

			// Abort if either is undefined
			if (!cssColorName || !hexColorOfCssName) {
				console.error('Setting custom color failed')
				console.error('customColor: ', customColor)
				console.error('cssColorName: ', cssColorName)
				console.error('hexColorOfCssName: ', hexColorOfCssName)
				return
			}

			calendarObjectInstance.eventComponent.color = cssColorName
			// TODO: get rid of Vue.set in Vue 3
			Vue.set(calendarObjectInstance, 'customColor', hexColorOfCssName)
		},

		/**
		 * Adds an attendee to the event and sets the organizer if not present already
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.commonName Displayname of attendee
		 * @param {string} data.uri Email address of attendee
		 * @param {string} data.calendarUserType Calendar-user-type of attendee (INDIVIDUAL, GROUP, RESOURCE, ROOM)
		 * @param {string} data.participationStatus Participation Status of attendee
		 * @param {string} data.role Role of Attendee
		 * @param {boolean} data.rsvp Whether or not to request a response from the attendee
		 * @param {string=} data.language Preferred language of the attendee
		 * @param {string=} data.timezoneId Preferred timezone of the attendee
		 * @param {object=} data.organizer Principal of the organizer to be set if not present
		 * @param {string | Array} data.member Group membership(s)
		 */
		addAttendee({
			calendarObjectInstance,
			commonName,
			uri,
			calendarUserType = null,
			participationStatus = null,
			role = null,
			rsvp = null,
			language = null,
			timezoneId = null,
			organizer = null,
			member = null,
		}) {
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
			if (member !== null) {
				attendee.updateParameterIfExist('MEMBER', member)
			}

			// TODO - use real addAttendeeFrom method
			calendarObjectInstance.eventComponent.addProperty(attendee)
			calendarObjectInstance.attendees.push({
				commonName,
				participationStatus,
				role,
				rsvp,
				uri,
				attendeeProperty: attendee,
			})

			if (!calendarObjectInstance.organizer && organizer) {
				this.setOrganizer({
					calendarObjectInstance,
					commonName: organizer.displayname,
					email: organizer.emailAddress,
				})
			}
		},

		/**
		 * Removes an attendee from the event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.attendee The attendee object to remove
		 */
		removeAttendee({
			calendarObjectInstance,
			attendee,
		}) {
			calendarObjectInstance.eventComponent.removeAttendee(attendee.attendeeProperty)
			// Also remove members if attendee is a group
			if (attendee.attendeeProperty.userType === 'GROUP') {
				attendee.members.forEach(function(member) {
					if (Array.isArray(member.attendeeProperty.member) && member.attendeeProperty.member.length > 1) {
						const removeIndex = member.attendeeProperty.member.findIndex(function(groupname) {
							if (groupname === attendee.uri) {
								return true
							}
							return false
						})
						if (removeIndex !== -1) {
							member.attendeeProperty.member.splice(removeIndex, 1)
						}
					} else {
						calendarObjectInstance.eventComponent.removeAttendee(member.attendeeProperty)
						const index = calendarObjectInstance.attendees.indexOf(member)
						if (index !== -1) {
							calendarObjectInstance.attendees.splice(index, 1)
						}
					}
				})
			}

			const index = calendarObjectInstance.attendees.indexOf(attendee)
			if (index !== -1) {
				calendarObjectInstance.attendees.splice(index, 1)
			}

			if (calendarObjectInstance.attendees.length === 0) {
				calendarObjectInstance.organizer = null
				calendarObjectInstance.eventComponent.deleteAllProperties('ORGANIZER')
			}
		},

		/**
		 * Changes an attendees' participation status
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attendee The attendee object
		 * @param {string} data.participationStatus New Participation Status of attendee
		 */
		changeAttendeesParticipationStatus({
			attendee,
			participationStatus,
		}) {
			attendee.attendeeProperty.participationStatus = participationStatus
			attendee.participationStatus = participationStatus
		},

		/**
		 * Changes an attendees' role
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attendee The attendee object
		 * @param {string} data.role New role of attendee
		 */
		changeAttendeesRole({
			attendee,
			role,
		}) {
			attendee.attendeeProperty.role = role
			attendee.role = role
		},

		/**
		 * Changes an attendees' RVSP
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attendee The attendee object
		 */
		toggleAttendeeRSVP({ attendee }) {
			const oldRSVP = attendee.attendeeProperty.rsvp
			attendee.attendeeProperty.rsvp = !oldRSVP
			attendee.rsvp = !oldRSVP
		},

		/**
		 * Set the event's organizer
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string=} data.commonName Displayname of organizer
		 * @param {string} data.email Email-address of organizer
		 */
		setOrganizer({ calendarObjectInstance, commonName = null, email }) {
			calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail(commonName, email)
			Vue.set(calendarObjectInstance, 'organizer', {
				commonName,
				uri: email,
				attendeeProperty: calendarObjectInstance.eventComponent.getFirstProperty('ORGANIZER'),
			})
		},

		/**
		 * Adds a category to the event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.category Category to add
		 */
		addCategory({ calendarObjectInstance, category }) {
			calendarObjectInstance.eventComponent.addCategory(category)
			calendarObjectInstance.categories.push(category)
		},

		/**
		 * Removes a category from the event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.category Category to remove
		 */
		removeCategory({ calendarObjectInstance, category }) {
			calendarObjectInstance.eventComponent.removeCategory(category)

			const index = calendarObjectInstance.categories.indexOf(category)
			if (index !== -1) {
				calendarObjectInstance.categories.splice(index, 1)
			}
		},

		/**
		 * Change the interval of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.interval The new interval to set
		 */
		changeRecurrenceInterval({
			recurrenceRule,
			interval,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				recurrenceRule.recurrenceRuleValue.interval = interval
				recurrenceRule.interval = interval

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Change the frequency of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.frequency The new frequency to set
		 */
		changeRecurrenceFrequencyMutation({
			recurrenceRule,
			frequency,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				recurrenceRule.recurrenceRuleValue.frequency = frequency
				recurrenceRule.frequency = frequency

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Change the count limit of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.count The new count to set
		 */
		changeRecurrenceCount({
			recurrenceRule,
			count,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {Date} data.until The new until to set
		 */
		changeRecurrenceUntil({
			calendarObjectInstance,
			recurrenceRule,
			until,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				// RFC 5545, setion 3.3.10: until must be in UTC if the start time is timezone-aware
				if (calendarObjectInstance.startTimezoneId !== 'floating') {
					recurrenceRule.recurrenceRuleValue.until = DateTimeValue.fromJSDate(until, { zone: 'utc' })
				} else {
					recurrenceRule.recurrenceRuleValue.until = DateTimeValue.fromJSDate(until)
				}
				recurrenceRule.until = until
				recurrenceRule.count = null

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Changes the recurrence-rule to never end
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeRecurrenceToInfinite({ recurrenceRule }) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		resetRecurrenceByParts({ recurrenceRule }) {
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
					'BYSETPOS',
				]

				for (const part of parts) {
					recurrenceRule.recurrenceRuleValue.setComponent(part, [])
				}

				/* TODO
				recurrenceRule.byDay = []
				recurrenceRule.byMonth = []
				recurrenceRule.byMonthDay = []
				recurrenceRule.bySetPosition = null
				*/

				Vue.set(recurrenceRule, 'byDay', [])
				Vue.set(recurrenceRule, 'byMonth', [])
				Vue.set(recurrenceRule, 'byMonthDay', [])
				Vue.set(recurrenceRule, 'bySetPosition', null)

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		setDefaultRecurrenceByPartsForMonthlyBySetPosition({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				const {
					byDay,
					bySetPosition,
				} = getBySetPositionAndBySetFromDate(calendarObjectInstance.startDate)
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
				recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])

				recurrenceRule.byDay.push(byDay)
				recurrenceRule.bySetPosition = bySetPosition

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		setDefaultRecurrenceByPartsForYearlyBySetPosition({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				const byMonth = calendarObjectInstance.startDate.getMonth() + 1
				const { byDay, bySetPosition } = getBySetPositionAndBySetFromDate(calendarObjectInstance.startDate)

				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
				recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])

				recurrenceRule.byMonth.push(byMonth)
				recurrenceRule.byDay.push(byDay)
				recurrenceRule.bySetPosition = bySetPosition

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Change the until limit of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byDay The new until to set
		 */
		addByDayToRecurrenceRule({
			recurrenceRule,
			byDay,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byDay The new until to set
		 */
		removeByDayFromRecurrenceRule({
			recurrenceRule,
			byDay,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byMonthDay The new until to set
		 */
		addByMonthDayToRecurrenceRule({
			recurrenceRule,
			byMonthDay,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byMonthDay The new until to set
		 */
		removeByMonthDayFromRecurrenceRule({
			recurrenceRule,
			byMonthDay,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byMonth The new until to set
		 */
		addByMonthToRecurrenceRule({
			recurrenceRule,
			byMonth,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.byMonth The new until to set
		 */
		removeByMonthFromRecurrenceRule({
			recurrenceRule,
			byMonth,
		}) {
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
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string[]} data.byDay The new until to set
		 */
		changeRecurrenceByDay({
			recurrenceRule,
			byDay,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', byDay)
				// TODO recurrenceRule.byDay = byDay
				Vue.set(recurrenceRule, 'byDay', byDay)

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Change the until limit of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.bySetPosition The new until to set
		 */
		changeRecurrenceBySetPosition({
			recurrenceRule,
			bySetPosition,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])
				/// TODO recurrenceRule.bySetPosition = bySetPosition
				Vue.set(recurrenceRule, 'bySetPosition', bySetPosition)

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		markRecurrenceRuleAsSupported({ recurrenceRule }) {
			recurrenceRule.isUnsupported = false
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.alarm The alarm object
		 * @param {string} data.type New type of alarm
		 */
		changeAlarmType({
			alarm,
			type,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.action = type
				alarm.type = type

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.alarm The alarm object
		 * @param {Date} data.date New date object
		 */
		changeAlarmAbsoluteDate({
			alarm,
			date,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.year = date.getFullYear()
				alarm.alarmComponent.trigger.value.month = date.getMonth() + 1
				alarm.alarmComponent.trigger.value.day = date.getDate()
				alarm.alarmComponent.trigger.value.hour = date.getHours()
				alarm.alarmComponent.trigger.value.minute = date.getMinutes()
				alarm.alarmComponent.trigger.value.second = 0

				alarm.absoluteDate = date

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.alarm The alarm object
		 * @param {string} data.timezoneId New timezoneId
		 */
		changeAlarmAbsoluteTimezoneId({
			alarm,
			timezoneId,
		}) {
			if (alarm.alarmComponent) {
				const timezone = getTimezoneManager().getTimezoneForId(timezoneId)
				alarm.alarmComponent.trigger.value.replaceTimezone(timezone)

				alarm.absoluteTimezoneId = timezoneId

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.alarm The alarm object
		 */
		updateAlarmAllDayParts({ alarm }) {
			if (alarm.alarmComponent) {
				const totalSeconds = alarm.alarmComponent.trigger.value.totalSeconds
				const allDayParts = getAmountHoursMinutesAndUnitForAllDayEvents(totalSeconds)

				alarm.relativeUnitAllDay = allDayParts.unit
				alarm.relativeAmountAllDay = allDayParts.amount
				alarm.relativeHoursAllDay = allDayParts.hours
				alarm.relativeMinutesAllDay = allDayParts.minutes
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.alarm The alarm object
		 */
		updateAlarmTimedParts({ alarm }) {
			if (alarm.alarmComponent) {
				const totalSeconds = alarm.alarmComponent.trigger.value.totalSeconds
				const timedParts = getAmountAndUnitForTimedEvents(totalSeconds)

				alarm.relativeUnitTimed = timedParts.unit
				alarm.relativeAmountTimed = timedParts.amount

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.type Type of alarm
		 * @param {number} data.totalSeconds Total amount of seconds for new alarm
		 */
		addAlarmToCalendarObjectInstance({
			calendarObjectInstance,
			type,
			totalSeconds,
		}) {
			if (calendarObjectInstance.eventComponent) {
				const eventComponent = calendarObjectInstance.eventComponent

				const duration = DurationValue.fromSeconds(totalSeconds)
				const alarmComponent = eventComponent.addRelativeAlarm(type, duration)

				const alarmObject = mapAlarmComponentToAlarmObject(alarmComponent)

				calendarObjectInstance.alarms.push(alarmObject)

				console.debug(alarmObject.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.alarm The alarm object
		 */
		removeAlarmFromCalendarObjectInstance({
			calendarObjectInstance,
			alarm,
		}) {
			if (alarm.alarmComponent) {
				calendarObjectInstance.eventComponent.removeAlarm(alarm.alarmComponent)

				const index = calendarObjectInstance.alarms.indexOf(alarm)
				if (index !== -1) {
					calendarObjectInstance.alarms.splice(index, 1)
				}
			}
		},

		/**
		 * @deprecated
		 * @param calendarObjectInstance.calendarObjectInstance
		 * @param calendarObjectInstance
		 * @param calendarObjectInstance.sharedData
		 * @param sharedData
		 */
		addAttachmentBySharedData({
			calendarObjectInstance,
			sharedData,
		}) {
			const attachment = AttachmentProperty.fromLink(sharedData.url)
			const fileName = sharedData.fileName

			// hot-fix needed temporary, because calendar-js has no fileName get-setter
			const parameterFileName = new Parameter('FILENAME', fileName)
			// custom has-preview parameter from dav file
			const xNcHasPreview = new Parameter('X-NC-HAS-PREVIEW', sharedData['has-preview'].toString())
			// custom file id parameter from dav file
			const xNcFileId = new Parameter('X-NC-FILE-ID', sharedData.fileid.toString())
			// custom share-types parameter from dav file
			const xNcSharedTypes = new Parameter('X-NC-SHARED-TYPES', sharedData['share-types']['share-type']
				? sharedData['share-types']['share-type'].join(',')
				: '')
			attachment.setParameter(parameterFileName)
			attachment.setParameter(xNcFileId)
			attachment.setParameter(xNcHasPreview)
			attachment.setParameter(xNcSharedTypes)
			attachment.isNew = true
			attachment.shareTypes = sharedData['share-types']['share-type']
				? sharedData['share-types']['share-type'].join(',')
				: ''
			attachment.fileName = fileName
			attachment.xNcFileId = sharedData.fileid
			attachment.xNcHasPreview = sharedData['has-preview']
			attachment.formatType = sharedData.getcontenttype
			attachment.uri = sharedData.url ? sharedData.url : generateUrl(`/f/${sharedData.fileid}`)

			calendarObjectInstance.eventComponent.addProperty(attachment)
			calendarObjectInstance.attachments.push(attachment)
		},

		/**
		 *
		 * @param calendarObjectInstance.calendarObjectInstance
		 * @param calendarObjectInstance
		 * @param sharedData
		 * @param calendarObjectInstance.sharedData
		 */
		addAttachmentWithProperty({
			calendarObjectInstance,
			sharedData,
		}) {
			const attachment = {}
			const fileName = sharedData.fileName
			attachment.isNew = true
			attachment.shareTypes = (typeof sharedData?.['share-types']?.['share-type'] === 'number'
				? sharedData?.['share-types']?.['share-type']?.toString()
				: sharedData?.['share-types']?.['share-type']?.join(',')) ?? null
			attachment.fileName = fileName
			attachment.xNcFileId = sharedData.fileid
			attachment.xNcHasPreview = sharedData['has-preview']
			attachment.formatType = sharedData.getcontenttype
			attachment.uri = sharedData.url ? sharedData.url : generateUrl(`/f/${sharedData.fileid}`)

			const attachmentProperty = AttachmentProperty.fromLink(attachment.uri, attachment.formatType)
			const parameterFileName = new Parameter('FILENAME', fileName)
			const xNcHasPreview = new Parameter('X-NC-HAS-PREVIEW', attachment.xNcHasPreview.toString())
			const xNcFileId = new Parameter('X-NC-FILE-ID', attachment.xNcFileId.toString())
			// ADD X-NC-SHARED-TYPES only if sharet-type not empty
			if (attachment.shareTypes !== null) {
				const xNcSharedTypes = new Parameter('X-NC-SHARED-TYPES', attachment.shareTypes)
				attachmentProperty.setParameter(xNcSharedTypes)
			}

			attachmentProperty.setParameter(parameterFileName)
			attachmentProperty.setParameter(xNcFileId)
			attachmentProperty.setParameter(xNcHasPreview)
			attachmentProperty.uri = attachment.uri

			attachment.attachmentProperty = attachmentProperty

			calendarObjectInstance.eventComponent.addProperty(attachmentProperty)
			calendarObjectInstance.attachments.push(attachment)
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.attachment The attachment object
		 */
		deleteAttachment({
			calendarObjectInstance,
			attachment,
		}) {
			try {
				const index = calendarObjectInstance.attachments.indexOf(attachment)
				if (index !== -1) {
					calendarObjectInstance.attachments.splice(index, 1)
				}
				calendarObjectInstance.eventComponent.removeAttachment(attachment.attachmentProperty)
			} catch {
			}

		},

		// start of actions
		/**
		 * Returns the closest existing recurrence-id of a calendar-object
		 * close to the given date.
		 * This is either the next occurrence in the future or
		 * in case there are no more future occurrences the closest
		 * occurrence in the past
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.objectId The objectId of the calendar-object to edit
		 * @param {Date} data.closeToDate The date to get a close occurrence to
		 * @return {Promise<number>}
		 */
		async resolveClosestRecurrenceIdForCalendarObject({
			objectId,
			closeToDate,
		}) {
			const calendarsStore = useCalendarsStore()
			const calendarObject = await calendarsStore.getEventByObjectId({ objectId })
			const iterator = calendarObject.calendarComponent.getVObjectIterator()
			const firstVObject = iterator.next().value

			const d = DateTimeValue.fromJSDate(closeToDate, true)
			return firstVObject
				.recurrenceManager
				.getClosestOccurrence(d)
				.getReferenceRecurrenceId()
				.unixTime
		},

		/**
		 * Gets the calendar-object and calendar-object-instance
		 * for a given objectId and recurrenceId.
		 *
		 * If the recurrenceId does not represent a valid instance,
		 * an error will be thrown.
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.objectId The objectId of the calendar-object to edit
		 * @param {number} data.recurrenceId The recurrence-id to edit
		 * @return {Promise<{calendarObject: object, calendarObjectInstance: object}>}
		 */
		async getCalendarObjectInstanceByObjectIdAndRecurrenceId({
			objectId,
			recurrenceId,
		}) {
			const calendarsStore = useCalendarsStore()
			if (this.existingEvent.objectId === objectId && this.existingEvent.recurrenceId === recurrenceId) {
				return Promise.resolve({
					calendarObject: this.calendarObject,
					calendarObjectInstance: this.calendarObjectInstance,
				})
			}

			const recurrenceIdDate = new Date(recurrenceId * 1000)
			const calendarObject = await calendarsStore.getEventByObjectId({ objectId })
			const eventComponent = getObjectAtRecurrenceId(calendarObject, recurrenceIdDate)
			if (eventComponent === null) {
				throw new Error('Not a valid recurrence-id')
			}

			const calendarObjectInstance = mapEventComponentToEventObject(eventComponent)
			this.setCalendarObjectInstanceForExistingEvent({
				calendarObject,
				calendarObjectInstance,
				objectId,
				recurrenceId,
			})

			return {
				calendarObject,
				calendarObjectInstance,
			}
		},

		/**
		 * Gets the new calendar-object-instance.
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.isAllDay Whether or not the new event is supposed to be all-day
		 * @param {number} data.start The start of the new event (unixtime)
		 * @param {number} data.end The end of the new event (unixtime)
		 * @param {string} data.timezoneId The timezoneId of the new event
		 * @return {Promise<{calendarObject: object, calendarObjectInstance: object}>}
		 */
		async getCalendarObjectInstanceForNewEvent({
			isAllDay,
			start,
			end,
			timezoneId,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()
			const settingsStore = useSettingsStore()

			if (this.isNew === true) {
				return Promise.resolve({
					calendarObject: this.calendarObject,
					calendarObjectInstance: this.calendarObjectInstance,
				})
			}

			const calendarObject = await calendarObjectsStore.createNewEvent({
				start,
				end,
				isAllDay,
				timezoneId,
			})
			const startDate = new Date(start * 1000)
			const eventComponent = getObjectAtRecurrenceId(calendarObject, startDate)
			const calendarObjectInstance = mapEventComponentToEventObject(eventComponent)

			// Add an alarm if the user set a default one in the settings. If
			// not, defaultReminder will not be a number (rather the string "none").
			const defaultReminder = parseInt(settingsStore.defaultReminder)
			if (!isNaN(defaultReminder)) {
				this.addAlarmToCalendarObjectInstance({
					calendarObjectInstance,
					type: 'DISPLAY',
					totalSeconds: defaultReminder,
				})
				logger.debug(`Added defaultReminder (${defaultReminder}s) to newly created event`)
			}

			// Add default status
			const rfcProps = getRFCProperties()
			const status = rfcProps.status.defaultValue

			calendarObjectInstance.eventComponent.status = status
			calendarObjectInstance.status = status

			this.setCalendarObjectInstanceForNewEvent({
				calendarObject,
				calendarObjectInstance,
			})

			return {
				calendarObject,
				calendarObjectInstance,
			}
		},

		/**
		 * Updates the existing calendar-object-instance.
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.isAllDay Whether or not the new event is supposed to be all-day
		 * @param {number} data.start The start of the new event (unixtime)
		 * @param {number} data.end The end of the new event (unixtime)
		 * @param {string} data.timezoneId The timezoneId of the new event
		 * @return {Promise<{calendarObject: object, calendarObjectInstance: object}>}
		 */
		async updateCalendarObjectInstanceForNewEvent({
			isAllDay,
			start,
			end,
			timezoneId,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()

			await calendarObjectsStore.updateTimeOfNewEvent({
				calendarObjectInstance: this.calendarObjectInstance,
				start,
				end,
				isAllDay,
				timezoneId,
			})
			this.setCalendarObjectInstanceForNewEvent({
				calendarObject: this.calendarObject,
				calendarObjectInstance: this.calendarObjectInstance,
			})

			return {
				calendarObject: this.calendarObject,
				calendarObjectInstance: this.calendarObjectInstance,
			}
		},

		/**
		 * Saves changes made to a single calendar-object-instance
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.thisAndAllFuture Whether or not to save changes for all future occurrences or just this one
		 * @param {string} data.calendarId The new calendar-id to store it in
		 * @return {Promise<void>}
		 */
		async saveCalendarObjectInstance({
			thisAndAllFuture,
			calendarId,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()

			const eventComponent = this.calendarObjectInstance.eventComponent
			const calendarObject = this.calendarObject

			updateAlarms(eventComponent)
			await updateTalkParticipants(eventComponent)

			if (eventComponent.isDirty()) {
				const isForkedItem = eventComponent.primaryItem !== null
				let original = null
				let fork = null

				// We check if two things apply:
				// - primaryItem !== null -> Is this a fork or not?
				// - eventComponent.canCreateRecurrenceExceptions() - Can we create a recurrence-exception for this item
				if (isForkedItem && eventComponent.canCreateRecurrenceExceptions()) {
					[original, fork] = eventComponent.createRecurrenceException(thisAndAllFuture)
				}

				await calendarObjectsStore.updateCalendarObject({ calendarObject })

				if (original !== null && fork !== null && original.root !== fork.root) {
					await calendarObjectsStore.createCalendarObjectFromFork({
						eventComponent: fork,
						calendarId,
					})
				}
			}

			if (calendarId !== this.calendarObject.calendarId) {
				await calendarObjectsStore.moveCalendarObject({
					calendarObject,
					newCalendarId: calendarId,
				})
			}
		},

		/**
		 * Duplicate calendar-object-instance
		 *
		 * @return {Promise<void>}
		 */
		async duplicateCalendarObjectInstance() {
			const calendarObjectsStore = useCalendarObjectsStore()

			const oldCalendarObjectInstance = this.calendarObjectInstance
			const oldEventComponent = oldCalendarObjectInstance.eventComponent
			const startDate = oldEventComponent.startDate.getInUTC()
			const endDate = oldEventComponent.endDate.getInUTC()
			const calendarObject = await calendarObjectsStore.createNewEvent({
				start: startDate.unixTime,
				end: endDate.unixTime,
				timezoneId: oldEventComponent.startDate.timezoneId,
				isAllDay: oldEventComponent.isAllDay(),
			})
			const eventComponent = getObjectAtRecurrenceId(calendarObject, startDate.jsDate)
			copyCalendarObjectInstanceIntoEventComponent(oldCalendarObjectInstance, eventComponent, true)
			const calendarObjectInstance = mapEventComponentToEventObject(eventComponent)

			await this.setCalendarObjectInstanceForNewEvent({
				calendarObject,
				calendarObjectInstance,
			})
		},

		/**
		 * Deletes a calendar-object-instance
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.thisAndAllFuture Whether or not to delete all future occurrences or just this one
		 * @return {Promise<void>}
		 */
		async deleteCalendarObjectInstance({ thisAndAllFuture }) {
			const calendarObjectsStore = useCalendarObjectsStore()

			const eventComponent = this.calendarObjectInstance.eventComponent
			const isRecurrenceSetEmpty = eventComponent.removeThisOccurrence(thisAndAllFuture)
			const calendarObject = this.calendarObject

			if (isRecurrenceSetEmpty) {
				await calendarObjectsStore.deleteCalendarObject({ calendarObject })
			} else {
				await calendarObjectsStore.updateCalendarObject({ calendarObject })
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {Date} data.startDate The new start-date
		 * @param {boolean} data.onlyTime Only update time
		 * @param data.changeEndDate
		 */
		changeStartDate({
			calendarObjectInstance,
			startDate,
			onlyTime = false,
			changeEndDate = true,
		}) {
			if (onlyTime) {
				startDate.setFullYear(calendarObjectInstance.startDate.getFullYear(), calendarObjectInstance.startDate.getMonth(), calendarObjectInstance.startDate.getDate())
			}

			// Changing the end date first is needed to not have the start date be after the end date
			if (changeEndDate) {
				const difference = startDate.getTime() - calendarObjectInstance.startDate.getTime()
				const endDate = new Date(calendarObjectInstance.endDate.getTime() + difference)

				this.changeEndDateMutation({
					calendarObjectInstance,
					endDate,
				})
			}

			this.changeStartDateMutation({
				calendarObjectInstance,
				startDate,
			})
		},

		/**
		 * Change the timezone of the event's start
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.startTimezone New timezone to set for start
		 */
		changeStartTimezone({
			calendarObjectInstance,
			startTimezone,
		}) {
			this.changeStartTimezoneMutation({
				calendarObjectInstance,
				startTimezone,
			})

			// Simulate a change of the start time to trigger the comparison
			// of start and end and trigger an update of end if necessary
			this.changeStartDateMutation({
				calendarObjectInstance,
				startDate: calendarObjectInstance.startDate,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {Date} data.endDate The new end-date
		 * @param {boolean} data.onlyTime Only update time
		 */
		changeEndDate({
			calendarObjectInstance,
			endDate,
			onlyTime = false,
		}) {
			if (onlyTime) {
				endDate.setFullYear(calendarObjectInstance.endDate.getFullYear(), calendarObjectInstance.endDate.getMonth(), calendarObjectInstance.endDate.getDate())
			}

			this.changeEndDateMutation({
				calendarObjectInstance,
				endDate,
			})
		},

		/**
		 * Change the timezone of the event's end
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {string} data.endTimezone New timezone to set for end
		 */
		changeEndTimezone({
			calendarObjectInstance,
			endTimezone,
		}) {
			this.changeEndTimezoneMutation({
				calendarObjectInstance,
				endTimezone,
			})

			// Simulate a change of the end time to trigger the comparison
			// of start and end and trigger an update of start if necessary
			this.changeEndDateMutation({
				calendarObjectInstance,
				endDate: calendarObjectInstance.endDate,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.frequency The new frequency to set
		 */
		changeRecurrenceFrequency({
			calendarObjectInstance,
			recurrenceRule,
			frequency,
		}) {

			console.debug(calendarObjectInstance)
			console.debug(recurrenceRule)
			console.debug(frequency)

			if (recurrenceRule.frequency === 'NONE' && frequency !== 'NONE') {
				// Add a new recurrence-rule
				const recurrenceValue = RecurValue.fromData({})
				const recurrenceProperty = new Property('RRULE', recurrenceValue)
				calendarObjectInstance.eventComponent.addProperty(recurrenceProperty)
				calendarObjectInstance.recurrenceRule.recurrenceRuleValue = recurrenceValue

				this.resetRecurrenceByParts({ recurrenceRule })
				this.changeRecurrenceFrequencyMutation({
					calendarObjectInstance,
					recurrenceRule: calendarObjectInstance.recurrenceRule,
					frequency,
				})
				this.changeRecurrenceInterval({
					calendarObjectInstance,
					recurrenceRule: calendarObjectInstance.recurrenceRule,
					interval: 1,
				})
				this.changeRecurrenceToInfinite({
					recurrenceRule: calendarObjectInstance.recurrenceRule,
				})
				this.setDefaultRecurrenceByParts({
					calendarObjectInstance,
					recurrenceRule,
					frequency,
				})

				console.debug(`changed from none to ${frequency}`)
			} else if (recurrenceRule.frequency !== 'NONE' && frequency === 'NONE') {
				console.debug('calling removeRecurrenceRuleFromCalendarObjectInstance')
				// Remove the recurrence-rule
				if (recurrenceRule.recurrenceRuleValue) {
					calendarObjectInstance.eventComponent.deleteAllProperties('RRULE')
					/// TODO calendarObjectInstance.recurrenceRule = getDefaultEventObject().recurrenceRule
					Vue.set(calendarObjectInstance, 'recurrenceRule', getDefaultEventObject().recurrenceRule)

					console.debug(calendarObjectInstance)
					console.debug(recurrenceRule)
				}
			} else {
				// Change frequency of existing recurrence-rule
				this.resetRecurrenceByParts({ recurrenceRule })
				this.changeRecurrenceFrequencyMutation({
					calendarObjectInstance,
					recurrenceRule: calendarObjectInstance.recurrenceRule,
					frequency,
				})
				this.setDefaultRecurrenceByParts({
					calendarObjectInstance,
					recurrenceRule,
					frequency,
				})
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.frequency The new frequency to set
		 */
		setDefaultRecurrenceByParts({
			calendarObjectInstance,
			recurrenceRule,
			frequency,
		}) {
			switch (frequency) {
			case 'WEEKLY':
				if (recurrenceRule.recurrenceRuleValue) {
					const byDay = getWeekDayFromDate(calendarObjectInstance.startDate)
					recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
					recurrenceRule.byDay.push(byDay)

					console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
				}
				break

			case 'MONTHLY':
				if (recurrenceRule.recurrenceRuleValue) {
					const byMonthDay = calendarObjectInstance.startDate.getDate()
					recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
					recurrenceRule.byMonthDay.push(byMonthDay)

					console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
				}
				break

			case 'YEARLY':
				if (recurrenceRule.recurrenceRuleValue) {
					const byMonth = calendarObjectInstance.startDate.getMonth() + 1 // Javascript months are zero-based
					recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
					recurrenceRule.byMonth.push(byMonth)

					const byMonthDay = calendarObjectInstance.startDate.getDate()
					recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
					recurrenceRule.byMonthDay.push(byMonthDay)

					console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
				}
				break
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeMonthlyRecurrenceFromByDayToBySetPosition({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			console.debug('changeMonthlyRecurrenceFromByDayToBySetPosition')
			this.resetRecurrenceByParts({ recurrenceRule })
			this.setDefaultRecurrenceByPartsForMonthlyBySetPosition({
				calendarObjectInstance,
				recurrenceRule,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeMonthlyRecurrenceFromBySetPositionToByDay({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			console.debug('changeMonthlyRecurrenceFromBySetPositionToByDay')
			this.resetRecurrenceByParts({ recurrenceRule })

			if (recurrenceRule.recurrenceRuleValue) {
				const byMonthDay = calendarObjectInstance.startDate.getDate()
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
				recurrenceRule.byMonthDay.push(byMonthDay)

				console.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeYearlyRecurrenceFromByDayToBySetPosition({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			this.resetRecurrenceByParts({ recurrenceRule })
			this.setDefaultRecurrenceByPartsForYearlyBySetPosition({
				calendarObjectInstance,
				recurrenceRule,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeYearlyRecurrenceFromBySetPositionToByDay({
			calendarObjectInstance,
			recurrenceRule,
		}) {
			this.resetRecurrenceByParts({ recurrenceRule })

			if (recurrenceRule.recurrenceRuleValue) {
				const byMonth = calendarObjectInstance.startDate.getMonth() + 1 // Javascript months are zero-based
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
				recurrenceRule.byMonth.push(byMonth)

				const byMonthDay = calendarObjectInstance.startDate.getDate()
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
				recurrenceRule.byMonthDay.push(byMonthDay)
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.calendarObjectInstance The calendarObjectInstance object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		enableRecurrenceLimitByUntil({
			calendarObjectInstance,
			recurrenceRule,
		}) {
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
					59,
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
					59,
				)
				break
			}

			this.changeRecurrenceToInfinite({
				recurrenceRule,
			})
			this.changeRecurrenceUntil({
				calendarObjectInstance,
				recurrenceRule,
				until,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		enableRecurrenceLimitByCount({ recurrenceRule }) {
			this.changeRecurrenceToInfinite({
				recurrenceRule,
			})
			this.changeRecurrenceCount({
				recurrenceRule,
				count: 2, // Default value is two
			})
		},

		changeAlarmAmountTimed({
			alarm,
			amount,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountAndUnitForTimedEvents(amount, alarm.relativeUnitTimed, alarm.relativeIsBefore)

				alarm.relativeAmountTimed = amount
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
			this.updateAlarmAllDayParts({ alarm })
		},

		changeAlarmUnitTimed({
			alarm,
			unit,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountAndUnitForTimedEvents(alarm.relativeAmountTimed, unit, alarm.relativeIsBefore)

				alarm.relativeUnitTimed = unit
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}
			this.updateAlarmAllDayParts({ alarm })
		},

		changeAlarmAmountAllDay({
			alarm,
			amount,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(amount,
						alarm.relativeHoursAllDay, alarm.relativeMinutesAllDay, alarm.relativeUnitAllDay)

				alarm.relativeAmountAllDay = amount
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}

			this.updateAlarmTimedParts({ alarm })
		},

		changeAlarmUnitAllDay({
			alarm,
			unit,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(alarm.relativeAmountAllDay,
						alarm.relativeHoursAllDay, alarm.relativeMinutesAllDay, unit)

				alarm.relativeUnitAllDay = unit
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}

			this.updateAlarmTimedParts({ alarm })
		},

		changeAlarmHoursMinutesAllDay({
			alarm,
			hours,
			minutes,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(alarm.relativeAmountAllDay,
						hours, minutes, alarm.relativeUnitAllDay)

				alarm.relativeHoursAllDay = hours
				alarm.relativeMinutesAllDay = minutes
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}

			this.updateAlarmTimedParts({ alarm })
		},

		changeAlarmFromRelativeToAbsolute({
			calendarObjectInstance,
			alarm,
		}) {
			if (alarm.alarmComponent) {
				const triggerDateTime = calendarObjectInstance.eventComponent.startDate.clone()
				// The trigger of an alarm must be DATE-TIME, startDate can be either.
				triggerDateTime.isDate = false

				triggerDateTime.addDuration(alarm.alarmComponent.trigger.value)

				alarm.alarmComponent.setTriggerFromAbsolute(triggerDateTime)

				alarm.absoluteDate = getDateFromDateTimeValue(alarm.alarmComponent.trigger.value)
				alarm.absoluteTimezoneId = alarm.alarmComponent.trigger.value.timezoneId

				console.debug(alarm.alarmComponent.toICALJs().toString())
			}

			alarm.relativeIsBefore = null
			alarm.relativeIsRelatedToStart = null
			alarm.relativeUnitTimed = null
			alarm.relativeAmountTimed = null
			alarm.relativeUnitAllDay = null
			alarm.relativeAmountAllDay = null
			alarm.relativeHoursAllDay = null
			alarm.relativeMinutesAllDay = null
			alarm.relativeTrigger = null
		},

		changeAlarmFromAbsoluteToRelative({
			calendarObjectInstance,
			alarm,
		}) {
			if (alarm.alarmComponent) {
				const duration = alarm.alarmComponent.trigger.value
					.subtractDateWithTimezone(calendarObjectInstance.eventComponent.startDate)

				alarm.alarmComponent.setTriggerFromRelative(duration)
				alarm.relativeIsBefore = alarm.alarmComponent.trigger.value.isNegative
				alarm.relativeIsRelatedToStart = true
				alarm.relativeTrigger = duration.totalSeconds
			}

			this.updateAlarmAllDayParts({ alarm })
			this.updateAlarmTimedParts({ alarm })

			alarm.absoluteDate = null
			alarm.absoluteTimezoneId = null
		},

		toggleAllDay({ calendarObjectInstance }) {
			const settingsStore = useSettingsStore()
			this.toggleAllDayMutation({ calendarObjectInstance })

			if (!calendarObjectInstance.isAllDay) {
				if (calendarObjectInstance.startTimezoneId === 'floating') {
					const startTimezone = settingsStore.getResolvedTimezone
					this.changeStartTimezoneMutation({
						calendarObjectInstance,
						startTimezone,
					})
				}

				this.changeTimeToDefaultForTimedEvents({ calendarObjectInstance })
			}
		},
	},
})
