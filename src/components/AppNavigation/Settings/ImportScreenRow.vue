<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="import-modal-file-item">
		<NcFormGroup :label="$t('calendar', 'Calendar to import into')" :description="disabledHint">
			<NcFormBox v-slot="{ itemClass }">
				<NcFormBoxCopyButton :class="itemClass" :label="$t('calendar', 'File')" :value="file.name" />
			</NcFormBox>
			<NcFormBox v-slot="{ itemClass }">
				<CalendarPicker
					:class="itemClass"
					:value="calendar"
					:calendars="calendars"
					:isCalendarSelectable="isCalendarSelectable"
					@selectCalendar="selectCalendar" />
			</NcFormBox>
		</NcFormGroup>
		<NcFormGroup :label="$t('calendar', 'Import options')">
			<NcFormBox v-slot="{ itemClass }">
				<div class="import-modal-file-item__format" :class="itemClass">
					<label :for="formatInputId" class="import-modal-file-item__format-label">
						{{ $t('calendar', 'File format') }}
					</label>
					<NcSelect
						v-model="selectedFormat"
						:inputId="formatInputId"
						:options="formatOptions"
						:allowEmpty="false"
						:clearable="false"
						label="label" />
				</div>
			</NcFormBox>
			<NcFormBox v-slot="{ itemClass }">
				<NcFormBoxSwitch
					:class="itemClass"
					:modelValue="supersede"
					:label="$t('calendar', 'Overwrite existing events')"
					:description="$t('calendar', 'Replace events in the calendar that match the imported ones instead of skipping them.')"
					@update:modelValue="setSupersede" />
			</NcFormBox>
		</NcFormGroup>
	</li>
</template>

<script>
import { getLanguage } from '@nextcloud/l10n'
import { NcFormBox, NcFormBoxCopyButton, NcFormBoxSwitch, NcFormGroup, NcSelect } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import CalendarPicker from '../../Shared/CalendarPicker.vue'
import useCalendarsStore from '../../../store/calendars.js'
import useImportStore from '../../../store/import.ts'
import usePrincipalsStore from '../../../store/principals.js'
import { uidToHexColor } from '../../../utils/color.js'

export default {
	name: 'ImportScreenRow',
	components: {
		CalendarPicker,
		NcFormBox,
		NcFormBoxCopyButton,
		NcFormBoxSwitch,
		NcFormGroup,
		NcSelect,
	},

	props: {
		entry: {
			type: Object,
			required: true,
		},
	},

	computed: {
		...mapStores(usePrincipalsStore, useImportStore, useCalendarsStore),

		file() {
			return this.entry.file
		},

		formatInputId() {
			return `import-format-${this.file.id}`
		},

		formatOptions() {
			return [{
				id: 'ical',
				label: this.$t('calendar', 'iCalendar (.ics)'),
			}, {
				id: 'jcal',
				label: this.$t('calendar', 'jCal (.json)'),
			}, {
				id: 'xcal',
				label: this.$t('calendar', 'xCal (.xml)'),
			}]
		},

		selectedFormat: {
			get() {
				const format = this.entry.options.format
				return this.formatOptions.find((option) => option.id === format) ?? this.formatOptions[0]
			},

			set(option) {
				if (!option) {
					return
				}
				this.importStore.setOptionsForFile({
					fileId: this.file.id,
					options: { format: option.id },
				})
			},
		},

		supersede() {
			return this.entry.options.supersede
		},

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
			const calendarId = this.entry.calendarId
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
			this.importStore.setCalendarForFile({
				fileId: this.file.id,
				calendarId: newCalendar.id,
			})
		},

		setSupersede(supersede) {
			this.importStore.setOptionsForFile({
				fileId: this.file.id,
				options: { supersede },
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.import-modal-file-item__format {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding: 8px 12px;

	&-label {
		font-weight: bold;
	}
}
</style>
