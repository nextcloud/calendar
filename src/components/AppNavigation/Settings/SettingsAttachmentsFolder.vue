<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="settings-fieldset-interior-item settings-fieldset-interior-item--folder">
		<label :for="inputId">
			{{ $t('calendar', 'Attachments folder') }}
		</label>
		<div class="form-group">
			<NcInputField
				:id="inputId"
				v-model="attachmentsFolder"
				type="text"
				:label-outside="true"
				@update:modelValue="debounceSaveAttachmentsFolder(attachmentsFolder)"
				@change="debounceSaveAttachmentsFolder(attachmentsFolder)"
				@click="selectCalendarFolder"
				@keyboard.enter="selectCalendarFolder" />
		</div>
	</div>
</template>

<script>
import { getFilePickerBuilder, showError, showSuccess } from '@nextcloud/dialogs'
import debounce from 'debounce'
import { mapState, mapStores } from 'pinia'
import NcInputField from '@nextcloud/vue/components/NcInputField'
import useSettingsStore from '../../../store/settings.js'
import logger from '../../../utils/logger.js'
import { randomId } from '../../../utils/randomId.js'

export default {
	name: 'SettingsAttachmentsFolder',
	components: {
		NcInputField,
	},

	computed: {
		...mapStores(useSettingsStore),
		...mapState(useSettingsStore, {
			attachmentsFolder: (store) => store.attachmentsFolder || '/',
		}),

		inputId() {
			return `input-${randomId()}`
		},
	},

	methods: {
		async selectCalendarFolder() {
			const picker = getFilePickerBuilder(t('calendar', 'Select the default location for attachments'))
				.setMultiSelect(false)
				.addButton({
					label: t('calendar', 'Pick'),
					type: 'primary',
					callback: (nodes) => logger.debug('Picked attachment folder', { nodes }),
				})
				.addMimeTypeFilter('httpd/unix-directory')
				.allowDirectories()
				.build()
			const path = await picker.pick()
			this.saveAttachmentsFolder(path)
		},

		debounceSaveAttachmentsFolder: debounce(function(...args) {
			this.saveAttachmentsFolder(...args)
		}, 300),

		saveAttachmentsFolder(path) {
			if (typeof path !== 'string' || path.trim() === '' || !path.startsWith('/')) {
				showError(t('calendar', 'Invalid location selected'))
				return
			}

			if (path.includes('//')) {
				path = path.replace(/\/\//gi, '/')
			}

			this.settingsStore.setAttachmentsFolder({ attachmentsFolder: path })
				.then(() => {
					showSuccess(this.$t('calendar', 'Attachments folder successfully saved.'))
				})
				.catch((error) => {
					console.error(error)
					showError(this.$t('calendar', 'Error on saving attachments folder.'))
				})
		},

	},
}
</script>
