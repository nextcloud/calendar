/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttachmentProperty, AttendeeProperty, DateTimeValue, DurationValue, Parameter, Property, RecurValue } from '@nextcloud/calendar-js'
import { showWarning } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { generateUrl } from '@nextcloud/router'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { mapAlarmComponentToAlarmObject } from '@/models/alarm.js'
import {
	copyCalendarObjectInstanceIntoEventComponent,
	getDefaultEventObject,
	mapEventComponentToEventObject,
} from '@/models/event.js'
import { getRFCProperties } from '@/models/rfcProps.js'
import { updateRoomParticipantsFromEvent } from '@/services/talkService'
import getTimezoneManager from '@/services/timezoneDataProviderService.js'
import useCalendarObjectsStore from '@/store/calendarObjects.js'
import useCalendarsStore from '@/store/calendars.js'
import useSettingsStore from '@/store/settings.js'
import {
	getAmountAndUnitForTimedEvents,
	getAmountHoursMinutesAndUnitForAllDayEvents,
	getTotalSecondsFromAmountAndUnitForTimedEvents,
	getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents,
	updateAlarms,
	updateDefaultAlarm,
} from '@/utils/alarms.js'
import { getObjectAtRecurrenceId, isBaseOccurrence } from '@/utils/calendarObject.js'
import { getClosestCSS3ColorNameForHex, getHexForColorName } from '@/utils/color.js'
import {
	getDateFromDateTimeValue,
} from '@/utils/date.js'
import logger from '@/utils/logger.js'
import { getBySetPositionAndBySetFromDate, getWeekDayFromDate } from '@/utils/recurrence.js'

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

			if (this.calendarObjectInstance.eventComponent) {
				this.calendarObjectInstance.eventComponent = markRaw(this.calendarObjectInstance.eventComponent)
			}
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

			if (this.calendarObjectInstance.eventComponent) {
				this.calendarObjectInstance.eventComponent = markRaw(this.calendarObjectInstance.eventComponent)
			}
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
		 * @param {string} data.title The new Title
		 */
		changeTitle({ title }) {
			this.calendarObjectInstance.eventComponent.title = title
			this.calendarObjectInstance.title = title
		},

		/**
		 * Change the event's start
		 *
		 * @param {object} data The destructuring object
		 * @param {Date} data.startDate New start date to set
		 */
		changeStartDateMutation({
			startDate,
		}) {
			this.calendarObjectInstance.eventComponent.startDate.year = startDate.getFullYear()
			this.calendarObjectInstance.eventComponent.startDate.month = startDate.getMonth() + 1
			this.calendarObjectInstance.eventComponent.startDate.day = startDate.getDate()
			this.calendarObjectInstance.eventComponent.startDate.hour = startDate.getHours()
			this.calendarObjectInstance.eventComponent.startDate.minute = startDate.getMinutes()
			this.calendarObjectInstance.eventComponent.startDate.second = 0

			const isAllDay = this.calendarObjectInstance.eventComponent.isAllDay()
			const endDateObj = this.calendarObjectInstance.eventComponent.endDate.clone()
			const startDateObj = this.calendarObjectInstance.eventComponent.startDate.clone()

			if (isAllDay) {
				endDateObj.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))

				if (endDateObj.compare(startDateObj) === -1) {
					const timezone = getTimezoneManager().getTimezoneForId(endDateObj.timezoneId)
					this.calendarObjectInstance.eventComponent.endDate
						= this.calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
					this.calendarObjectInstance.endDate = getDateFromDateTimeValue(this.calendarObjectInstance.eventComponent.endDate)
					this.calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
				}
			} else {
				if (endDateObj.compare(startDateObj) === -1) {
					const timezone = getTimezoneManager().getTimezoneForId(endDateObj.timezoneId)
					this.calendarObjectInstance.eventComponent.endDate
						= this.calendarObjectInstance.eventComponent.startDate.getInTimezone(timezone)
					this.calendarObjectInstance.endDate = getDateFromDateTimeValue(this.calendarObjectInstance.eventComponent.endDate)
				}
			}

			this.calendarObjectInstance.startDate = startDate
		},

		/**
		 * Change the timezone of the event's start
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.startTimezone New timezone to set for start
		 */
		changeStartTimezoneMutation({
			startTimezone,
		}) {
			const timezone = getTimezoneManager().getTimezoneForId(startTimezone)
			this.calendarObjectInstance.eventComponent.startDate.replaceTimezone(timezone)
			this.calendarObjectInstance.startTimezoneId = startTimezone

			// Either both are floating or both have a timezone, but it can't be mixed
			if (startTimezone === 'floating' || this.calendarObjectInstance.endTimezoneId === 'floating') {
				this.calendarObjectInstance.eventComponent.endDate.replaceTimezone(timezone)
				this.calendarObjectInstance.endTimezoneId = startTimezone
			}
		},

		/**
		 * Change the event's end
		 *
		 * @param {object} data The destructuring object
		 * @param {Date} data.endDate New end date to set
		 */
		changeEndDateMutation({
			endDate,
		}) {
			// If the event is using DURATION, endDate is dynamically generated.
			// In order to alter it, we need to explicitly set DTEND
			const endDateObject = this.calendarObjectInstance.eventComponent.endDate
			this.calendarObjectInstance.eventComponent.endDate = endDateObject

			this.calendarObjectInstance.eventComponent.endDate.year = endDate.getFullYear()
			this.calendarObjectInstance.eventComponent.endDate.month = endDate.getMonth() + 1
			this.calendarObjectInstance.eventComponent.endDate.day = endDate.getDate()
			this.calendarObjectInstance.eventComponent.endDate.hour = endDate.getHours()
			this.calendarObjectInstance.eventComponent.endDate.minute = endDate.getMinutes()
			this.calendarObjectInstance.eventComponent.endDate.second = 0

			const isAllDay = this.calendarObjectInstance.eventComponent.isAllDay()
			const endDateObj = this.calendarObjectInstance.eventComponent.endDate.clone()
			const startDateObj = this.calendarObjectInstance.eventComponent.startDate.clone()

			if (isAllDay) {
				if (endDateObj.compare(startDateObj) === -1) {
					const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
					this.calendarObjectInstance.eventComponent.startDate
						= this.calendarObjectInstance.eventComponent.endDate.getInTimezone(timezone)
					this.calendarObjectInstance.startDate = getDateFromDateTimeValue(this.calendarObjectInstance.eventComponent.startDate)
				}

				// endDate is inclusive, but DTEND needs to be exclusive, so always add one day
				this.calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			} else {
				// Is end before start?
				if (endDateObj.compare(startDateObj) === -1) {
					// Is end more than one day before start?
					endDateObj.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
					if (endDateObj.compare(startDateObj) === -1) {
						const timezone = getTimezoneManager().getTimezoneForId(startDateObj.timezoneId)
						this.calendarObjectInstance.eventComponent.startDate
							= this.calendarObjectInstance.eventComponent.endDate.getInTimezone(timezone)
						this.calendarObjectInstance.startDate = getDateFromDateTimeValue(this.calendarObjectInstance.eventComponent.startDate)
					} else {
						// add one day to endDate if the endDate is before the startDate which allows to easily create events that reach over or to 0:00
						this.calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
						endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
					}
				}
			}

			this.calendarObjectInstance.endDate = endDate
		},

		/**
		 * Change the timezone of the event's end
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.endTimezone New timezone to set for end
		 */
		changeEndTimezoneMutation({
			endTimezone,
		}) {
			const timezone = getTimezoneManager().getTimezoneForId(endTimezone)
			this.calendarObjectInstance.eventComponent.endDate.replaceTimezone(timezone)
			this.calendarObjectInstance.endTimezoneId = endTimezone

			// Either both are floating or both have a timezone, but it can't be mixed
			if (endTimezone === 'floating' || this.calendarObjectInstance.startTimezoneId === 'floating') {
				this.calendarObjectInstance.eventComponent.startDate.replaceTimezone(timezone)
				this.calendarObjectInstance.startTimezoneId = endTimezone
			}
		},

		/**
		 * Switch from a timed event to allday or vice versa
		 */
		toggleAllDayMutation() {
			if (!this.calendarObjectInstance.eventComponent.canModifyAllDay() && this.calendarObject.existsOnServer) {
				return
			}

			const isAllDay = this.calendarObjectInstance.eventComponent.isAllDay()
			this.calendarObjectInstance.eventComponent.startDate.isDate = !isAllDay
			this.calendarObjectInstance.eventComponent.endDate.isDate = !isAllDay
			this.calendarObjectInstance.isAllDay = this.calendarObjectInstance.eventComponent.isAllDay()

			// isAllDay = old value
			if (isAllDay) {
				this.calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(-1 * 60 * 60 * 24))
			} else {
				this.calendarObjectInstance.eventComponent.endDate.addDuration(DurationValue.fromSeconds(60 * 60 * 24))
			}
		},

		/**
		 * Changes the time of a timed event to the default values
		 */
		changeTimeToDefaultForTimedEvents() {
			const startDate = this.calendarObjectInstance.eventComponent.startDate
			const endDate = this.calendarObjectInstance.eventComponent.endDate
			if (startDate.hour === 0 && startDate.minute === 0 && endDate.hour === 0 && endDate.minute === 0) {
				startDate.hour = 10
				endDate.hour = 11

				this.calendarObjectInstance.startDate = getDateFromDateTimeValue(startDate)
				this.calendarObjectInstance.endDate = getDateFromDateTimeValue(endDate)
			}
		},

		/**
		 * Change the location of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.location New location to set
		 */
		changeLocation({
			location,
		}) {
			// Special case: delete Apple-specific location property to avoid inconsistencies
			this.calendarObjectInstance.eventComponent.deleteAllProperties('X-APPLE-STRUCTURED-LOCATION')

			this.calendarObjectInstance.eventComponent.location = location
			this.calendarObjectInstance.location = location
		},

		/**
		 * Change the description of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.description New description to set
		 */
		changeDescription({
			description,
		}) {
			// To avoid inconsistencies (bug #3863), remove all parameters (e.g., ALTREP) upon modification
			const descriptionProperty = this.calendarObjectInstance.eventComponent.getFirstProperty('Description')
			if (descriptionProperty) {
				for (const parameter of descriptionProperty.getParametersIterator()) {
					descriptionProperty.deleteParameter(parameter.name)
				}
			}

			// Delete custom description properties
			this.calendarObjectInstance.eventComponent.deleteAllProperties('X-ALT-DESC')

			this.calendarObjectInstance.eventComponent.description = description
			this.calendarObjectInstance.description = description
		},

		/**
		 * Change the access class of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.accessClass New access class to set
		 */
		changeAccessClass({ accessClass }) {
			this.calendarObjectInstance.eventComponent.accessClass = accessClass
			this.calendarObjectInstance.accessClass = accessClass
		},

		/**
		 * Change the status of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.status New status to set
		 */
		changeStatus({ status }) {
			this.calendarObjectInstance.eventComponent.status = status
			this.calendarObjectInstance.status = status
		},

		/**
		 * Change the time-transparency of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.timeTransparency New time-transparency to set
		 */
		changeTimeTransparency({ timeTransparency }) {
			this.calendarObjectInstance.eventComponent.timeTransparency = timeTransparency
			this.calendarObjectInstance.timeTransparency = timeTransparency
		},

		/**
		 * Change the invitation-forwarding property of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.invitationForwarding Invitation forwarding value
		 */
		changeInvitationForwarding({ invitationForwarding }) {
			this.calendarObjectInstance.eventComponent.updatePropertyWithValue('X-NC-INVITATION-FORWARDING', invitationForwarding)
			this.calendarObjectInstance.invitationForwarding = invitationForwarding
		},

		/**
		 * Change the customized color of an event
		 *
		 * @param {object} data The destructuring object
		 * @param {string | null} data.customColor New color to set
		 */
		changeCustomColor({ customColor }) {
			if (customColor === null) {
				this.calendarObjectInstance.eventComponent.deleteAllProperties('COLOR')
				this.calendarObjectInstance.customColor = null
				return
			}

			const cssColorName = getClosestCSS3ColorNameForHex(customColor)
			const hexColorOfCssName = getHexForColorName(cssColorName)

			// Abort if either is undefined
			if (!cssColorName || !hexColorOfCssName) {
				logger.error('Setting custom color failed', { customColor, cssColorName, hexColorOfCssName })
				return
			}

			this.calendarObjectInstance.eventComponent.color = cssColorName
			this.calendarObjectInstance.customColor = hexColorOfCssName
		},

		/**
		 * Adds an attendee to the event and sets the organizer if not present already
		 *
		 * @param {object} data The destructuring object
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
			this.calendarObjectInstance.eventComponent.addProperty(attendee)
			this.calendarObjectInstance.attendees.push({
				commonName,
				participationStatus,
				role,
				rsvp,
				uri,
				attendeeProperty: markRaw(attendee),
			})

			if (!this.calendarObjectInstance.organizer && organizer) {
				this.setOrganizer({
					commonName: organizer.displayname,
					email: organizer.emailAddress,
				})
			}
		},

		/**
		 * Removes an attendee from the event
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attendee The attendee object to remove
		 */
		removeAttendee({
			attendee,
		}) {
			this.calendarObjectInstance.eventComponent.removeAttendee(attendee.attendeeProperty)
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
						this.calendarObjectInstance.eventComponent.removeAttendee(member.attendeeProperty)
						const index = this.calendarObjectInstance.attendees.indexOf(member)
						if (index !== -1) {
							this.calendarObjectInstance.attendees.splice(index, 1)
						}
					}
				})
			}

			const index = this.calendarObjectInstance.attendees.indexOf(attendee)
			if (index !== -1) {
				this.calendarObjectInstance.attendees.splice(index, 1)
			}

			if (this.calendarObjectInstance.attendees.length === 0) {
				this.calendarObjectInstance.organizer = null
				this.calendarObjectInstance.eventComponent.deleteAllProperties('ORGANIZER')
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
		 * Change the current attendee's participation status and save it with
		 * the scope of the component the attendee is responding to.
		 *
		 * Responses to generated occurrences apply to the recurring master,
		 * while responses to existing recurrence exceptions remain on the
		 * exception.
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attendee The attendee object
		 * @param {string} data.participationStatus New participation status
		 * @return {Promise<void>}
		 */
		async saveAttendeeParticipationResponse({
			attendee,
			participationStatus,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = this.calendarObjectInstance.eventComponent
			const responseScope = eventComponent.isRecurrenceException() ? 'occurrence' : 'series'
			let attendeeProperty = attendee.attendeeProperty

			if (responseScope === 'series') {
				let baseComponent = null
				for (const component of this.calendarObject.calendarComponent.getComponentIterator()) {
					if (component.name === eventComponent.name && !component.hasProperty('RECURRENCE-ID')) {
						baseComponent = component
						break
					}
				}

				if (baseComponent === null) {
					throw new Error('Recurring master component not found')
				}

				const attendeeEmail = attendeeProperty.email.toLowerCase()
				attendeeProperty = null
				for (const masterAttendee of baseComponent.getAttendeeIterator()) {
					if (masterAttendee.email.toLowerCase() === attendeeEmail) {
						attendeeProperty = masterAttendee
						break
					}
				}

				if (attendeeProperty === null) {
					throw new Error('Attendee not found on recurring master component')
				}
			}

			attendeeProperty.participationStatus = participationStatus
			attendee.participationStatus = participationStatus
			await calendarObjectsStore.updateCalendarObject({ calendarObject: this.calendarObject })
		},

		/**
		 * Set the event's organizer
		 *
		 * @param {object} data The destructuring object
		 * @param {string=} data.commonName Displayname of organizer
		 * @param {string} data.email Email-address of organizer
		 */
		setOrganizer({ commonName = null, email }) {
			this.calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail(commonName, email)
			this.calendarObjectInstance.organizer = {
				commonName,
				uri: email,
				attendeeProperty: this.calendarObjectInstance.eventComponent.getFirstProperty('ORGANIZER'),
			}
		},

		/**
		 * Adds a category to the event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.category Category to add
		 */
		addCategory({ category }) {
			this.calendarObjectInstance.eventComponent.addCategory(category)
			this.calendarObjectInstance.categories.push(category)
		},

		/**
		 * Removes a category from the event
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.category Category to remove
		 */
		removeCategory({ category }) {
			this.calendarObjectInstance.eventComponent.removeCategory(category)

			const index = this.calendarObjectInstance.categories.indexOf(category)
			if (index !== -1) {
				this.calendarObjectInstance.categories.splice(index, 1)
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 * Change the until limit of the recurrence-rule
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {Date} data.until The new until to set
		 */
		changeRecurrenceUntil({
			recurrenceRule,
			until,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				// RFC 5545, setion 3.3.10: until must be in UTC if the start time is timezone-aware
				if (this.calendarObjectInstance.startTimezoneId !== 'floating') {
					recurrenceRule.recurrenceRuleValue.until = DateTimeValue.fromJSDate(until, { zone: 'utc' })
				} else {
					recurrenceRule.recurrenceRuleValue.until = DateTimeValue.fromJSDate(until)
				}
				recurrenceRule.until = until
				recurrenceRule.count = null

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				recurrenceRule.byDay = []
				recurrenceRule.byMonth = []
				recurrenceRule.byMonthDay = []
				recurrenceRule.bySetPosition = null

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		setDefaultRecurrenceByPartsForMonthlyBySetPosition({
			recurrenceRule,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				const {
					byDay,
					bySetPosition,
				} = getBySetPositionAndBySetFromDate(this.calendarObjectInstance.startDate)
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
				recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])

				recurrenceRule.byDay.push(byDay)
				recurrenceRule.bySetPosition = bySetPosition

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		setDefaultRecurrenceByPartsForYearlyBySetPosition({
			recurrenceRule,
		}) {
			if (recurrenceRule.recurrenceRuleValue) {
				const byMonth = this.calendarObjectInstance.startDate.getMonth() + 1
				const { byDay, bySetPosition } = getBySetPositionAndBySetFromDate(this.calendarObjectInstance.startDate)

				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
				recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
				recurrenceRule.recurrenceRuleValue.setComponent('BYSETPOS', [bySetPosition])

				recurrenceRule.byMonth.push(byMonth)
				recurrenceRule.byDay.push(byDay)
				recurrenceRule.bySetPosition = bySetPosition

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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
				logger.debug('addByMonthToRecurrenceRule', byMonth)

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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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
				logger.debug('removeByMonthFromRecurrenceRule', byMonth)

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

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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
				recurrenceRule.byDay = byDay

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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
				recurrenceRule.bySetPosition = bySetPosition

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object=} data.calendarObjectInstance The calendar-object-instance to add the alarm to, defaults to the current one
		 * @param {string} data.type Type of alarm
		 * @param {number} data.totalSeconds Total amount of seconds for new alarm
		 * @param {boolean=} data.isDefault Whether this is the default alarm
		 */
		addAlarmToCalendarObjectInstance({
			calendarObjectInstance = this.calendarObjectInstance,
			type,
			totalSeconds,
			isDefault = false,
		}) {
			if (calendarObjectInstance.eventComponent) {
				const eventComponent = calendarObjectInstance.eventComponent

				const duration = DurationValue.fromSeconds(totalSeconds)
				const alarmComponent = eventComponent.addRelativeAlarm(type, duration)

				if (isDefault) {
					alarmComponent.addProperty(new Property('X-NC-DEFAULT-ALARM', isDefault))
				}

				const alarmObject = mapAlarmComponentToAlarmObject(alarmComponent)

				calendarObjectInstance.alarms.push(alarmObject)

				logger.debug(alarmObject.alarmComponent.toICALJs().toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object=} data.calendarObjectInstance The calendar-object-instance to remove the alarm from, defaults to the current one
		 * @param {object} data.alarm The alarm object
		 */
		removeAlarmFromCalendarObjectInstance({
			calendarObjectInstance = this.calendarObjectInstance,
			alarm,
		}) {
			if (alarm.alarmComponent) {
				const alarmIterator = calendarObjectInstance.eventComponent.getAlarmIterator()
				let matchedAlarm = null
				const targetSeconds = alarm.alarmComponent.trigger.value.totalSeconds
				const targetAction = alarm.alarmComponent.action
				for (const a of alarmIterator) {
					if (a.trigger.value.totalSeconds === targetSeconds && a.action === targetAction) {
						matchedAlarm = a
						break
					}
				}

				if (matchedAlarm) {
					calendarObjectInstance.eventComponent.removeAlarm(matchedAlarm)
				}

				const index = calendarObjectInstance.alarms.indexOf(alarm)
				if (index !== -1) {
					calendarObjectInstance.alarms.splice(index, 1)
				}
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.sharedData The shared file data to attach
		 */
		addAttachmentWithProperty({
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

			this.calendarObjectInstance.eventComponent.addProperty(attachmentProperty)
			this.calendarObjectInstance.attachments.push(attachment)
		},

		/**
		 *
		 * @param {object} data The destructuring object
		 * @param {object} data.attachment The attachment object
		 */
		deleteAttachment({
			attachment,
		}) {
			try {
				const index = this.calendarObjectInstance.attachments.indexOf(attachment)
				if (index !== -1) {
					this.calendarObjectInstance.attachments.splice(index, 1)
				}
				this.calendarObjectInstance.eventComponent.removeAttachment(attachment.attachmentProperty)
			} catch (error) {
				logger.error('Failed to delete attachment', { error })
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
		 * @return {Promise<void>}
		 */
		async getCalendarObjectInstanceByObjectIdAndRecurrenceId({
			objectId,
			recurrenceId,
		}) {
			const calendarsStore = useCalendarsStore()
			if (this.existingEvent.objectId === objectId && this.existingEvent.recurrenceId === recurrenceId) {
				return
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
		},

		/**
		 * Gets the new calendar-object-instance.
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.isAllDay Whether or not the new event is supposed to be all-day
		 * @param {number} data.start The start of the new event (unixtime)
		 * @param {number} data.end The end of the new event (unixtime)
		 * @param {string} data.timezoneId The timezoneId of the new event
		 * @return {Promise<void>}
		 */
		async getCalendarObjectInstanceForNewEvent({
			isAllDay,
			start,
			end,
			timezoneId,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()

			if (this.isNew === true) {
				return
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

			const calendarsStore = useCalendarsStore()
			const calendar = calendarsStore.getCalendarById(calendarObject.calendarId)

			// Inherit calendar transparency to new events
			if (['TRANSPARENT', 'OPAQUE'].includes(calendar.transparency.toUpperCase())) {
				const value = calendar.transparency.toUpperCase()
				calendarObjectInstance.timeTransparency = value
				calendarObjectInstance.eventComponent.timeTransparency = value
			}

			updateDefaultAlarm(calendarObject.calendarId, calendarObjectInstance)

			// Add default status
			const rfcProps = getRFCProperties()
			const status = rfcProps.status.defaultValue

			calendarObjectInstance.eventComponent.status = status

			this.setCalendarObjectInstanceForNewEvent({
				calendarObject,
				calendarObjectInstance,
			})

			calendarObjectInstance.eventComponent.undirtify()
		},

		/**
		 * Updates the existing calendar-object-instance.
		 *
		 * @param {object} data The destructuring object
		 * @param {boolean} data.isAllDay Whether or not the new event is supposed to be all-day
		 * @param {number} data.start The start of the new event (unixtime)
		 * @param {number} data.end The end of the new event (unixtime)
		 * @param {string} data.timezoneId The timezoneId of the new event
		 */
		updateCalendarObjectInstanceForNewEvent({
			isAllDay,
			start,
			end,
			timezoneId,
		}) {
			this.updateTimeOfNewEvent({
				start,
				end,
				isAllDay,
				timezoneId,
			})
			this.setCalendarObjectInstanceForNewEvent({
				calendarObject: this.calendarObject,
				calendarObjectInstance: this.calendarObjectInstance,
			})
		},

		/**
		 * Saves changes made to a single calendar-object-instance
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.scope Modification scope: 'occurrence', 'future', or 'series'
		 * @param {string} data.calendarId The new calendar-id to store it in
		 * @return {Promise<void>}
		 */
		async saveCalendarObjectInstance({
			scope,
			calendarId,
		}) {
			const calendarObjectsStore = useCalendarObjectsStore()

			const eventComponent = this.calendarObjectInstance.eventComponent
			const calendarObject = this.calendarObject
			const isForkedItem = eventComponent.primaryItem !== null

			updateAlarms(eventComponent)

			if (eventComponent.isDirty() && eventComponent.isPartOfRecurrenceSet() && scope === 'series') {
				// Do not permit applying series-wide changes from a recurrence exception
				// Recurrence exceptions do not have the full set of properties that the base component has.
				if (eventComponent.isRecurrenceException()) {
					logger.error('Only "this occurrence" can be updated while editing an existing recurrence exception')
					return
				}
				// Find the master component (without RECURRENCE-ID)
				let baseComponent = null
				for (const component of calendarObject.calendarComponent.getComponentIterator()) {
					if (component.name === eventComponent.name && !component.hasProperty('RECURRENCE-ID')) {
						baseComponent = component
						break
					}
				}

				if (!baseComponent) {
					logger.error('Could not find master component to save series-wide changes to')
				} else {
					// Determine if eventComponent is the primary (first) occurrence of its series
					const isPrimaryOccurrence = isBaseOccurrence(calendarObject, eventComponent)

					if (!isPrimaryOccurrence) {
						// The actual, unedited occurrence - used both to detect whether the user changed the date/time.
						const originalOccurrence = baseComponent.recurrenceManager.getOccurrenceAtExactly(eventComponent.originalRecurrenceId)

						const dateTimeWasChanged = eventComponent.startDate.compare(originalOccurrence.startDate) !== 0
							|| eventComponent.endDate.compare(originalOccurrence.endDate) !== 0
							|| eventComponent.startDate.timezoneId !== originalOccurrence.startDate.timezoneId
							|| eventComponent.endDate.timezoneId !== originalOccurrence.endDate.timezoneId
							|| eventComponent.isAllDay() !== originalOccurrence.isAllDay()

						if (dateTimeWasChanged) {
							showWarning(t('calendar', 'We noticed that you adjusted the date or time. Since this is not the first occurrence of the series, the date/time changes have been discarded. To change the date or time of the whole series, please edit the first occurrence.'))

							// Revert the editor's own date/time back to the original occurrence
							eventComponent.startDate = originalOccurrence.startDate.clone()
							eventComponent.endDate = originalOccurrence.endDate.clone()
							this.calendarObjectInstance.startDate = getDateFromDateTimeValue(originalOccurrence.startDate)
							this.calendarObjectInstance.endDate = getDateFromDateTimeValue(originalOccurrence.endDate)
						}
					}

					// Clear the base component's own properties, then clone eventComponent's over wholesale
					// we might be editing an instance or fork, not the base component itself. Both properties
					// eventComponent already shared with the base component AND ones it didn't (e.g. a LOCATION
					// added for the first time) need to end up on the base component.
					const excludedPropertyNames = ['UID', 'RECURRENCE-ID', 'DTSTART', 'DTEND']
					for (const property of baseComponent.getPropertyIterator()) {
						if (excludedPropertyNames.includes(property.name)) {
							continue
						}
						baseComponent.deleteAllProperties(property.name)
					}
					for (const property of eventComponent.getPropertyIterator()) {
						if (excludedPropertyNames.includes(property.name)) {
							continue
						}
						baseComponent.addProperty(property.clone())
					}
					// DTSTART and DTEND need to be cloned separately so that internal logic of ical.js
					// can adjust all the recurrence rules and exceptions accordingly. Only do so when
					// editing the base occurrence - otherwise we risk changing the date/time of the whole
					// series when the user only intended to change a single occurrence.
					if (isPrimaryOccurrence) {
						baseComponent.startDate = eventComponent.startDate.clone()
						baseComponent.endDate = eventComponent.endDate.clone()
					}
					// Only VALARM is copied here because it's the only sub-component the
					// editor currently lets users change; other sub-components (e.g.
					// PARTICIPANT, VLOCATION, VRESOURCE) that another client may have set
					// are left untouched on baseComponent.
					baseComponent.deleteAllComponents('VALARM')
					for (const alarm of eventComponent.getAlarmIterator()) {
						baseComponent.addComponent(alarm.clone())
					}

					await calendarObjectsStore.updateCalendarObject({ calendarObject })

					eventComponent.resetDirty()

					// trigger room update but don't wait for it
					updateRoomParticipantsFromEvent(eventComponent)
				}
			}

			if (eventComponent.isDirty() && scope !== 'series') {
				// Do not permit "future occurrences" edits on an existing recurrence exception
				if (isForkedItem && scope === 'future' && eventComponent.isRecurrenceException()) {
					logger.error('Only "this occurrence" can be updated while editing an existing recurrence exception')
					return
				}
				// Do not permit "this occurrence"/"this and future" edits on the primary
				if (isForkedItem && (scope === 'occurrence' || scope === 'future') && isBaseOccurrence(calendarObject, eventComponent)) {
					logger.error('Only "series" can be updated while editing the primary occurrence of a series')
					return
				}

				let original = null
				let fork = null

				// We check if two things apply:
				// - primaryItem !== null -> Is this a fork or not?
				// - eventComponent.canCreateRecurrenceExceptions() - Can we create a recurrence-exception for this item
				if (isForkedItem && eventComponent.canCreateRecurrenceExceptions()) {
					[original, fork] = eventComponent.createRecurrenceException(scope === 'future')
				}

				await calendarObjectsStore.updateCalendarObject({ calendarObject })

				if (original !== null && fork !== null && original.root !== fork.root) {
					await calendarObjectsStore.createCalendarObjectFromFork({
						eventComponent: fork,
						calendarId,
					})
				}
				// trigger room update but don't wait for it
				updateRoomParticipantsFromEvent(eventComponent)
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
		 * @param {object} data The destructuring object
		 * @param {string} data.calendarId The id of the calendar to duplicate the event into. Must be a writable calendar
		 * @return {Promise<void>}
		 */
		async duplicateCalendarObjectInstance({ calendarId }) {
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
				calendarId,
			})
			const eventComponent = getObjectAtRecurrenceId(calendarObject, startDate.jsDate)
			copyCalendarObjectInstanceIntoEventComponent(oldCalendarObjectInstance, eventComponent)
			const calendarObjectInstance = mapEventComponentToEventObject(eventComponent)

			this.setCalendarObjectInstanceForNewEvent({
				calendarObject,
				calendarObjectInstance,
			})
		},

		/**
		 * Deletes a calendar-object-instance
		 *
		 * @param {object} data The destructuring object
		 * @param {string} data.scope Deletion scope: 'occurrence', 'future', or 'series'
		 * @return {Promise<void>}
		 */
		async deleteCalendarObjectInstance({ scope }) {
			const calendarObjectsStore = useCalendarObjectsStore()
			const eventComponent = this.calendarObjectInstance.eventComponent

			// Singleton event or deleting all occurrences - delete the whole calendar-object
			if (!eventComponent.isPartOfRecurrenceSet() || scope === 'series') {
				await calendarObjectsStore.deleteCalendarObject({ calendarObject: this.calendarObject })
				return
			}

			// Do not permit "this occurrence"/"this and future" deletes on the primary
			// occurrence of a series - only "series" makes sense there
			if (isBaseOccurrence(this.calendarObject, eventComponent)) {
				logger.error('Only "series" can be deleted while editing the primary occurrence of a series')
				return
			}

			// Recurring event - remove this occurrence or this and all future
			const isRecurrenceSetEmpty = eventComponent.removeThisOccurrence(scope === 'future')
			if (isRecurrenceSetEmpty) {
				await calendarObjectsStore.deleteCalendarObject({ calendarObject: this.calendarObject })
			} else {
				await calendarObjectsStore.updateCalendarObject({ calendarObject: this.calendarObject })
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {Date} data.startDate The new start-date
		 * @param {boolean} data.onlyTime Only update time
		 * @param {boolean=} data.changeEndDate Whether to also shift the end-date to preserve the duration
		 */
		changeStartDate({
			startDate,
			onlyTime = false,
			changeEndDate = true,
		}) {
			// Calculate current duration between start and end
			const oldDuration = this.calendarObjectInstance.endDate.getTime() - this.calendarObjectInstance.startDate.getTime()

			if (onlyTime) {
				startDate.setFullYear(this.calendarObjectInstance.startDate.getFullYear(), this.calendarObjectInstance.startDate.getMonth(), this.calendarObjectInstance.startDate.getDate())
			}

			this.changeStartDateMutation({
				startDate,
			})

			// When changing time, preserve the original duration
			if (changeEndDate) {
				const newEndDate = new Date(startDate.getTime() + oldDuration)
				this.changeEndDateMutation({
					endDate: newEndDate,
				})
			}
		},

		/**
		 * Change the timezone of the event's start
		 *
		 * @param {object} data The destructuring object for data
		 * @param {string} data.startTimezone New timezone to set for start
		 */
		changeStartTimezone({
			startTimezone,
		}) {
			this.changeStartTimezoneMutation({
				startTimezone,
			})

			// Simulate a change of the start time to trigger the comparison
			// of start and end and trigger an update of end if necessary
			this.changeStartDateMutation({
				startDate: this.calendarObjectInstance.startDate,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {Date} data.endDate The new end-date
		 * @param {boolean} data.onlyTime Only update time
		 */
		changeEndDate({
			endDate,
			onlyTime = false,
		}) {
			if (onlyTime) {
				endDate.setFullYear(this.calendarObjectInstance.endDate.getFullYear(), this.calendarObjectInstance.endDate.getMonth(), this.calendarObjectInstance.endDate.getDate())
			}

			this.changeEndDateMutation({
				endDate,
			})
		},

		/**
		 * Change the timezone of the event's end
		 *
		 * @param {object} data The destructuring object for data
		 * @param {string} data.endTimezone New timezone to set for end
		 */
		changeEndTimezone({
			endTimezone,
		}) {
			this.changeEndTimezoneMutation({
				endTimezone,
			})

			// Simulate a change of the end time to trigger the comparison
			// of start and end and trigger an update of start if necessary
			this.changeEndDateMutation({
				endDate: this.calendarObjectInstance.endDate,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.frequency The new frequency to set
		 */
		changeRecurrenceFrequency({
			recurrenceRule,
			frequency,
		}) {
			logger.debug('changeRecurrenceFrequency', { calendarObjectInstance: this.calendarObjectInstance, recurrenceRule, frequency })

			if (recurrenceRule.frequency === 'NONE' && frequency !== 'NONE') {
				// Add a new recurrence-rule
				const recurrenceValue = RecurValue.fromData({})
				const recurrenceProperty = new Property('RRULE', recurrenceValue)
				this.calendarObjectInstance.eventComponent.addProperty(recurrenceProperty)
				this.calendarObjectInstance.recurrenceRule.recurrenceRuleValue = recurrenceValue

				this.resetRecurrenceByParts({ recurrenceRule })
				this.changeRecurrenceFrequencyMutation({
					recurrenceRule: this.calendarObjectInstance.recurrenceRule,
					frequency,
				})
				this.changeRecurrenceInterval({
					recurrenceRule: this.calendarObjectInstance.recurrenceRule,
					interval: 1,
				})
				this.changeRecurrenceToInfinite({
					recurrenceRule: this.calendarObjectInstance.recurrenceRule,
				})
				this.setDefaultRecurrenceByParts({
					recurrenceRule,
					frequency,
				})

				logger.debug(`changed from none to ${frequency}`)
			} else if (recurrenceRule.frequency !== 'NONE' && frequency === 'NONE') {
				logger.debug('calling removeRecurrenceRuleFromCalendarObjectInstance')
				// Remove the recurrence-rule
				if (recurrenceRule.recurrenceRuleValue) {
					this.calendarObjectInstance.eventComponent.deleteAllProperties('RRULE')
					/// TODO calendarObjectInstance.recurrenceRule = getDefaultEventObject().recurrenceRule
					this.calendarObjectInstance.recurrenceRule = getDefaultEventObject().recurrenceRule

					logger.debug('Removed recurrence-rule', { calendarObjectInstance: this.calendarObjectInstance, recurrenceRule })
				}
			} else {
				// Change frequency of existing recurrence-rule
				this.resetRecurrenceByParts({ recurrenceRule })
				this.changeRecurrenceFrequencyMutation({
					recurrenceRule: this.calendarObjectInstance.recurrenceRule,
					frequency,
				})
				this.setDefaultRecurrenceByParts({
					recurrenceRule,
					frequency,
				})
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {string} data.frequency The new frequency to set
		 */
		setDefaultRecurrenceByParts({
			recurrenceRule,
			frequency,
		}) {
			switch (frequency) {
				case 'WEEKLY':
					if (recurrenceRule.recurrenceRuleValue) {
						const byDay = getWeekDayFromDate(this.calendarObjectInstance.startDate)
						recurrenceRule.recurrenceRuleValue.setComponent('BYDAY', [byDay])
						recurrenceRule.byDay.push(byDay)

						logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
					}
					break

				case 'MONTHLY':
					if (recurrenceRule.recurrenceRuleValue) {
						const byMonthDay = this.calendarObjectInstance.startDate.getDate()
						recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
						recurrenceRule.byMonthDay.push(byMonthDay)

						logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
					}
					break

				case 'YEARLY':
					if (recurrenceRule.recurrenceRuleValue) {
						const byMonth = this.calendarObjectInstance.startDate.getMonth() + 1 // Javascript months are zero-based
						recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
						recurrenceRule.byMonth.push(byMonth)

						const byMonthDay = this.calendarObjectInstance.startDate.getDate()
						recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
						recurrenceRule.byMonthDay.push(byMonthDay)

						logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
					}
					break
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeMonthlyRecurrenceFromByDayToBySetPosition({
			recurrenceRule,
		}) {
			logger.debug('changeMonthlyRecurrenceFromByDayToBySetPosition')
			this.resetRecurrenceByParts({ recurrenceRule })
			this.setDefaultRecurrenceByPartsForMonthlyBySetPosition({
				recurrenceRule,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeMonthlyRecurrenceFromBySetPositionToByDay({
			recurrenceRule,
		}) {
			logger.debug('changeMonthlyRecurrenceFromBySetPositionToByDay')
			this.resetRecurrenceByParts({ recurrenceRule })

			if (recurrenceRule.recurrenceRuleValue) {
				const byMonthDay = this.calendarObjectInstance.startDate.getDate()
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
				recurrenceRule.byMonthDay.push(byMonthDay)

				logger.debug(recurrenceRule.recurrenceRuleValue._innerValue.toString())
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeYearlyRecurrenceFromByDayToBySetPosition({
			recurrenceRule,
		}) {
			this.resetRecurrenceByParts({ recurrenceRule })
			this.setDefaultRecurrenceByPartsForYearlyBySetPosition({
				recurrenceRule,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		changeYearlyRecurrenceFromBySetPositionToByDay({
			recurrenceRule,
		}) {
			this.resetRecurrenceByParts({ recurrenceRule })

			if (recurrenceRule.recurrenceRuleValue) {
				const byMonth = this.calendarObjectInstance.startDate.getMonth() + 1 // Javascript months are zero-based
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTH', [byMonth])
				recurrenceRule.byMonth.push(byMonth)

				const byMonthDay = this.calendarObjectInstance.startDate.getDate()
				recurrenceRule.recurrenceRuleValue.setComponent('BYMONTHDAY', [byMonthDay])
				recurrenceRule.byMonthDay.push(byMonthDay)
			}
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 */
		enableRecurrenceLimitByUntil({
			recurrenceRule,
		}) {
			let until
			switch (recurrenceRule.frequency) {
			// Defaults to 7 days
				case 'DAILY':
					until = new Date(this.calendarObjectInstance.startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
					break

				// Defaults to 4 weeks
				case 'WEEKLY':
					until = new Date(this.calendarObjectInstance.startDate.getTime() + 4 * 7 * 24 * 60 * 60 * 1000)
					break

				// Defaults to 10 year
				case 'YEARLY':
					until = new Date(
						this.calendarObjectInstance.startDate.getFullYear() + 10,
						this.calendarObjectInstance.startDate.getMonth(),
						this.calendarObjectInstance.startDate.getDate(),
						23,
						59,
						59,
					)
					break

				// Defaults to 12 months
				case 'MONTHLY':
				default:
					until = new Date(
						this.calendarObjectInstance.startDate.getFullYear() + 1,
						this.calendarObjectInstance.startDate.getMonth(),
						this.calendarObjectInstance.startDate.getDate(),
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
				recurrenceRule,
				until,
			})
		},

		/**
		 *
		 * @param {object} data The destructuring object for data
		 * @param {object} data.recurrenceRule The recurrenceRule object to modify
		 * @param {number} data.count The new count to set
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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

				logger.debug(alarm.alarmComponent.toICALJs().toString())
			}
			this.updateAlarmAllDayParts({ alarm })
		},

		changeAlarmAmountAllDay({
			alarm,
			amount,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(
						amount,
						alarm.relativeHoursAllDay,
						alarm.relativeMinutesAllDay,
						alarm.relativeUnitAllDay,
					)

				alarm.relativeAmountAllDay = amount
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				logger.debug(alarm.alarmComponent.toICALJs().toString())
			}

			this.updateAlarmTimedParts({ alarm })
		},

		changeAlarmUnitAllDay({
			alarm,
			unit,
		}) {
			if (alarm.alarmComponent) {
				alarm.alarmComponent.trigger.value.totalSeconds
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(
						alarm.relativeAmountAllDay,
						alarm.relativeHoursAllDay,
						alarm.relativeMinutesAllDay,
						unit,
					)

				alarm.relativeUnitAllDay = unit
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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
					= getTotalSecondsFromAmountHourMinutesAndUnitForAllDayEvents(
						alarm.relativeAmountAllDay,
						hours,
						minutes,
						alarm.relativeUnitAllDay,
					)

				alarm.relativeHoursAllDay = hours
				alarm.relativeMinutesAllDay = minutes
				alarm.relativeTrigger = alarm.alarmComponent.trigger.value.totalSeconds

				logger.debug(alarm.alarmComponent.toICALJs().toString())
			}

			this.updateAlarmTimedParts({ alarm })
		},

		changeAlarmFromRelativeToAbsolute({
			alarm,
		}) {
			if (alarm.alarmComponent) {
				const triggerDateTime = this.calendarObjectInstance.eventComponent.startDate.clone()
				// The trigger of an alarm must be DATE-TIME, startDate can be either.
				triggerDateTime.isDate = false

				triggerDateTime.addDuration(alarm.alarmComponent.trigger.value)

				alarm.alarmComponent.setTriggerFromAbsolute(triggerDateTime)

				alarm.absoluteDate = getDateFromDateTimeValue(alarm.alarmComponent.trigger.value)
				alarm.absoluteTimezoneId = alarm.alarmComponent.trigger.value.timezoneId

				logger.debug(alarm.alarmComponent.toICALJs().toString())
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
			alarm,
		}) {
			if (alarm.alarmComponent) {
				const duration = alarm.alarmComponent.trigger.value
					.subtractDateWithTimezone(this.calendarObjectInstance.eventComponent.startDate)

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

		toggleAllDay() {
			const settingsStore = useSettingsStore()
			this.toggleAllDayMutation()

			if (!this.calendarObjectInstance.isAllDay) {
				if (this.calendarObjectInstance.startTimezoneId === 'floating') {
					const startTimezone = settingsStore.getResolvedTimezone
					this.changeStartTimezoneMutation({
						startTimezone,
					})
				}

				this.changeTimeToDefaultForTimedEvents()
			}
		},

		/**
		 * Updates the time of the new calendar object
		 *
		 * @param {object} data destructuring object
		 * @param {number} data.start Timestamp for start of new event
		 * @param {number} data.end Timestamp for end of new event
		 * @param {string} data.timezoneId asd
		 * @param {boolean} data.isAllDay foo
		 */
		updateTimeOfNewEvent({ start, end, timezoneId, isAllDay }) {
			const isDirty = this.calendarObjectInstance.eventComponent.isDirty()
			const startDate = new Date(start * 1000)
			const endDate = new Date(end * 1000)

			if (this.calendarObjectInstance.isAllDay !== isAllDay) {
				this.toggleAllDayMutation()
			}

			this.changeStartTimezone({
				startTimezone: timezoneId,
			})
			this.changeEndTimezone({
				endTimezone: timezoneId,
			})

			this.changeStartDateMutation({
				startDate,
			})

			if (isAllDay) {
				// The full-calendar end date is exclusive, but the end-date
				// that changeEndDate expects is inclusive, so we have to deduct one day.
				this.changeEndDateMutation({
					endDate: new Date(endDate.getTime() - 24 * 60 * 60 * 1000),
				})
			} else {
				this.changeEndDateMutation({
					endDate,
				})
			}

			if (!isDirty) {
				this.eventComponent.undirtify()
			}
		},
	},
})
