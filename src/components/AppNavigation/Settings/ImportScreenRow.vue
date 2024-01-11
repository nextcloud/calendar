<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="import-modal-file-item">
		<div class="import-modal-file-item__filename">
			{{ file.name }}
		</div>
		<CalendarPicker class="import-modal-file-item__calendar-select"
			:value="calendar"
			:calendars="calendars"
			@select-calendar="selectCalendar" />
	</li>
</template>

<script>
import CalendarPicker from '../../Shared/CalendarPicker.vue'
import { uidToHexColor } from '../../../utils/color.js'
import usePrincipalsStore from '../../../store/principals.js'
import useImportFilesStore from '../../../store/importFiles.js'
import useCalendarsStore from '../../../store/calendars.js'
import { mapStores } from 'pinia'

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
		calendar() {
			let calendarId = this.importFilesStore.importCalendarRelation[this.file.id]
			if (!calendarId) {
				this.setDefaultCalendarId()
				calendarId = this.importFilesStore.importCalendarRelation[this.file.id]
			}

			if (calendarId === 'new') {
				return {
					id: 'new',
					displayName: this.$t('calendar', 'New calendar'),
					isSharedWithMe: false,
					color: uidToHexColor(this.$t('calendar', 'New calendar')),
					owner: this.principalsStore.getCurrentUserPrincipal.url,
				}
			}

			return this.calendarsStore.getCalendarById(calendarId)
		},
		calendars() {
			// TODO: remove once the false positive is fixed upstream
			// eslint-disable-next-line vue/no-side-effects-in-computed-properties
			const calendars = this.calendarsStore.sortedCalendarFilteredByComponents(
				this.file.parser.containsVEvents(),
				this.file.parser.containsVJournals(),
				this.file.parser.containsVTodos(),
			)

			calendars.push({
				id: 'new',
				displayName: this.$t('calendar', 'New calendar'),
				isSharedWithMe: false,
				color: uidToHexColor(this.$t('calendar', 'New calendar')),
				owner: this.principalsStore.getCurrentUserPrincipal.url,
			})

			return calendars
		},
	},
	methods: {
		selectCalendar(newCalendar) {
			this.importFilesStore.setCalendarForFileId({
				fileId: this.file.id,
				calendarId: newCalendar.id,
			})
		},
		setDefaultCalendarId() {
			this.importFilesStore.setCalendarForFileId({
				fileId: this.file.id,
				calendarId: this.calendars[0].id,
			})
		},
	},
}
</script>
