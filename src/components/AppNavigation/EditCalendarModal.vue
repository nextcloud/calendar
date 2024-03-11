<!--
  - @copyright Copyright (c) 2022 Richard Steinmetz <richard@steinmetz.cloud>
  - @copyright Copyright (c) 2024 Informatyka Boguslawski sp. z o.o. sp.k., https://www.ib.pl/
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<NcModal v-if="!!editCalendarModal && calendar" size="normal" @close="closeModal">
		<div class="edit-calendar-modal">
			<h2>{{ $t('calendar', 'Edit calendar') }}</h2>

			<div class="edit-calendar-modal__name-and-color">
				<div class="edit-calendar-modal__name-and-color__color">
					<NcColorPicker v-model="calendarColor"
						:advanced-fields="true"
						@update:value="calendarColorChanged = true">
						<div class="edit-calendar-modal__name-and-color__color__dot"
							:style="{'background-color': calendarColor}" />
					</NcColorPicker>
				</div>

				<input v-model="calendarName"
					class="edit-calendar-modal__name-and-color__name"
					type="text"
					:placeholder="$t('calendar', 'Calendar name …')"
					@input="calendarNameChanged = true">
			</div>

			<template v-if="canBeShared">
				<h2 class="edit-calendar-modal__sharing-header">
					{{ $t('calendar', 'Share calendar') }}
				</h2>

				<div class="edit-calendar-modal__sharing">
					<SharingSearch :calendar="calendar" />
					<PublishCalendar v-if="canBePublished" :calendar="calendar" />
					<InternalLink :calendar="calendar" />
					<ShareItem v-for="sharee in calendar.shares"
						:key="sharee.uri"
						:sharee="sharee"
						:calendar="calendar" />
				</div>
			</template>
			<div class="edit-calendar-modal__actions">
				<NcButton v-if="calendar.isSharedWithMe" type="tertiary" @click="deleteCalendar">
					<template #icon>
						<CloseIcon :size="20" />
					</template>
					{{ $t('calendar', 'Unshare from me') }}
				</NcButton>
				<NcButton v-else type="tertiary" @click="deleteCalendar">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ $t('calendar', 'Delete') }}
				</NcButton>
				<NcButton type="tertiary" :href="downloadUrl">
					<template #icon>
						<DownloadIcon :size="20" />
					</template>
					{{ $t('calendar', 'Export') }}
				</NcButton>
				<NcButton type="secondary" @click="saveAndClose">
					<template #icon>
						<CheckIcon :size="20" />
					</template>
					{{ $t('calendar', 'Save') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import { NcModal, NcColorPicker, NcButton } from '@nextcloud/vue'
import PublishCalendar from './EditCalendarModal/PublishCalendar.vue'
import SharingSearch from './EditCalendarModal/SharingSearch.vue'
import ShareItem from './EditCalendarModal/ShareItem.vue'
import InternalLink from './EditCalendarModal/InternalLink.vue'
import { mapGetters } from 'vuex'
import logger from '../../utils/logger.js'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import { showError } from '@nextcloud/dialogs'

export default {
	name: 'EditCalendarModal',
	components: {
		NcModal,
		NcColorPicker,
		NcButton,
		PublishCalendar,
		SharingSearch,
		ShareItem,
		DeleteIcon,
		DownloadIcon,
		CloseIcon,
		CheckIcon,
		InternalLink,
	},
	data() {
		return {
			calendarColor: undefined,
			calendarColorChanged: false,
			calendarName: undefined,
			calendarNameChanged: false,
		}
	},
	computed: {
		...mapGetters(['editCalendarModal']),
		calendar() {
			const id = this.editCalendarModal?.calendarId
			if (!id) {
				return undefined
			}

			return this.$store.getters.getCalendarById(id)
		},

		/**
		 * Whether to show the publishing action.
		 *
		 * @return {boolean}
		 */
		canBePublished() {
			return this.calendar.canBePublished
		},

		/**
		 * Whether to show the sharing section
		 *
		 * @return {boolean}
		 */
		canBeShared() {
			// The backend falsely reports incoming editable shares as being shareable
			// Ref https://github.com/nextcloud/calendar/issues/5755
			if (this.calendar.isSharedWithMe) {
				return false
			}

			return this.calendar.canBeShared || this.calendar.canBePublished
		},

		/**
		 * Download url of the calendar
		 *
		 * @return {string}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},
	},
	watch: {
		editCalendarModal(value) {
			if (!value) {
				return
			}

			this.calendarName = this.calendar.displayName
			this.calendarColor = this.calendar.color
			this.calendarNameChanged = false
			this.calendarColorChanged = false
		},
	},
	methods: {
		/**
		 * Close the modal (without saving).
		 */
		closeModal() {
			this.$store.commit('hideEditCalendarModal')
		},

		/**
		 * Save the calendar color.
		 */
		async saveColor() {
			try {
				await this.$store.dispatch('changeCalendarColor', {
					calendar: this.calendar,
					newColor: this.calendarColor,
				})
			} catch (error) {
				logger.error('Failed to save calendar color', {
					calendar: this.calendar,
					newColor: this.calendarColor,
				})
				throw error
			}
		},

		/**
		 * Save the calendar name.
		 */
		async saveName() {
			try {
				await this.$store.dispatch('renameCalendar', {
					calendar: this.calendar,
					newName: this.calendarName,
				})
			} catch (error) {
				logger.error('Failed to save calendar name', {
					calendar: this.calendar,
					newName: this.calendarName,
				})
				throw error
			}
		},

		/**
		 * Save unsaved changes and close the modal.
		 *
		 * @return {Promise<void>}
		 */
		async saveAndClose() {
			try {
				if (this.calendarColorChanged) {
					await this.saveColor()
				}
				if (this.calendarNameChanged) {
					await this.saveName()
				}
			} catch (error) {
				showError(this.$t('calendar', 'Failed to save calendar name and color'))
			}

			this.closeModal()
		},

		/**
		 * Deletes or unshares the calendar
		 */
		deleteCalendar() {
			this.$store.dispatch('deleteCalendarAfterTimeout', {
				calendar: this.calendar,
			})
			this.closeModal()
		},
	},
}
</script>

<style lang="scss" scoped>
.edit-calendar-modal {
	padding: 20px;
	display: flex;
	flex-direction: column;

	&__name-and-color {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;

		&__color {
			&__dot {
				width: 24px;
				height: 24px;
				border-radius: 12px;
			}
		}

		&__name {
			flex: 1 auto;
		}
	}

	&__actions {
		display: flex;
		gap: 10px;
		margin-top: 10px;

		button:last-of-type {
			margin-left: auto;
		}
	}

	&__sharing-header {
		margin-top: 10px;
	}

	&__sharing {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
}
</style>
