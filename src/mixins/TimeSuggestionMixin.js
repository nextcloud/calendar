/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getLanguage } from '@nextcloud/l10n'
import { parseNaturalLanguageTime } from '../services/naturalLanguageTimeParserService.js'

export default {
	data() {
		return {
			timeSuggestion: null,
		}
	},

	methods: {
		handleTitleUpdate(value) {
			this.updateTitle(value)
			const parsed = parseNaturalLanguageTime(
				value,
				this.calendarObjectInstance?.startDate ?? null,
				getLanguage(),
			)
			if (parsed) {
				const before = value.slice(0, parsed.matchedIndex)
				const after = value.slice(parsed.matchedIndex + parsed.matchedText.length)
				parsed.strippedTitle = (before + after).replace(/\s+/g, ' ').trim()
			}
			this.timeSuggestion = parsed
		},

		async applyTimeSuggestion() {
			const s = this.timeSuggestion
			if (!s || !this.calendarObjectInstance) {
				return
			}

			const base = new Date(this.calendarObjectInstance.startDate)

			switch (s.type) {
				case 'all-day':
					if (!this.isAllDay) {
						this.toggleAllDay()
					}
					break
				case 'time-range': {
					if (this.isAllDay) {
						this.toggleAllDay()
					}
					const start = new Date(base)
					start.setHours(s.startHour, s.startMinute, 0, 0)
					const end = new Date(base)
					end.setHours(s.endHour, s.endMinute, 0, 0)
					this.updateStartTime(start)
					this.updateEndTime(end)
					break
				}
				case 'time-only': {
					if (this.isAllDay) {
						this.toggleAllDay()
					}
					const start = new Date(base)
					start.setHours(s.startHour, s.startMinute, 0, 0)
					this.updateStartTime(start)
					break
				}
				case 'date-range': {
					if (!this.isAllDay) {
						this.toggleAllDay()
					}
					this.updateStartDate(new Date(s.startYear, s.startMonth - 1, s.startDay))
					this.updateEndDate(new Date(s.endYear, s.endMonth - 1, s.endDay))
					break
				}
				case 'date': {
					if (!this.isAllDay) {
						this.toggleAllDay()
					}
					const d = new Date(s.year, s.month - 1, s.day)
					this.updateStartDate(d)
					this.updateEndDate(d)
					break
				}
				case 'datetime': {
					if (this.isAllDay) {
						this.toggleAllDay()
					}
					const d = new Date(s.year, s.month - 1, s.day, s.startHour, s.startMinute, 0, 0)
					this.updateStartDate(d)
					this.updateStartTime(d)
					break
				}
			}

			// Clear suggestion first so Vue flushes that re-render, then update the
			// title in a separate tick so the NcTextField double-useModel chain
			// propagates the empty value cleanly to the DOM input.
			const strippedTitle = s.strippedTitle ?? ''
			this.timeSuggestion = null
			await this.$nextTick()
			this.updateTitle(strippedTitle)
		},

		dismissTimeSuggestion() {
			this.timeSuggestion = null
		},

		handleTitleAreaKeydown(event) {
			if (!this.timeSuggestion) {
				return
			}
			if (event.key === 'Enter') {
				event.preventDefault()
				this.applyTimeSuggestion()
			} else if (event.key === 'Escape') {
				event.stopPropagation()
				this.dismissTimeSuggestion()
			}
		},
	},
}
