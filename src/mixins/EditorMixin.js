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
import rfcProps from '../models/rfcProps'
import logger from '../utils/logger.js'
import { mapEventComponentToCalendarObjectInstanceObject } from '../models/calendarObjectInstance.js'

/**
 * This is a mixin for the editor. It contains common Vue stuff, that is
 * required both in the popover as well as the sidebar.
 *
 * See inline for more documentation
 */
export default {
	data() {
		return {
			// The calendar object from the Vuex store
			calendarObject: null,
			// The event component representing the open event
			eventComponent: null,
			// The calendar object instance object derived from the eventComponent
			calendarObjectInstance: null,
			// Indicator whether or not the event is currently loading
			isLoading: true,
			// Stores error if any occurred
			error: false,
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
			isRecurrenceException: false
		}
	},
	computed: {
		// Did the event load without errors?
		displayDetails() {
			return !this.isLoading && !this.error
		},
		// Is the event read-only or read-write
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
		// List of all selectable calendars
		calendars() {
			if (this.isReadOnly && this.calendarObject) {
				return [
					this.$store.getters.getCalendarById(this.calendarObject.calendarId)
				]
			}

			return this.$store.getters.sortedCalendars
		},
		// Get the selected calendar as calendar-object
		selectedCalendar() {
			return this.$store.getters.getCalendarById(this.calendarId)
		},
		// Current timezone of the user
		currentUserTimezone() {
			return this.$store.getters.getResolvedTimezone
		},
		// Can you delete this event?
		canDelete() {
			if (!this.calendarObject) {
				return false
			}

			if (this.isReadOnly) {
				return false
			}

			return this.calendarObject.existsOnServer()
		},
		// Can you create recurrence-exceptions for this event?
		canCreateRecurrenceException() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.canCreateRecurrenceExceptions()
		},
		// List of all RFC props we can display
		rfcProps() {
			return rfcProps
		},
		// Download related properties
		hasDownloadURL() {
			if (!this.calendarObject) {
				return false
			}

			return this.calendarObject.existsOnServer()
		},
		downloadURL() {
			if (!this.calendarObject) {
				return null
			}

			if (!this.calendarObject.dav) {
				return null
			}

			return this.calendarObject.dav.url + '?export'
		},
		// Label for the update / save label
		updateLabel() {
			if (!this.calendarObject) {
				return ''
			}

			if (!this.calendarObject.dav) {
				return this.$t('calendar', 'Save')
			}

			return this.$t('calendar', 'Update')
		},
		isNew() {
			if (!this.calendarObject) {
				return true
			}

			if (!this.calendarObject.dav) {
				return true
			}

			return false
		},
		location() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.location
		},
		description() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.description
		},
		startDate() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.startDate
		},
		startTimezone() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.startTimezoneId
		},
		endDate() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.endDate
		},
		endTimezone() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.endTimezoneId
		},
		isAllDay() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.isAllDay
		},
		canModifyAllDay() {
			if (!this.calendarObjectInstance) {
				return false
			}

			return this.calendarObjectInstance.canModifyAllDay
		}
	},
	methods: {
		/**
		 * Changes the selected calendar
		 * Does not move the calendar-object yet, that's done in save
		 *
		 * @param {Object} selectedCalendar The new calendar selected by the user
		 */
		changeCalendar(selectedCalendar) {
			this.calendarId = selectedCalendar.id

			// If this is a new event that does not exist on the server yet,
			// override the internally stored calendarId. If we did not do this,
			// it would create the event in the default calendar first and move it
			// to the desired calendar as a second step.
			if (this.calendarObject && !this.calendarObject.existsOnServer()) {
				this.calendarObject.calendarId = selectedCalendar.id
			}
		},
		/**
		 * This will forge the user to update this and all future occurrences when saving
		 */
		forceModifyingFuture() {
			this.forceThisAndAllFuture = true
		},
		/**
		 * Closes the editor and returns to normal calendar-view
		 */
		closeEditor() {
			const name = 'CalendarView'
			const params = {
				view: this.$route.params.view,
				firstday: this.$route.params.firstDay
			}

			this.$router.push({ name, params })
		},
		/**
		 * Resets the calendar-object back to it's original state and closes the editor
		 */
		cancel() {
			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				this.closeEditor()
				return
			}

			this.calendarObject.resetToDav()
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		/**
		 * Saves a calendar-object
		 *
		 * @param {Boolean} thisAndAllFuture Whether to modify only this or this and all future occurrences
		 * @returns {Promise<void>}
		 */
		async save(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				return
			}
			if (this.isReadOnly) {
				return
			}

			const isNewEvent = this.calendarObject.id === 'new'

			if (this.forceThisAndAllFuture) {
				thisAndAllFuture = true
			}

			if (this.eventComponent.isDirty()) {
				let original, fork
				if (this.eventComponent.canCreateRecurrenceExceptions() && !isNewEvent) {
					[original, fork] = this.eventComponent.createRecurrenceException(thisAndAllFuture)
				}

				await this.$store.dispatch('updateCalendarObject', {
					calendarObject: this.calendarObject
				})

				if (!isNewEvent && thisAndAllFuture && original.root !== fork.root) {
					await this.$store.dispatch('createCalendarObjectFromFork', {
						eventComponent: fork,
						calendarId: this.calendarId
					})
				}
			}

			if (this.calendarId !== this.calendarObject.calendarId) {
				await this.$store.dispatch('moveCalendarObject', {
					calendarObject: this.calendarObject,
					newCalendarId: this.calendarId
				})
			}
		},
		/**
		 * Saves a calendar-object and closes the editor
		 *
		 * @param {Boolean} thisAndAllFuture Whether to modify only this or this and all future occurrences
		 * @returns {Promise<void>}
		 */
		async saveAndLeave(thisAndAllFuture = false) {
			await this.save(thisAndAllFuture)
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		/**
		 * Deletes a calendar-object
		 *
		 * @param {Boolean} thisAndAllFuture Whether to delete only this or this and all future occurrences
		 * @returns {Promise<void>}
		 */
		async delete(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				logger.error('Calendar-object not found')
				return
			}
			if (this.isReadOnly) {
				return
			}

			const isRecurrenceSetEmpty = this.eventComponent.removeThisOccurrence(thisAndAllFuture)
			if (isRecurrenceSetEmpty) {
				await this.$store.dispatch('deleteCalendarObject', {
					calendarObject: this.calendarObject
				})
			} else {
				await this.$store.dispatch('updateCalendarObject', {
					calendarObject: this.calendarObject
				})
			}
		},
		/**
		 * Deletes a calendar-object and closes the editor
		 *
		 * @param {Boolean} thisAndAllFuture Whether to delete only this or this and all future occurrences
		 * @returns {Promise<void>}
		 */
		async deleteAndLeave(thisAndAllFuture = false) {
			await this.delete(thisAndAllFuture)
			this.requiresActionOnRouteLeave = false
			this.closeEditor()
		},
		/**
		 * Updates the title of this event
		 *
		 * @param {String} title New title
		 */
		updateTitle(title) {
			this.$store.commit('changeTitle', {
				calendarObjectInstance: this.calendarObjectInstance,
				title
			})
		},
		/**
		 * Updates the description of this event
		 *
		 * @param {String} description New description
		 */
		updateDescription(description) {
			this.$store.commit('changeDescription', {
				calendarObjectInstance: this.calendarObjectInstance,
				description
			})
		},
		/**
		 * Updates the location of this event
		 *
		 * @param {String} location New location
		 */
		updateLocation(location) {
			this.$store.commit('changeLocation', {
				calendarObjectInstance: this.calendarObjectInstance,
				location
			})
		},
		/**
		 * Updates the start date of this event
		 *
		 * @param {Date} startDate New start date
		 */
		updateStartDate(startDate) {
			console.debug('updating start date ...', startDate)
			this.$store.commit('changeStartDate', {
				calendarObjectInstance: this.calendarObjectInstance,
				startDate
			})
		},
		/**
		 * Updates the timezone of this event's start date
		 *
		 * @param {String} startTimezone New start timezone
		 */
		updateStartTimezone(startTimezone) {
			if (!startTimezone) {
				return
			}

			this.$store.dispatch('changeStartTimezone', {
				calendarObjectInstance: this.calendarObjectInstance,
				startTimezone
			})
		},
		/**
		 * Updates the end date of this event
		 *
		 * @param {Date} endDate New end date
		 */
		updateEndDate(endDate) {
			console.debug('updating end date ...', endDate)
			this.$store.commit('changeEndDate', {
				calendarObjectInstance: this.calendarObjectInstance,
				endDate
			})
		},
		/**
		 * Updates the timezone of this event's end date
		 *
		 * @param {String} endTimezone New end timezone
		 */
		updateEndTimezone(endTimezone) {
			if (!endTimezone) {
				return
			}

			this.$store.dispatch('changeEndTimezone', {
				calendarObjectInstance: this.calendarObjectInstance,
				endTimezone
			})
		},
		/**
		 * Toggles the event between all-day and timed
		 */
		toggleAllDay() {
			this.$store.commit('toggleAllDay', {
				calendarObjectInstance: this.calendarObjectInstance
			})
		}
	},
	/**
	 * This is executed before entering the Editor routes
	 *
	 * @param {Object} to The route to navigate to
	 * @param {Object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	beforeRouteEnter(to, from, next) {
		if (to.name === 'NewSidebarView' || to.name === 'NewPopoverView') {
			next(vm => {
				vm.isLoading = true
				vm.error = false
				vm.calendarId = null
				vm.requiresActionOnRouteLeave = true
				vm.forceThisAndAllFuture = false

				const isAllDay = (to.params.allDay === '1')
				const start = to.params.dtstart
				const end = to.params.dtend
				const timezoneId = vm.$store.getters.getResolvedTimezone
				const recurrenceIdDate = new Date(start * 1000)

				vm.$store.dispatch('createNewEvent', { start, end, isAllDay, timezoneId })
					.then((calendarObject) => {
						vm.calendarObject = calendarObject
						vm.calendarId = calendarObject.calendarId
						vm.eventComponent = calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)
						vm.calendarObjectInstance = mapEventComponentToCalendarObjectInstanceObject(vm.eventComponent)

						vm.isLoading = false
					})
			})
		} else {
			next(vm => {
				vm.isLoading = true
				vm.error = false
				vm.calendarId = null
				vm.requiresActionOnRouteLeave = true
				vm.forceThisAndAllFuture = false

				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId
				const recurrenceIdDate = new Date(recurrenceId * 1000)

				vm.$store.dispatch('getEventByObjectId', { objectId })
					.then(() => {
						vm.calendarObject = vm.$store.getters.getCalendarObjectById(objectId)
						vm.calendarId = vm.calendarObject.calendarId
						vm.eventComponent = vm.calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)
						vm.calendarObjectInstance = mapEventComponentToCalendarObjectInstanceObject(vm.eventComponent)
						vm.isEditingMasterItem = vm.eventComponent.isMasterItem()
						vm.isRecurrenceException = vm.eventComponent.isRecurrenceException()

						vm.isLoading = false
					})
			})
		}
	},
	/**
	 * This function is called when the route changes. This can be caused by various actions:
	 * - Change of selected time-range when creating new event
	 * - Navigating through the calendar-view
	 *
	 * @param {Object} to The route to navigate to
	 * @param {Object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	beforeRouteUpdate(to, from, next) {
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

			this.$store.dispatch('updateTimeOfNewEvent', {
				calendarObject: this.calendarObject,
				start,
				end,
				isAllDay,
				timezoneId
			})

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

			this.save().then(() => {
				this.error = false
				this.calendarId = null
				this.requiresActionOnRouteLeave = true
				this.forceThisAndAllFuture = false

				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId

				this.$store.dispatch('getEventByObjectId', { objectId })
					.then(() => {
						this.calendarObject = this.$store.getters.getCalendarObjectById(objectId)
						this.calendarId = this.calendarObject.calendarId
						this.eventComponent = this.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))
						this.calendarObjectInstance = mapEventComponentToCalendarObjectInstanceObject(this.eventComponent)
						this.isEditingMasterItem = this.eventComponent.isMasterItem()
						this.isRecurrenceException = this.eventComponent.isRecurrenceException()

						this.isLoading = false
					})
				next()
			}).catch(() => {
				next(false)
			})
		}
	},
	/**
	 * This route is called when the user leaves the editor
	 *
	 * @param {Object} to The route to navigate to
	 * @param {Object} from The route coming from
	 * @param {Function} next Function to be called when ready to load the next view
	 */
	beforeRouteLeave(to, from, next) {
		// requiresActionOnRouteLeave is false when an action like deleting / saving / cancelling was already taken.
		// The responsibility of this method is to automatically save the event when the user clicks outside the editor
		if (!this.requiresActionOnRouteLeave) {
			next()
			return
		}

		this.save().then(() => {
			next()
		}).catch(() => {
			// TODO - show proper error message
			next(false)
		})
	}
}
