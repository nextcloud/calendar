<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcFormBoxButton
		:label="$t('calendar', 'Attachments folder')"
		:description="attachmentsFolder"
		inverted-accent
		@click="selectCalendarFolder">
		<template #icon>
			<IconFolderOpen :size="20" />
		</template>
	</NcFormBoxButton>
</template>

<script>
import { getFilePickerBuilder, showError, showSuccess } from '@nextcloud/dialogs'
import { NcFormBoxButton } from '@nextcloud/vue'
import debounce from 'debounce'
import { mapState, mapStores } from 'pinia'
import IconFolderOpen from 'vue-material-design-icons/FolderOpenOutline.vue'
import useSettingsStore from '../../../store/settings.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'SettingsAttachmentsFolder',

	components: {
		NcFormBoxButton,
		IconFolderOpen,
	},

	computed: {
		...mapStores(useSettingsStore),
		...mapState(useSettingsStore, {
			attachmentsFolder: (store) => store.attachmentsFolder || '/',
		}),
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
