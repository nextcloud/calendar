<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li class="settings-fieldset-interior-item settings-fieldset-interior-item--folder">
		<label :for="inputId">
			{{ $t('calendar', 'Default attachments location') }}
		</label>
		<div class="form-group">
			<NcInputField :id="inputId"
				v-model="attachmentsFolder"
				type="text"
				:label-outside="true"
				@input="debounceSaveAttachmentsFolder(attachmentsFolder)"
				@change="debounceSaveAttachmentsFolder(attachmentsFolder)"
				@click="selectCalendarFolder"
				@keyboard.enter="selectCalendarFolder" />
		</div>
	</li>
</template>

<script>
/* eslint-disable-next-line n/no-missing-import */
import NcInputField from '@nextcloud/vue/dist/Components/NcInputField.js'
import debounce from 'debounce'
import { getFilePickerBuilder, showError, showSuccess } from '@nextcloud/dialogs'
import { randomId } from '../../../utils/randomId.js'
import useSettingsStore from '../../../store/settings.js'
import { mapStores, mapState } from 'pinia'
import logger from '../../../utils/logger.js'

export default {
	name: 'SettingsAttachmentsFolder',
	components: {
		NcInputField,
	},
	computed: {
		...mapStores(useSettingsStore),
		...mapState(useSettingsStore, {
			attachmentsFolder: store => store.attachmentsFolder || '/',
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

<style scoped>

</style>
