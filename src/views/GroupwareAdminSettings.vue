<!--
 - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 - SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<template>
	<NcSettingsSection :name="t('calendar', 'Calendar')"
		class="groupware-admin-settings">
		<NcCheckboxRadioSwitch :checked="createExampleEvent"
			:disabled="savingConfig"
			type="switch"
			@update:model-value="updateCreateExampleEvent">
			{{ t('calendar', 'Create default event when a user logs in for the first time') }}
		</NcCheckboxRadioSwitch>
		<em>
			{{ t('calendar', 'The example event serves as a showcase of the features of Nextcloud Calendar. A default example event is shipped with Nextcloud. You can replace the default event with a custom event by uploading an ICS file below.') }}
		</em>
		<div class="groupware-admin-settings__buttons">
			<NcButton v-if="createExampleEvent"
				@click="showImportModal = true">
				<template #icon>
					<IconUpload :size="20" />
				</template>
				{{ t('calendar', 'Import calendar event') }}
			</NcButton>
			<NcButton v-if="hasCustomEvent"
				:disabled="deleting"
				type="error"
				@click="deleteCustomEvent">
				<template #icon>
					<IconDelete :size="20" />
				</template>
				{{ t('calendar', 'Restore default event') }}
			</NcButton>
		</div>
		<NcDialog :open.sync="showImportModal"
			:name="t('calendar', 'Import calendar event')">
			<div class="import-event-modal">
				<p>
					{{ t('calendar', 'Uploading a new event will overwrite the existing one.') }}
				</p>
				<input ref="event-file"
					:disabled="uploading"
					type="file"
					accept=".ics,text/calendar"
					class="import-event-modal__file-picker"
					@change="selectFile" />
				<div class="import-event-modal__buttons">
					<NcButton :disabled="uploading || !selectedFile"
						type="primary"
						@click="uploadCustomEvent()">
						<template #icon>
							<IconUpload :size="20" />
						</template>
						{{ t('calendar', 'Upload event') }}
					</NcButton>
				</div>
			</div>
		</NcDialog>
	</NcSettingsSection>
</template>

<script>
import {
	NcSettingsSection,
	NcCheckboxRadioSwitch,
	NcDialog,
	NcButton,
} from '@nextcloud/vue'
import { loadState } from '@nextcloud/initial-state'
import IconUpload from 'vue-material-design-icons/Upload.vue'
import IconDelete from 'vue-material-design-icons/Delete.vue'
import * as ExampleEventService from '../services/exampleEventService.js'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { getParserManager } from '@nextcloud/calendar-js'
import logger from '../utils/logger.js'

export default {
	name: 'GroupwareAdminSettings',
	components: {
		NcSettingsSection,
		NcCheckboxRadioSwitch,
		NcButton,
		NcDialog,
		IconUpload,
		IconDelete,
	},
	data() {
		return {
			createExampleEvent: loadState('calendar', 'create_example_event', false),
			hasCustomEvent: loadState('calendar', 'has_custom_example_event', false),
			showImportModal: false,
			uploading: false,
			deleting: false,
			savingConfig: false,
			selectedFile: undefined,
		}
	},
	methods: {
		selectFile() {
			this.selectedFile = this.$refs['event-file']?.files[0]
		},
		async updateCreateExampleEvent() {
			this.savingConfig = true

			const enable = !this.createExampleEvent
			try {
				await ExampleEventService.setCreateExampleEvent(enable)
			} catch (error) {
				showError(t('calendar', 'Failed to save example event creation setting'))
				logger.error('Failed to save example event creation setting', {
					error,
					enable,
				})
			} finally {
				this.savingConfig = false
			}

			this.createExampleEvent = enable
		},
		uploadCustomEvent() {
			if (!this.selectedFile) {
				return
			}

			this.uploading = true

			const reader = new FileReader()
			reader.addEventListener('load', async () => {
				const ics = reader.result

				// Parse and validate event first
				try {
					const parser = getParserManager().getParserForFileType('text/calendar')
					parser.parse(ics)
					const calendarComponent = parser.getAllItems()[0]
					if (!calendarComponent || calendarComponent.name !== 'VCALENDAR') {
						throw new Error('ICS does not contain a top-level VCALENDAR component')
					}

					const eventComponent = calendarComponent.getFirstComponent('VEVENT')
					if (!eventComponent) {
						throw new Error('ICS does not contain a VEVENT component')
					}
				} catch (error) {
					showError(t('calendar', 'The selected ICS file is not valid'))
					logger.error('Failed to parse and validate example ICS', {
						error,
						ics,
					})
					return
				} finally {
					this.uploading = false
				}

				// Then upload it
				try {
					await ExampleEventService.uploadExampleEvent(ics)
				} catch (error) {
					showError(t('calendar', 'Failed to upload the example event'))
					logger.error('Failed to upload example ICS', {
						error,
						ics,
					})
					return
				} finally {
					this.uploading = false
				}

				showSuccess(t('calendar', 'Custom example event was saved successfully'))
				this.showImportModal = false
				this.hasCustomEvent = true
			})
			reader.readAsText(this.selectedFile)
		},
		async deleteCustomEvent() {
			this.deleting = true

			try {
				await ExampleEventService.deleteExampleEvent()
			} catch (error) {
				showError(t('calendar', 'Failed to delete the custom example event'))
				logger.error('Failed to delete the custom example event', {
					error,
				})
				return
			} finally {
				this.deleting = false
			}

			showSuccess(t('calendar', 'Custom example event was deleted successfully'))
			this.hasCustomEvent = false
		},
	},
}
</script>

<style lang="scss" scoped>
.groupware-admin-settings {
	&__buttons {
		display: flex;
		gap: calc(var(--default-grid-baseline) * 2);
		margin-top: calc(var(--default-grid-baseline) * 2);
	}
}

.import-event-modal {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	padding: calc(var(--default-grid-baseline) * 2);

	&__file-picker {
		width: 100%;
	}

	&__buttons {
		display: flex;
		justify-content: flex-end;
	}
}
</style>
