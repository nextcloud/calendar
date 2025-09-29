/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import {
	dateFactory,
	getUnixTimestampFromDate,
} from './date.js'

/**
 * Gets the initial view
 *
 * @return {string}
 */
export function getInitialView() {
	try {
		return loadState('calendar', 'initial_view')
	} catch {
		return 'dayGridMonth'
	}
}

/**
 * Gets the preferred editor view
 *
 * @return {string} Either popover or full
 */
export function getPreferredEditorRoute() {
	let skipPopover
	try {
		skipPopover = loadState('calendar', 'skip_popover')
	} catch {
		skipPopover = false
	}

	// Don't show the popover if the window size is too small (less then its max width of 450 px + a bit)
	// The mobile breakpoint of the reworked modals is 1024 px / 2 so simply use that.
	if (window.innerWidth <= 1024 / 2) {
		skipPopover = true
	}

	return skipPopover
		? 'full'
		: 'popover'
}

/**
 * Gets the default start-date for a new event
 *
 * @return {string}
 */
export function getDefaultStartDateForNewEvent() {
	const start = dateFactory()
	start.setHours(start.getHours() + Math.ceil(start.getMinutes() / 60))
	start.setMinutes(0)

	return String(getUnixTimestampFromDate(start))
}

/**
 * Gets the default end-date for a new event
 *
 * @return {string}
 */
export function getDefaultEndDateForNewEvent() {
	// When we have a setting for default event duration,
	// this needs to be taken into consideration here
	const start = getDefaultStartDateForNewEvent()
	const end = new Date(Number(start) * 1000)
	end.setHours(end.getHours() + 1)

	return String(getUnixTimestampFromDate(end))
}

/**
 * Prefixes a desired route name based on the current route
 *
 * @param {string} currentRouteName The name of the current route
 * @param {string} toRouteName The name of the desired route
 * @return {string}
 */
export function getPrefixedRoute(currentRouteName, toRouteName) {
	if (currentRouteName.startsWith('Embed')) {
		return 'Embed' + toRouteName
	}

	if (currentRouteName.startsWith('Public')) {
		return 'Public' + toRouteName
	}

	return toRouteName
}

/**
 * Checks whether a routeName represents a public / embedded route
 *
 * @param {string} routeName Name of the route
 * @return {boolean}
 */
export function isPublicOrEmbeddedRoute(routeName) {
	return routeName.startsWith('Embed') || routeName.startsWith('Public')
}

/**
* This is executed before entering the Editor routes
*
* @param {object} to The route to navigate to
* @param {object} from The route coming from
* @param {Function} next Function to be called when ready to load the next view
*/
export async function beforeRouteEnter(to, from, next) {
	if (to.name === 'NewFullView' || to.name === 'NewPopoverView') {
		next(async (vm) => {
			vm.resetState()

			const isAllDay = (to.params.allDay === '1')
			const start = parseInt(to.params.dtstart, 10)
			const end = parseInt(to.params.dtend, 10)
			const timezoneId = vm.settingsStore.getResolvedTimezone

			try {
				await vm.loadingCalendars()
				await vm.calendarObjectInstanceStore.getCalendarObjectInstanceForNewEvent({ isAllDay, start, end, timezoneId })
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
		next(async (vm) => {
			vm.resetState()
			const objectId = to.params.object
			const recurrenceId = to.params.recurrenceId

			if (recurrenceId === 'next') {
				const closeToDate = dateFactory()
				// TODO: can we replace this by simply returning the new route since we are inside next()
				// Probably not though, because it's async
				try {
					await vm.loadingCalendars()
					const recurrenceId = await vm.calendarObjectInstanceStore.resolveClosestRecurrenceIdForCalendarObject({
						objectId, closeToDate,
					})
					const params = { ...vm.$route.params, recurrenceId }
					vm.$router.replace({ name: vm.$route.name, params })
				} catch (error) {
					console.debug(error)
					vm.isError = true
					vm.error = t('calendar', 'It might have been deleted, or there was a typo in a link')
					return // if we cannot resolve next to an actual recurrenceId, return here to avoid further processing.
				} finally {
					vm.isLoading = false
				}
			}

			try {
				await vm.loadingCalendars()
				await vm.calendarObjectInstanceStore.getCalendarObjectInstanceByObjectIdAndRecurrenceId({ objectId, recurrenceId })
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
}

/**
 * This function is called when the route changes. This can be caused by various actions:
 * - Change of selected time-range when creating new event
 * - Navigating through the calendar-view
 *
 * @param {object} to The route to navigate to
 * @param {object} from The route coming from
 * @param {Function} next Function to be called when ready to load the next view
 */
export async function beforeRouteUpdate(to, from, next) {
	// If we are in the New Event dialog, we want to update the selected time
	if (to.name === 'NewFullView' || to.name === 'NewPopoverView') {
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
		const timezoneId = this.settingsStore.getResolvedTimezone

		await this.loadingCalendars()
		await this.calendarObjectInstanceStore.updateCalendarObjectInstanceForNewEvent({ isAllDay, start, end, timezoneId })
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
			const recurrenceId = await this.calendarObjectInstanceStore.resolveClosestRecurrenceIdForCalendarObject({
				objectId, closeToDate,
			})
			const params = { ...this.$route.params, recurrenceId }
			next({ name: this.$route.name, params })
			return
		}

		try {
			await this.loadingCalendars()
			await this.calendarObjectInstanceStore.getCalendarObjectInstanceByObjectIdAndRecurrenceId({ objectId, recurrenceId })
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
}

/**
 * This route is called when the user leaves the editor
 *
 * @param {object} to The route to navigate to
 * @param {object} from The route coming from
 * @param {Function} next Function to be called when ready to load the next view
 */
export async function beforeRouteLeave(to, from, next) {
	// requiresActionOnRouteLeave is false when an action like deleting / saving / cancelling was already taken.
	// The responsibility of this method is to automatically save the event when the user clicks outside the editor
	if (!this.requiresActionOnRouteLeave) {
		next()
		return
	}

	try {
		if ((from.name !== 'NewPopoverView' || to.name !== 'EditPopoverView')
			&& (from.name !== 'NewPopoverView' || to.name !== 'EditFullView')) {
			await this.save()
		}
		next()
	} catch (error) {
		console.debug(error)
		next(false)
	}
}