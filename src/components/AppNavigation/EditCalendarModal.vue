<!--
  - @copyright Copyright (c) 2022 Richard Steinmetz <richard@steinmetz.cloud>
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
	<NcModal v-if="!!editCalendarModal && calendar" size="normal" @close="saveAndClose">
		<div class="edit-calendar-modal">
			<h2>{{ $t('calendar', 'Edit calendar') }}</h2>

			<div class="edit-calendar-modal__name-and-color">
				<div class="edit-calendar-modal__name-and-color__color">
					<div v-if="loading"
						class="edit-calendar-modal__name-and-color__color__dot"
						:style="{'background-color': calendarColor}" />
					<NcColorPicker v-else v-model="calendarColor">
						<div class="edit-calendar-modal__name-and-color__color__dot"
							:style="{'background-color': calendarColor}" />
					</NcColorPicker>
				</div>

				<input v-model="calendarName"
					class="edit-calendar-modal__name-and-color__name"
					type="text"
					:disabled="loading"
					:placeholder="$t('calendar', 'Calendar name …')">
			</div>

			<template v-if="canBeShared">
				<h2 class="edit-calendar-modal__sharing-header">
					{{ $t('calendar', 'Share calendar') }}
				</h2>

				<div class="edit-calendar-modal__sharing">
					<SharingSearch :calendar="calendar" />
					<PublishCalendar :calendar="calendar" />
					<ShareItem v-for="sharee in calendar.shares"
						:key="sharee.uri"
						:sharee="sharee"
						:calendar="calendar" />
				</div>
			</template>
			<div class="edit-calendar-modal__actions">
				<NcButton @click="copyLink">
					<template #icon>
						<LinkVariantIcon :size="20" />
					</template>
					{{ $t('calendar', 'Copy private link') }}
				</NcButton>
				<NcButton :to="downloadUrl">
					<template #icon>
						<DownloadIcon :size="20" />
					</template>
					{{ $t('calendar', 'Export') }}
				</NcButton>
				<NcButton v-if="calendar.isSharedWithMe" type="error" @click="deleteCalendar">
					<template #icon>
						<CloseIcon :size="20" />
					</template>
					{{ $t('calendar', 'Unshare from me') }}
				</NcButton>
				<NcButton v-else type="error" @click="deleteCalendar">
					<template #icon>
						<DeleteIcon :size="20" />
					</template>
					{{ $t('calendar', 'Delete') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import NcModal from '@nextcloud/vue/dist/Components/NcModal.js'
import NcColorPicker from '@nextcloud/vue/dist/Components/NcColorPicker.js'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'
import PublishCalendar from './EditCalendarModal/PublishCalendar.vue'
import SharingSearch from './EditCalendarModal/SharingSearch.vue'
import ShareItem from './EditCalendarModal/ShareItem.vue'
import { mapGetters } from 'vuex'
import logger from '../../utils/logger.js'
import debounce from 'debounce'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import LinkVariantIcon from 'vue-material-design-icons/LinkVariant.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { generateRemoteUrl } from '@nextcloud/router'

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
		LinkVariantIcon,
		CloseIcon,
	},
	props: {
	},
	data() {
		return {
			loading: false,
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
		 * Whether to show the sharing section
		 *
		 * @return {boolean}
		 */
		canBeShared() {
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
		async calendarColor() {
			await this.saveColor()
		},
		async calendarName() {
			await this.saveName()
		},
		editCalendarModal(value) {
			if (!value) {
				return
			}

			this.calendarName = this.calendar.displayName
			this.calendarColor = this.calendar.color
		},
	},
	created() {
		// debounce.flush() only works if the functions are added here (or in data())
		this.saveColorDebounced = debounce(() => this.saveColor(), 1000)
		this.saveNameDebounced = debounce(() => this.saveName(), 1000)
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
			this.loading = true

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
			} finally {
				this.loading = false
			}
		},

		/**
		 * Save the calendar name.
		 */
		async saveName() {
			this.loading = true

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
			} finally {
				this.loading = false
			}
		},

		/**
		 * Save unsaved changes and close the modal.
		 *
		 * @return {Promise<void>}
		 */
		async saveAndClose() {
			await this.saveColorDebounced.flush()
			await this.saveNameDebounced.flush()
			this.closeModal()
		},

		/**
		 * Copies the private calendar link
		 * to be used with clients like Thunderbird
		 */
		async copyLink() {
			const rootUrl = generateRemoteUrl('dav')
			const url = new URL(this.calendar.url, rootUrl)

			try {
				await navigator.clipboard.writeText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			}
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
			::v-deep &__dot {
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

		button {
			flex: 1 auto;
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
