<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal v-if="!!calendarsStore.editCalendarModal && calendar" size="normal" @close="closeModal">
		<div class="edit-calendar-modal">
			<h3 class="edit-calendar-modal__header">
				{{ $t('calendar', 'Edit calendar') }}
			</h3>

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
				<NcCheckboxRadioSwitch :checked.sync="isTransparent">
					{{ $t('calendar', 'Never show me as busy (set this calendar to transparent)') }}
				</NcCheckboxRadioSwitch>
			</template>
			<template v-if="canBeShared">
				<h3 class="edit-calendar-modal__sharing-header">
					{{ $t('calendar', 'Share calendar') }}
				</h3>

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
			<NcAppNavigationSpacer />
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
import { NcModal, NcColorPicker, NcButton, NcCheckboxRadioSwitch, NcAppNavigationSpacer } from '@nextcloud/vue'
import PublishCalendar from './EditCalendarModal/PublishCalendar.vue'
import SharingSearch from './EditCalendarModal/SharingSearch.vue'
import ShareItem from './EditCalendarModal/ShareItem.vue'
import InternalLink from './EditCalendarModal/InternalLink.vue'
import logger from '../../utils/logger.js'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import { showError } from '@nextcloud/dialogs'
import useCalendarsStore from '../../store/calendars.js'
import { mapStores } from 'pinia'

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
		NcAppNavigationSpacer,
		NcCheckboxRadioSwitch,
	},
	data() {
		return {
			calendarColor: undefined,
			calendarColorChanged: false,
			isTransparent: false,
			calendarName: undefined,
			calendarNameChanged: false,
		}
	},
	computed: {
		...mapStores(useCalendarsStore),
		calendar() {
			const id = this.calendarsStore.editCalendarModal?.calendarId
			if (!id) {
				return undefined
			}

			return this.calendarsStore.getCalendarById(id)
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
		calendar(calendar) {
			if (!calendar) {
				return
			}

			this.calendarName = calendar.displayName
			this.calendarColor = calendar.color
			this.calendarNameChanged = false
			this.calendarColorChanged = false
			this.isTransparent = calendar.transparency === 'transparent'
		},
	},
	methods: {
		/**
		 * Close the modal (without saving).
		 */
		closeModal() {
			this.calendarsStore.editCalendarModal = undefined
		},

		/**
		 * Save the calendar color.
		 */
		async saveColor() {
			try {
				await this.calendarsStore.changeCalendarColor({
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
		 * Save the calendar transparency.
		 */
		async saveTransparency() {
			try {
				await this.calendarsStore.changeCalendarTransparency({
					calendar: this.calendar,
					transparency: this.isTransparent ? 'transparent' : 'opaque',
				})
			} catch (error) {
				logger.error('Failed to save calendar transparency', {
					calendar: this.calendar,
					transparency: this.isTransparent ? 'transparent' : 'opaque',
				})
				throw error
			}
		},

		/**
		 * Save the calendar name.
		 */
		async saveName() {
			try {
				await this.calendarsStore.renameCalendar({
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
				await this.saveTransparency()
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
			this.calendarsStore.deleteCalendarAfterTimeout({
				calendar: this.calendar,
			})
			this.closeModal()
		},
	},
}
</script>

<style lang="scss">
.edit-calendar-modal {
	padding: 20px;
	display: flex;
	flex-direction: column;

	&__header {
		margin-top: 0;
	}

	&__header,
	&__sharing-header {
		// Same font size the header of NcDialog (no variable available a this point)
		font-size: 21px;
	}

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

	.checkbox-content {
		margin-left: 25px;
	}
}

.app-navigation-spacer {
	list-style-type: none;
}
</style>
