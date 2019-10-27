<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<li class="import-modal-file-item">
		<div class="import-modal-file-item__filename">
			{{ file.name }}
		</div>
		<CalendarPicker class="import-modal-file-item__calendar-select"
			:calendar="calendar"
			:calendars="calendars"
			@selectCalendar="selectCalendar" />
	</li>
</template>

<script>
import CalendarPicker from '../../Shared/CalendarPicker.vue'
import { uidToHexColor } from '../../../utils/color.js'

export default {
	name: 'ImportScreenRow',
	components: {
		CalendarPicker
	},
	props: {
		file: {
			type: Object,
			required: true
		}
	},
	computed: {
		calendar() {
			let calendarId = this.$store.state.importFiles.importCalendarRelation[this.file.id]
			if (!calendarId) {
				this.setDefaultCalendarId()
				calendarId = this.$store.state.importFiles.importCalendarRelation[this.file.id]
			}

			if (calendarId === 'new') {
				return {
					id: 'new',
					displayName: this.$t('calendar', 'New calendar'),
					isSharedWithMe: false,
					color: uidToHexColor(this.$t('calendar', 'New calendar')),
					owner: this.$store.getters.getCurrentUserPrincipal.url
				}
			}

			return this.$store.getters.getCalendarById(calendarId)
		},
		calendars() {
			const calendars = this.$store.getters.sortedCalendarFilteredByComponents(
				this.file.parser.containsVEvents(),
				this.file.parser.containsVJournals(),
				this.file.parser.containsVTodos()
			)

			calendars.push({
				id: 'new',
				displayName: this.$t('calendar', 'New calendar'),
				isSharedWithMe: false,
				color: uidToHexColor(this.$t('calendar', 'New calendar')),
				owner: this.$store.getters.getCurrentUserPrincipal.url
			})

			return calendars
		}
	},
	methods: {
		selectCalendar(newCalendar) {
			this.$store.commit('setCalendarForFileId', {
				fileId: this.file.id,
				calendarId: newCalendar.id
			})
		},
		setDefaultCalendarId() {
			this.$store.commit('setCalendarForFileId', {
				fileId: this.file.id,
				calendarId: this.calendars[0].id
			})
		}
	}
}
</script>
