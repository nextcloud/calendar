<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="showProgressBar" class="settings-fieldset-interior-item settings-fieldset-interior-item--import-progress">
		<progress
			class="settings-fieldset-interior-item__import-progress-bar"
			:value="imported"
			:max="total" />
	</div>
	<div v-else class="settings-fieldset-interior-item settings-fieldset-interior-item--import-action">
		<NcButton
			:disabled="disableImport"
			:wide="true"
			@click="$refs.importInput.click()">
			<template #icon>
				<Upload :size="20" />
			</template>
			{{ $n('calendar', 'Import calendar', 'Import calendars', 1) }}
		</NcButton>
		<input
			ref="importInput"
			class="hidden"
			type="file"
			:accept="supportedFileTypes"
			:disabled="disableImport"
			multiple
			@change="processFiles">

		<ImportScreen
			v-if="showImportModal"
			:entries="entries"
			:stage="stage"
			:totals="totals"
			:activeSession="activeSession"
			@cancelImport="cancelImport"
			@importCalendar="importCalendar" />
	</div>
</template>

<script>
import { getParserManager } from '@nextcloud/calendar-js'
import {
	showError,
	showSuccess,
	showWarning,
} from '@nextcloud/dialogs'
import { NcButton } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import Upload from 'vue-material-design-icons/TrayArrowUp.vue'
import ImportScreen from './ImportScreen.vue'
import { readFileAsText } from '../../../services/readFileAsTextService.js'
import useCalendarObjectsStore from '../../../store/calendarObjects.js'
import useImportStore from '../../../store/import.ts'

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
		...mapStores(useImportStore, useCalendarObjectsStore),
		...mapState(useImportStore, {
			entries: 'files',
		}),

		...mapState(useImportStore, {
			stage: 'stage',
			totals: 'totals',
			activeSession: 'activeSession',
		}),

		/**
		 * Total amount of processed calendar-objects, either accepted or failed
		 *
		 * @return {number}
		 */
		imported() {
			return this.totals.processed
		},

		total() {
			return this.totals.discovered
		},

		/**
		 * Whether or not to display the upload button
		 *
		 * @return {boolean}
		 */
		allowUploadOfFiles() {
			return this.stage === 'idle'
		},

		/**
		 * Whether or not to display the import modal
		 *
		 * @return {boolean}
		 */
		showImportModal() {
			return this.stage === 'selecting' || this.stage === 'importing'
		},

		/**
		 * Whether or not to display progress bar
		 *
		 * @return {boolean}
		 */
		showProgressBar() {
			return false
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
			this.importStore.stage = 'preparing'
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

				this.importStore.addFile({
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
				this.importStore.removeAllFiles()
				this.importStore.reset()
				return
			}

			this.importStore.stage = 'selecting'
		},

		/**
		 * Import all events into the calendars
		 * This will show
		 */
		async importCalendar() {
			const totals = await this.importStore.startImport()

			if (totals.discovered === totals.created + totals.updated + totals.exists && totals.error === 0) {
				showSuccess(this.$n('calendar', 'Successfully imported %n event', 'Successfully imported %n events', totals.discovered))
			} else {
				showWarning(this.$t('calendar', 'Import partially failed. Imported {accepted} out of {total}.', {
					accepted: totals.processed - totals.error,
					total: totals.discovered,
				}))
			}
			this.importStore.removeAllFiles()
			this.importStore.reset()

			// Once we are done importing, reload the calendar view
			this.calendarObjectsStore.modificationCount++

			this.resetInput()
		},

		/**
		 * Resets the import sate
		 */
		cancelImport() {
			this.importStore.removeAllFiles()
			this.importStore.reset()
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
