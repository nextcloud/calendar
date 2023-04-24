/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
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

import { getRFCProperties } from '../models/rfcProps.js'
import logger from '../utils/logger.js'
import { getIllustrationForTitle } from '../utils/illustration.js'
import { getPrefixedRoute } from '../utils/router.js'
import { dateFactory } from '../utils/date.js'
import { uidToHexColor } from '../utils/color.js'
import {
	mapGetters,
	mapState,
} from 'vuex'
import { translate as t } from '@nextcloud/l10n'
import { removeMailtoPrefix } from '../utils/attendee.js'
import { loadState } from '@nextcloud/initial-state'

/**
 * This is a mixin for the editor. It contains common Vue stuff, that is
 * required both in the popover as well as the sidebar.
 *
 * See inline for more documentation
 */
export default {
	data() {
		return {
			// Indicator whether or not the event is currently loading
			isLoading: true,
			// Indicator whether or not loading the event failed
			isError: false,
			// Error message in case there was an error
			error: null,
			// The calendar-id of the selected calendar
			calendarId: null,
			// Whether or not an action is required on leave
			requiresActionOnRouteLeave: true,
			// Whether or not the this and all future option will be forced
			// This is the case when editing the recurrence-rule of an existing recurring event
			forceThisAndAllFuture: false,
			// Whether or not the master item is being edited
			isEditingMasterItem: false,
			// Whether or not it is a recurrence-exception
			isRecurrenceException: false,
		}
	},
	computed: {
		...mapGetters({
			currentUserTimezone: 'getResolvedTimezone',
		}),
		...mapState({
			initialCalendarsLoaded: (state) => state.calendars.initialCalendarsLoaded,
			calendarObject: (state) => state.calendarObjectInstance.calendarObject,
			calendarObjectInstance: (state) => state.calendarObjectInstance.calendarObjectInstance,
		}),
		eventComponent() {
			return this.calendarObjectInstance?.eventComponent
		},
		/**
		 * Returns the events title or an empty string if the event is still loading
		 *
		 * @return {string}
		 */
		title() {
			return this.calendarObjectInstance?.title ?? ''
		},
		/**
		 * Returns the location or null if the event is still loading
		 *
		 * @return {string|null}
		 */
		location() {
			return this.calendarObjectInstance?.location ?? null
		},
		/**
		 * Returns the description or null if the event is still loading
		 *
		 * @return {string|null}
		 */
		description() {
			return this.calendarObjectInstance?.description ?? null
		},
		/**
		 * Returns the start-date (without timezone) or null if the event is still loading
		 *
		 * @return {Date|null}
		 */
		startDate() {
			return this.calendarObjectInstance?.startDate ?? null
		},
		/**
		 * Returns the timezone of the event's start-date or null if the event is still loading
		 *
		 * @return {string|null}
		 */
		startTimezone() {
			return this.calendarObjectInstance?.startTimezoneId ?? null
		},
		/**
		 * Returns the end-date (without timezone) or null if the event is still loading
		 *
		 * @return {Date|null}
		 */
		endDate() {
			return this.calendarObjectInstance?.endDate ?? null
		},
		/**
		 * Returns the timezone of the event's end-date or null if the event is still loading
		 *
		 * @return {string|null}
		 */
		endTimezone() {
			return this.calendarObjectInstance?.endTimezoneId ?? null
		},
		/**
		 * Returns whether or not the event is all-day or null if the event is still loading
		 *
		 * @return {boolean}
		 */
		isAllDay() {
			return this.calendarObjectInstance?.isAllDay ?? false
		},
		/**
		 * Returns whether or not the user is allowed to modify the all-day setting
		 *
		 * @return {boolean}
		 */
		canModifyAllDay() {
			return this.calendarObjectInstance?.canModifyAllDay ?? false
		},
		/**
		 * Returns an illustration matching this event's title
		 *
		 * @return {string}
		 */
		backgroundImage() {
			return getIllustrationForTitle(this.title)
		},
		/**
		 * Returns the color the illustration should be colored in
		 *
		 * @return {string}
		 */
		illustrationColor() {
			return this.color || this.selectedCalendarColor
		},
		/**
		 * Returns the color of the calendar selected by the user
		 * This is used to color illustration
		 *
		 * @return {string|*}
		 */
		selectedCalendarColor() {
			if (!this.selectedCalendar) {
				const calendars = this.$store.getters.sortedCalendars
				if (calendars.length > 0) {
					return calendars[0].color
				}

				return uidToHexColor('')
			}

			return this.selectedCalendar.color
		},
		/**
		 * Returns the custom color of this event
		 *
		 * @return {null | string}
		 */
		color() {
			return this.calendarObjectInstance?.customColor ?? null
		},
		/**
		 * Returns whether or not to display save buttons
		 *
		 * @return {boolean}
		 */
		showSaveButtons() {
			return this.isReadOnly === false
		},
		/**
		 * Returns whether or not to allow editing the event
		 *
		 * @return {boolean}
		 */
		isReadOnly() {
			if (!this.calendarObject) {
				return true
			}

			const calendar = this.$store.getters.getCalendarById(this.calendarObject.calendarId)
			if (!calendar) {
				return true
			}

			return calendar.readOnly
		},
		/**
		 * Returns whether the user is an attendee of the event
		 *
		 * @return {boolean}
		 */
		isViewedByAttendee() {
			return this.userAsAttendee !== null
		},
		/**
		 * Returns the attendee property corresponding to the current user
		 *
		 * @return {?object}
		 */
		userAsAttendee() {
			if (this.isReadOnly || !this.$store.getters.getCurrentUserPrincipalEmail || !this.calendarObjectInstance.organizer) {
				return null
			}

			const principal = removeMailtoPrefix(this.$store.getters.getCurrentUserPrincipalEmail)
			for (const attendee of this.calendarObjectInstance.attendees) {
				if (removeMailtoPrefix(attendee.uri) === principal) {
					return attendee
				}
			}

			return null
		},
		/**
		 * Returns all calendars selectable by the user
		 *
		 * @return {object[]}
		 */
		calendars() {
			if (this.isReadOnly && this.calendarObject) {
				return [
					this.$store.getters.getCalendarById(this.calendarObject.calendarId),
				]
			}

			return this.$store.getters.sortedCalendars
		},
		/**
		 * Returns the object of the selected calendar
		 *
		 * @return {object}
		 */
		selectedCalendar() {
			return this.$store.getters.getCalendarById(this.calendarId)
		},
		/**
		 * Returns whether or not to display the calendar-picker
		 *
		 * @return {boolean}
		 */
		showCalendarPicker() {
			// Always show the calendar's name when we are in a read-only calendar
			if (this.isReadOnly) {
				return true
			}

			return this.$store.getters.sortedCalendars.length > 1
		},
		/**
		 * Returns whether or not the user is allowed to delete this event
		 *
		 * @return {boolean}
		 */
		canDelete() {
			if (!this.calendarObject) {
				return false
			}
			if (this.isReadOnly) {
				return false
			}
			if (this.isLoading) {
				return false
			}

			return this.calendarObject.existsOnServer
		},
		/**
		 * Returns whether or not the user is allowed to create recurrence exceptions for this event
		 *
		 * @return {boolean}
		 */
		canCreateRecurrenceException() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.canCreateRecurrenceExceptions()
		},
		/**
		 * Returns a an object with properties from RFCs including
		 * their displayName, a description, options, etc.
		 *
		 * @return {{geo, color, timeTransparency, description, resources, location, categories, accessClass, priority, status}}
		 */
		rfcProps() {
			return getRFCProperties()
		},
		categoryOptions() {
			const categories = { ...this.rfcProps.categories }
			categories.options = loadState('calendar', 'categories')
			return categories
		},
		/**
		 * Returns whether or not this event can be downloaded from the server
		 *
		 * @return {boolean}
		 */
		hasDownloadURL() {
			if (!this.calendarObject) {
				return false
			}
			if (this.isLoading) {
				return false
			}

			return this.calendarObject.existsOnServer
		},
		/**
		 * Returns the download url as a string or null if event is loading or does not exist on the server (yet)
		 *
		 * @return {string|null}
		 */
		downloadURL() {
			if (!this.calendarObject) {
				return null
			}

			if (!this.calendarObject.dav) {
				return null
			}

			return this.calendarObject.dav.url + '?export'
		},
		/**
		 * Returns whether or not this is a new event
		 *
		 * @return {boolean}
		 */
		isNew() {
			if (!this.calendarObject) {
				return true
			}

			if (!this.calendarObject.dav) {
				return true
			}

			return false
		},
	},
	methods: {
		/**
		 * Changes the selected calendar
		 * Does not move the calendar-object yet, that's done in save
		 *
		 * @param {object} selectedCalendar The new calendar selected by the user
		 */
		changeCalendar(selectedCalendar) {
			this.calendarId = selectedCalendar.id

			// If this is a new event that does not exist on the server yet,
			// override the internally stored calendarId. If we did not do this,
			// it would create the event in the default calendar first and move it
			// to the desired calendar as a second step.
			if (this.calendarObject && !this.calendarObject.existsOnServer) {
				this.calendarObject.calendarId = selectedCalendar.id
			}
		},
		/**
		 * This will force the user to update this and all future occurrences when saving
		 */
		forceModifyingFuture() {
			this.forceThisAndAllFuture = true
		},
		/**
		 * Closes the editor and returns to normal calendar-view
		 */
		closeEditor() {
			const params = Object.assign({}, this.$store.state.route.params)
			delete params.object
			delete params.recurrenceId

			this.$router.push({
				name: getPrefixedRoute(this.$store.state.route.name, 'CalendarView'),
				params,
			})
			this.$store.commit('resetCalendarObjectInstanceObjectIdAndRecurrenceId')
		},
		/**
		 * Closes the editor and returns to normal calendar-view without running any action.
		 * This is useful if the calendar-object-instance has already been saved.
		 */
		closeEditorAndSkipAction() {
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		/**
		 * Resets the calendar-object back to it's original state and closes the editor
		 */
		async cancel() {
			if (this.isLoading) {
				return
			}

			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				this.closeEditor()
				return
			}

			this.$store.commit('resetCalendarObjectToDav', {
				calendarObject: this.calendarObject,
			})

			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		keyboardCloseEditor(event) {
			if (event.key === 'Escape') {
				this.cancel()
			}
		},
		keyboardSaveEvent(event) {
			if (event.key === 'Enter' && event.ctrlKey === true && !this.isReadOnly && !this.canCreateRecurrenceException) {
				this.saveAndLeave(false)
			}
		},
		keyboardDeleteEvent(event) {
			if (event.key === 'Delete' && event.ctrlKey === true && this.canDelete && !this.canCreateRecurrenceException) {
				this.deleteAndLeave(false)
			}
		},
		keyboardDuplicateEvent(event) {
			if (event.key === 'd' && event.ctrlKey === true) {
				event.preventDefault()
				if (!this.isNew && !this.isReadOnly && !this.canCreateRecurrenceException) {
					this.duplicateEvent()
				}
			}
		},
		/**
		 * Saves a calendar-object
		 *
		 * @param {boolean} thisAndAllFuture Whether to modify only this or this and all future occurrences
		 * @return {Promise<void>}
		 */
		async save(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				return
			}
			if (this.isReadOnly) {
				return
			}
			if (this.forceThisAndAllFuture) {
				thisAndAllFuture = true
			}

			this.isLoading = true
			await this.$store.dispatch('saveCalendarObjectInstance', {
				thisAndAllFuture,
				calendarId: this.calendarId,
			})
			this.isLoading = false
		},
		/**
		 * Saves a calendar-object and closes the editor
		 *
		 * @param {boolean} thisAndAllFuture Whether to modify only this or this and all future occurrences
		 * @return {Promise<void>}
		 */
		async saveAndLeave(thisAndAllFuture = false) {
			await this.save(thisAndAllFuture)
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},

		/**
		 * Duplicates a calendar-object and saves it
		 *
		 * @return {Promise<void>}
		 */
		async duplicateEvent() {
			await this.$store.dispatch('duplicateCalendarObjectInstance')
		},

		/**
		 * Deletes a calendar-object
		 *
		 * @param {boolean} thisAndAllFuture Whether to delete only this or this and all future occurrences
		 * @return {Promise<void>}
		 */
		async delete(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				return
			}
			if (this.isReadOnly) {
				return
			}

			this.isLoading = true
			await this.$store.dispatch('deleteCalendarObjectInstance', { thisAndAllFuture })
			this.isLoading = false
		},
		/**
		 * Deletes a calendar-object and closes the editor
		 *
		 * @param {boolean} thisAndAllFuture Whether to delete only this or this and all future occurrences
		 * @return {Promise<void>}
		 */
		async deleteAndLeave(thisAndAllFuture = false) {
			await this.delete(thisAndAllFuture)
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		/**
		 * Updates the title of this event
		 *
		 * @param {string} title New title
		 */
		updateTitle(title) {
			if (title.trim() === '') {
				title = null
			}

			this.$store.commit('changeTitle', {
				calendarObjectInstance: this.calendarObjectInstance,
				title,
			})
		},
		/**
		 * Updates the description of this event
		 *
		 * @param {string} description New description
		 */
		updateDescription(description) {
			this.$store.commit('changeDescription', {
				calendarObjectInstance: this.calendarObjectInstance,
				description,
			})
		},
		/**
		 * Updates the location of this event
		 *
		 * @param {string} location New location
		 */
		updateLocation(location) {
			this.$store.commit('changeLocation', {
				calendarObjectInstance: this.calendarObjectInstance,
				location,
			})
		},
		/**
		 * Updates the start date of this event
		 *
		 * @param {Date} startDate New start date
		 */
		updateStartDate(startDate) {
			this.$store.dispatch('changeStartDate', {
				calendarObjectInstance: this.calendarObjectInstance,
				startDate,
			})
		},
		/**
		 * Updates the timezone of this event's start date
		 *
		 * @param {string} startTimezone New start timezone
		 */
		updateStartTimezone(startTimezone) {
			if (!startTimezone) {
				return
			}

			this.$store.dispatch('changeStartTimezone', {
				calendarObjectInstance: this.calendarObjectInstance,
				startTimezone,
			})
		},
		/**
		 * Updates the end date of this event
		 *
		 * @param {Date} endDate New end date
		 */
		updateEndDate(endDate) {
			this.$store.commit('changeEndDate', {
				calendarObjectInstance: this.calendarObjectInstance,
				endDate,
			})
		},
		/**
		 * Updates the timezone of this event's end date
		 *
		 * @param {string} endTimezone New end timezone
		 */
		updateEndTimezone(endTimezone) {
			if (!endTimezone) {
				return
			}

			this.$store.dispatch('changeEndTimezone', {
				calendarObjectInstance: this.calendarObjectInstance,
				endTimezone,
			})
		},
		/**
		 * Toggles the event between all-day and timed
		 */
		toggleAllDay() {
			this.$store.dispatch('toggleAllDay', {
				calendarObjectInstance: this.calendarObjectInstance,
			})
		},
		/**
		 * Resets the internal state after changing the viewed calendar-object
		 */
		resetState() {
			this.isLoading = true
			this.isError = false
			this.error = null
			this.calendarId = null
			this.requiresActionOnRouteLeave = true
			this.forceThisAndAllFuture = false
			this.isEditingMasterItem = false
			this.isRecurrenceException = false
		},
		/**
		 * This function returns a promise that resolves
		 * once the calendars were fetched from the server
		 *
		 * @return {Promise<void>}
		 */
		loadingCalendars() {
			if (this.initialCalendarsLoaded) {
				return Promise.resolve()
			}

			return new Promise((resolve) => {
				const watcher = this.$watch('initialCalendarsLoaded', () => {
					resolve()
					watcher()
				})
			})
		},
	},
	/**
	 * This is executed before entering the Editor routes
	 *
	 * @param {object} to The route to navigate to
	 * @param {object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	async beforeRouteEnter(to, from, next) {
		if (to.name === 'NewSidebarView' || to.name === 'NewPopoverView') {
			next(async vm => {
				vm.resetState()

				const isAllDay = (to.params.allDay === '1')
				const start = parseInt(to.params.dtstart, 10)
				const end = parseInt(to.params.dtend, 10)
				const timezoneId = vm.$store.getters.getResolvedTimezone

				try {
					await vm.loadingCalendars()
					await vm.$store.dispatch('getCalendarObjectInstanceForNewEvent', { isAllDay, start, end, timezoneId })
					vm.calendarId = vm.calendarObject.calendarId
				} catch (error) {
					console.debug(error)
					vm.isError = true
					vm.error = t('calendar', 'It might have been deleted, or there was a typo in a link')
				} finally {
					vm.isLoading = false
				}
			})
		} else {
			next(async vm => {
				vm.resetState()
				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId

				if (recurrenceId === 'next') {
					const closeToDate = dateFactory()
					// TODO: can we replace this by simply returning the new route since we are inside next()
					// Probably not though, because it's async
					await vm.loadingCalendars()
					const recurrenceId = await vm.$store.dispatch('resolveClosestRecurrenceIdForCalendarObject', { objectId, closeToDate })
					const params = Object.assign({}, vm.$route.params, { recurrenceId })
					vm.$router.replace({ name: vm.$route.name, params })
				}

				try {
					await vm.loadingCalendars()
					await vm.$store.dispatch('getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId, recurrenceId })
					vm.calendarId = vm.calendarObject.calendarId
					vm.isEditingMasterItem = vm.eventComponent.isMasterItem()
					vm.isRecurrenceException = vm.eventComponent.isRecurrenceException()
				} catch (error) {
					console.debug(error)
					vm.isError = true
					vm.error = t('calendar', 'It might have been deleted, or there was a typo in a link')
				} finally {
					vm.isLoading = false
				}
			})
		}
	},
	/**
	 * This function is called when the route changes. This can be caused by various actions:
	 * - Change of selected time-range when creating new event
	 * - Navigating through the calendar-view
	 *
	 * @param {object} to The route to navigate to
	 * @param {object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	async beforeRouteUpdate(to, from, next) {
		// If we are in the New Event dialog, we want to update the selected time
		if (to.name === 'NewSidebarView' || to.name === 'NewPopoverView') {
			// If allDay, dtstart and dtend are the same there is no need to update.
			// This is usally the case when navigating through the calendar while the editor is open
			if (to.params.allDay === from.params.allDay
				&& to.params.dtstart === from.params.dtstart
				&& to.params.dtend === from.params.dtend) {
				next()
				return
			}

			const isAllDay = (to.params.allDay === '1')
			const start = to.params.dtstart
			const end = to.params.dtend
			const timezoneId = this.$store.getters.getResolvedTimezone

			await this.loadingCalendars()
			await this.$store.dispatch('updateCalendarObjectInstanceForNewEvent', { isAllDay, start, end, timezoneId })
			next()
		} else {
			// If both the objectId and recurrenceId remained the same
			// there is no need to update. This is usally the case when navigating
			// through the calendar while the editor is open
			if (to.params.object === from.params.object
				&& to.params.recurrenceId === from.params.recurrenceId) {
				next()
				return
			}

			this.isLoading = true

			try {
				await this.save()
			} catch (error) {
				console.debug(error)
				next(false)
				return
			}

			this.resetState()
			const objectId = to.params.object
			const recurrenceId = to.params.recurrenceId
			if (recurrenceId === 'next') {
				const closeToDate = dateFactory()
				await this.loadingCalendars()
				const recurrenceId = await this.$store.dispatch('resolveClosestRecurrenceIdForCalendarObject', { objectId, closeToDate })
				const params = Object.assign({}, this.$route.params, { recurrenceId })
				next({ name: this.$route.name, params })
				return
			}

			try {
				await this.loadingCalendars()
				await this.$store.dispatch('getCalendarObjectInstanceByObjectIdAndRecurrenceId', { objectId, recurrenceId })
				this.calendarId = this.calendarObject.calendarId
				this.isEditingMasterItem = this.eventComponent.isMasterItem()
				this.isRecurrenceException = this.eventComponent.isRecurrenceException()
			} catch (error) {
				console.debug(error)
				this.isError = true
				this.error = t('calendar', 'It might have been deleted, or there was a typo in the link')
			} finally {
				this.isLoading = false
				next()
			}
		}
	},
	/**
	 * This route is called when the user leaves the editor
	 *
	 * @param {object} to The route to navigate to
	 * @param {object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	async beforeRouteLeave(to, from, next) {
		// requiresActionOnRouteLeave is false when an action like deleting / saving / cancelling was already taken.
		// The responsibility of this method is to automatically save the event when the user clicks outside the editor
		if (!this.requiresActionOnRouteLeave) {
			next()
			return
		}

		try {
			if ((from.name !== 'NewPopoverView' || to.name !== 'EditPopoverView')
			&& (from.name !== 'NewPopoverView' || to.name !== 'EditSideBarView')) {
				await this.save()
			}
			next()
		} catch (error) {
			console.debug(error)
			next(false)
		}
	},
}
