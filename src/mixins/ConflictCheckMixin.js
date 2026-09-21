/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getParserManager } from '@nextcloud/calendar-js'
import { mapStores } from 'pinia'
import useCalendarsStore from '@/store/calendars.js'
import logger from '@/utils/logger.js'
import { wallClockToInstant } from '@/utils/wallClock.js'

/**
 * Wait this long after the last change to the date/time fields before asking
 * the server. The pickers emit on every keystroke and a check costs one CalDAV
 * round trip per calendar.
 */
const CONFLICT_CHECK_DEBOUNCE = 400

/**
 * List at most this many conflicts; the rest become a count.
 */
const CONFLICT_LIST_LIMIT = 3

/**
 * The editor briefly holds placeholder dates near the Unix epoch while the
 * event is being set up. Anything older than this is not a real event time.
 */
const PLAUSIBLE_AFTER = Date.UTC(2000, 0, 1)

/**
 * Warn the organiser when the event being edited overlaps something that is
 * already in their own calendars.
 *
 * "Busy" means the same here as it does in the Appointments booking flow: the
 * exclusions mirror `EventConflictFilter` on the server, so a cancelled event
 * is not a conflict and neither is one the user marked as free
 * (TRANSP:TRANSPARENT).
 */
export default {
	data() {
		return {
			conflictingEvents: [],
			conflictCheckRunning: false,
			conflictCheckTimer: null,
			// Guards against a slow earlier request overwriting a newer result.
			conflictCheckToken: 0,
		}
	},
	computed: {
		...mapStores(useCalendarsStore),

		/**
		 * The window to check, or null while the editor has nothing usable yet.
		 *
		 * @return {?{start: Date, end: Date}}
		 */
		conflictWindow() {
			// Read the REACTIVE editor dates, not the event component: the
			// component's calendar-js values are mutated in place, so a computed
			// that depends on them never invalidates and the warning keeps
			// showing yesterday's answer after the user changes the date.
			const timeZone = this.startTimezone ?? null
			const start = wallClockToInstant(this.startDate, timeZone)
			const end = wallClockToInstant(this.endDate, this.endTimezone ?? timeZone)
			if (!start || !end) {
				return null
			}
			const startTime = start.getTime()
			const endTime = end.getTime()
			// The editor passes through a placeholder before the real dates
			// land; an event in 1970 is that placeholder, not a booking.
			if (startTime < PLAUSIBLE_AFTER || endTime <= startTime) {
				return null
			}
			return { start, end }
		},

		/**
		 * A primitive that changes exactly when the window does.
		 *
		 * Watching `startDate`/`endDate` themselves does not work: the editor
		 * fills them in after the component is created, and a watcher on the
		 * Date objects does not fire for that.
		 *
		 * @return {?string}
		 */
		conflictWindowKey() {
			const window = this.conflictWindow
			if (!window || this.isAllDay) {
				return null
			}
			return `${window.start.getTime()}-${window.end.getTime()}`
		},

		hasConflicts() {
			return this.conflictingEvents.length > 0
		},

		conflictsToList() {
			return this.conflictingEvents.slice(0, CONFLICT_LIST_LIMIT)
		},

		additionalConflictCount() {
			return Math.max(0, this.conflictingEvents.length - CONFLICT_LIST_LIMIT)
		},
	},
	watch: {
		conflictWindowKey: {
			immediate: true,
			handler(key) {
				clearTimeout(this.conflictCheckTimer)
				if (key === null) {
					this.conflictingEvents = []
					return
				}
				this.conflictCheckTimer = setTimeout(() => {
					this.runConflictCheck()
				}, CONFLICT_CHECK_DEBOUNCE)
			},
		},
	},
	beforeUnmount() {
		clearTimeout(this.conflictCheckTimer)
	},
	methods: {
		async runConflictCheck() {
			const token = ++this.conflictCheckToken
			const window = this.conflictWindow

			// An all-day event overlaps everything that day by definition, so a
			// warning there would be noise rather than information.
			if (!window || this.isAllDay || this.isReadOnly) {
				this.conflictingEvents = []
				return
			}

			// ownSortedCalendars already drops read-only and shared-with-me.
			const calendars = this.calendarsStore.ownSortedCalendars
				.filter((calendar) => calendar.enabled)
			if (calendars.length === 0) {
				this.conflictingEvents = []
				return
			}

			this.conflictCheckRunning = true
			try {
				const results = await Promise.all(calendars.map((calendar) => this.findConflictsInCalendar(calendar, window.start, window.end)))
				if (token !== this.conflictCheckToken) {
					// A newer check has been started meanwhile.
					return
				}
				this.conflictingEvents = results.flat().sort((a, b) => a.start - b.start)
			} catch (error) {
				// The warning is a convenience. If the lookup fails, say nothing
				// rather than putting an error in front of the user.
				logger.warn('Could not check the calendar for conflicts', { error })
				if (token === this.conflictCheckToken) {
					this.conflictingEvents = []
				}
			} finally {
				if (token === this.conflictCheckToken) {
					this.conflictCheckRunning = false
				}
			}
		},

		/**
		 * @param {object} calendar Calendar to search
		 * @param {Date} start Start of the window
		 * @param {Date} end End of the window
		 * @return {Promise<object[]>} Conflicting events
		 */
		async findConflictsInCalendar(calendar, start, end) {
			const objects = await calendar.dav.findByTypeInTimeRange('VEVENT', start, end)
			const parserManager = getParserManager()
			const conflicts = []

			for (const dav of objects) {
				if (typeof dav.data !== 'string' || dav.data.trim() === '') {
					continue
				}

				let firstVObject
				try {
					const parser = parserManager.getParserForFileType('text/calendar')
					parser.parse(dav.data)
					const calendarComponent = parser.getItemIterator().next().value
					if (!calendarComponent) {
						continue
					}
					firstVObject = calendarComponent.getVObjectIterator().next().value
				} catch (error) {
					logger.debug('Skipping an event that could not be parsed', { error })
					continue
				}
				if (!firstVObject) {
					continue
				}

				// The event being edited does not conflict with itself.
				const ownUid = this.calendarObjectInstance?.eventComponent?.uid
				if (ownUid && firstVObject.uid === ownUid) {
					continue
				}
				// Same exclusions as the Appointments conflict filter.
				if (firstVObject.status === 'CANCELLED') {
					continue
				}
				if (firstVObject.timeTransparency === 'TRANSPARENT') {
					continue
				}

				conflicts.push({
					key: `${calendar.id}-${firstVObject.uid}`,
					title: firstVObject.title || this.$t('calendar', 'Untitled event'),
					start: firstVObject.startDate?.jsDate ?? start,
					end: firstVObject.endDate?.jsDate ?? end,
					calendarName: calendar.displayName,
				})
			}

			return conflicts
		},
	},
}
