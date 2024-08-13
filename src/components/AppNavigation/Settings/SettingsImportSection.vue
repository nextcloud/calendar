<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<li v-if="showProgressBar" class="settings-fieldset-interior-item">
		<progress class="settings-fieldset-interior-item__progressbar"
			:value="imported"
			:max="total" />
	</li>
	<li v-else class="settings-fieldset-interior-item">
		<NcButton :disabled="disableImport"
			:wide="true"
			@click="$refs.importInput.click()">
			<template #icon>
				<Upload :size="20" />
			</template>
			{{ $n('calendar', 'Import calendar', 'Import calendars', 1) }}
		</NcButton>
		<input :id="inputUid"
			ref="importInput"
			class="hidden"
			type="file"
			:accept="supportedFileTypes"
			:disabled="disableImport"
			multiple
			@change="processFiles">

		<ImportScreen v-if="showImportModal"
			:files="files"
			@cancel-import="cancelImport"
			@import-calendar="importCalendar" />
	</li>
</template>

<script>
import { getParserManager } from '@nextcloud/calendar-js'
import ImportScreen from './ImportScreen.vue'
import { readFileAsText } from '../../../services/readFileAsTextService.js'
import {
	showSuccess,
	showWarning,
	showError,
} from '@nextcloud/dialogs'
import {
	IMPORT_STAGE_AWAITING_USER_SELECT,
	IMPORT_STAGE_DEFAULT,
	IMPORT_STAGE_IMPORTING,
	IMPORT_STAGE_PROCESSING,
} from '../../../models/consts.js'

import Upload from 'vue-material-design-icons/Upload.vue'
import useImportStateStore from '../../../store/importState.js'
import useImportFilesStore from '../../../store/importFiles.js'
import useCalendarsStore from '../../../store/calendars.js'
import useCalendarObjectsStore from '../../../store/calendarObjects.js'
import { mapStores, mapState } from 'pinia'
import { NcButton } from '@nextcloud/vue'

export default {
	name: 'SettingsImportSection',
	components: {
		ImportScreen,
		Upload,
		NcButton,
	},
	props: {
		isDisabled: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		...mapStores(useImportStateStore, useImportFilesStore, useCalendarsStore, useCalendarObjectsStore),
		...mapState(useImportFilesStore, {
			files: 'importFiles',
		}),
		...mapState(useImportStateStore, {
			stage: 'stage',
			total: 'total',
			accepted: 'accepted',
			denied: 'denied',
		}),
		/**
		 * Total amount of processed calendar-objects, either accepted or failed
		 *
		 * @return {number}
		 */
		imported() {
			return this.accepted + this.denied
		},
		/**
		 * Whether or not to display the upload button
		 *
		 * @return {boolean}
		 */
		allowUploadOfFiles() {
			return this.stage === IMPORT_STAGE_DEFAULT
		},
		/**
		 * Whether or not to display the import modal
		 *
		 * @return {boolean}
		 */
		showImportModal() {
			return this.stage === IMPORT_STAGE_AWAITING_USER_SELECT
		},
		/**
		 * Whether or not to display progress bar
		 *
		 * @return {boolean}
		 */
		showProgressBar() {
			return this.stage === IMPORT_STAGE_IMPORTING
		},
		/**
		 * Unique identifier for the input field.
		 * Needed for the label
		 *
		 * @return {string}
		 */
		inputUid() {
			return this._uid + '-import-input'
		},
		/**
		 * Get a list of supported file-types for the file-picker
		 *
		 * This list comes straight from calendar-js.
		 * So in case we add new supported file-types there,
		 * we don't have to change anything here
		 *
		 * @return {string[]}
		 */
		supportedFileTypes() {
			return getParserManager().getAllSupportedFileTypes()
		},
		/**
		 * Whether or not the import button is disabled
		 *
		 * @return {boolean}
		 */
		disableImport() {
			return this.isDisabled || !this.allowUploadOfFiles
		},
	},
	methods: {
		/**
		 * Process all files submitted from the user
		 *
		 * @param {Event} event The change-event of the input-field
		 */
		async processFiles(event) {
			this.importStateStore.stage = IMPORT_STAGE_PROCESSING
			let addedFiles = false

			for (const file of event.target.files) {
				const contents = await readFileAsText(file)
				const lastModified = file.lastModified
				const name = file.name
				const size = file.size
				let type = file.type

				// Developers are advised not to rely on the type as a sole validation scheme.
				// https://developer.mozilla.org/en-US/docs/Web/API/File/type
				if (!this.supportedFileTypes.includes(type)) {
					// Try to guess file type based on its extension.
					// If it's an xml file, our best guess is xCal: https://tools.ietf.org/html/rfc6321
					// If it's a json file, our best guess is jCal: https://tools.ietf.org/html/rfc7265
					// In every other case, our best guess is just plain old iCalendar: https://tools.ietf.org/html/rfc5545
					if (name.endsWith('.xml')) {
						type = 'application/calendar+xml'
					} else if (name.endsWith('.json')) {
						type = 'application/calendar+json'
					} else if (name.endsWith('.csv')) {
						type = 'text/csv'
					} else {
						type = 'text/calendar'
					}
				}

				// Use custom-options for parser.
				// The last one in particular will prevent thousands
				// of invitation emails to be sent out on import
				const parser = getParserManager().getParserForFileType(type, {
					extractGlobalProperties: true,
					includeTimezones: true,
					removeRSVPForAttendees: true,
				})

				try {
					parser.parse(contents)
				} catch (error) {
					console.error(error)
					showError(this.$t('calendar', '{filename} could not be parsed', {
						filename: name,
					}))
					continue
				}

				this.importFilesStore.addFile({
					contents,
					lastModified,
					name,
					size,
					type,
					parser,
				})
				addedFiles = true
			}

			if (!addedFiles) {
				showError(this.$t('calendar', 'No valid files found, aborting import'))
				this.importFilesStore.removeAllFiles()
				this.importStateStore.resetState()
				return
			}

			this.importStateStore.stage = IMPORT_STAGE_AWAITING_USER_SELECT
		},
		/**
		 * Import all events into the calendars
		 * This will show
		 */
		async importCalendar() {
			await this.calendarsStore.importEventsIntoCalendar()

			if (this.total === this.accepted) {
				showSuccess(this.$n('calendar', 'Successfully imported %n event', 'Successfully imported %n events', this.total))
			} else {
				showWarning(this.$t('calendar', 'Import partially failed. Imported {accepted} out of {total}.', {
					accepted: this.accepted,
					total: this.total,
				}))
			}
			this.importFilesStore.removeAllFiles()
			this.importStateStore.resetState()

			// Once we are done importing, reload the calendar view
			this.calendarObjectsStore.modificationCount++

			this.resetInput()
		},
		/**
		 * Resets the import sate
		 */
		cancelImport() {
			this.importFilesStore.removeAllFiles()
			this.importStateStore.resetState()
			this.resetInput()
		},
		/**
		 * Manually reset the file-input, because when you try to upload
		 * the exact same files again, it won't trigger the change event
		 */
		resetInput() {
			this.$refs.importInput.value = ''
		},
	},
}
</script>
