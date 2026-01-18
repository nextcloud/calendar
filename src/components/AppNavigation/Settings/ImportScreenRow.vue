<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="import-modal-file-item">
		<div class="import-modal-file-item__filename">
			<div>{{ file.name }}</div>
			<div
				v-if="disabledHint"
				class="import-modal-file-item__calendar-disabled-hint">
				{{ disabledHint }}
			</div>
		</div>
		<CalendarPicker
			class="import-modal-file-item__calendar-select"
			:value="calendar"
			:calendars="calendars"
			:isCalendarSelectable="isCalendarSelectable"
			@selectCalendar="selectCalendar" />
	</li>
</template>

<script>
import { getLanguage } from '@nextcloud/l10n'
import { mapStores } from 'pinia'
import CalendarPicker from '../../Shared/CalendarPicker.vue'
import useCalendarsStore from '../../../store/calendars.js'
import useImportFilesStore from '../../../store/importFiles.js'
import usePrincipalsStore from '../../../store/principals.js'
import { uidToHexColor } from '../../../utils/color.js'

export default {
	name: 'ImportScreenRow',
	components: {
		CalendarPicker,
	},

	props: {
		file: {
			type: Object,
			required: true,
		},
	},

	computed: {
		...mapStores(usePrincipalsStore, useImportFilesStore, useCalendarsStore),
		newCalendar() {
			return {
				id: 'new',
				displayName: this.$t('calendar', 'New calendar'),
				isSharedWithMe: false,
				color: uidToHexColor(this.$t('calendar', 'New calendar')),
				owner: this.principalsStore.getCurrentUserPrincipal.url,
			}
		},

		calendar() {
			const calendarId = this.importFilesStore.importCalendarRelation[this.file.id]
			if (calendarId === this.newCalendar.id) {
				return this.newCalendar
			}
			return this.calendarsStore.getCalendarById(calendarId)
		},

		calendars() {
			const existingCalendars = this.calendarsStore.sortedWritableCalendarsEvenWithoutSupportForEvents
			return [...existingCalendars, this.newCalendar]
		},

		/**
		 * Returns a hint explaining why some calendars cannot be selected.
		 *
		 * @return {string|undefined} A message, or undefined if all calendars can be selected.
		 */
		disabledHint() {
			const disalbedBecauseOfEvents = this.file.parser.containsVEvents() && this.calendars.some((calendar) => !calendar.supportsEvents)
			const disalbedBecauseOfTasks = this.file.parser.containsVTodos() && this.calendars.some((calendar) => !calendar.supportsTasks)
			const disalbedBecauseOfJournalEntries = this.file.parser.containsVJournals() && this.calendars.some((calendar) => !calendar.supportsJournals)

			const disablingTypes = []
			if (disalbedBecauseOfEvents) {
				disablingTypes.push(this.$t('calendar', 'events'))
			}
			if (disalbedBecauseOfTasks) {
				disablingTypes.push(this.$t('calendar', 'tasks'))
			}
			if (disalbedBecauseOfJournalEntries) {
				disablingTypes.push(this.$t('calendar', 'journal entries'))
			}

			if (disablingTypes.lenght === 0) {
				return undefined
			}

			const formatter = new Intl.ListFormat(getLanguage(), { type: 'conjunction' })
			const localizedTypes = formatter.format(disablingTypes)
			return this.$t('calendar', 'Some calendars are disabled because this file contains {types}.', { types: localizedTypes })
		},
	},

	created() {
		const preselectedCalendar = this.calendars.find((calendar) => this.isCalendarSelectable(calendar))
		if (!preselectedCalendar) {
			// If no other calendar is selectable, at least `this.newCalendar` should be selectable and be preselected.
			throw new Error('Encountered illegal state. At least one calendar that can be selected should exist.')
		}
		this.selectCalendar(preselectedCalendar)
	},

	methods: {
		isCalendarSelectable(calendar) {
			if (calendar.id === this.newCalendar.id) {
				return true
			}
			if (this.file.parser.containsVEvents() && !calendar.supportsEvents) {
				return false
			}
			if (this.file.parser.containsVTodos() && !calendar.supportsTasks) {
				return false
			}
			if (this.file.parser.containsVJournals() && !calendar.supportsJournals) {
				return false
			}
			return true
		},

		selectCalendar(newCalendar) {
			this.importFilesStore.setCalendarForFileId({
				fileId: this.file.id,
				calendarId: newCalendar.id,
			})
		},
	},
}
</script>
