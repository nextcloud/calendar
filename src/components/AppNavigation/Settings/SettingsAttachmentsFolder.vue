<!--
  - @copyright Copyright (c) 2022 Mikhail Sazanov <m@sazanof.ru>
  - @author Mikhail Sazanov <m@sazanof.ru>
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
	<li class="settings-fieldset-interior-item settings-fieldset-interior-item--folder">
		<label for="attachmentsFolder">
			{{ $t('calendar', 'Default attachments location') }}
		</label>
		<div class="form-group">
			<NcInputField v-model="attachmentsFolder"
				type="text"
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
import { mapState } from 'vuex'
import { getFilePickerBuilder, showError, showSuccess } from '@nextcloud/dialogs'

export default {
	name: 'SettingsAttachmentsFolder',
	components: {
		NcInputField,
	},
	computed: {
		...mapState({
			attachmentsFolder: state => (state.settings.attachmentsFolder || '/'),
		}),
	},
	methods: {
		async selectCalendarFolder() {
			const picker = getFilePickerBuilder(t('calendar', 'Select the default location for attachments'))
				.setMultiSelect(false)
				.setModal(true)
				.setType(1)
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

			this.$store.dispatch('setAttachmentsFolder', { attachmentsFolder: path })
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
