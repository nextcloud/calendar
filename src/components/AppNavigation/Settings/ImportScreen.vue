<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Modal
		class="import-modal"
		size="normal"
		:name="$t('calendar', 'Import destination selection')"
		:noClose="!isSelecting"
		@close="cancelImport">
		<template v-if="isSelecting">
			<transition-group class="import-modal__file-list" tag="ul">
				<ImportScreenRow v-for="entry in entries" :key="`import-file-${entry.file.id}`" :entry="entry" />
			</transition-group>

			<div class="import-modal__actions">
				<NcButton @click="cancelImport">
					{{ $t('calendar', 'Cancel') }}
				</NcButton>
				<NcButton variant="primary" @click="importCalendar">
					<template #icon>
						<Upload :size="20" />
					</template>
					{{ $n('calendar', 'Import calendar', 'Import calendars', entries.length) }}
				</NcButton>
			</div>
		</template>

		<template v-else>
			<h4 class="import-modal__title">
				{{ activeFileLabel }}
			</h4>

			<NcProgressBar class="import-modal__progress-bar" :value="progressValue" size="medium" />

			<p v-if="statusLine" class="import-modal__status">
				{{ statusLine }}
			</p>
		</template>
	</Modal>
</template>

<script>
import { getLanguage } from '@nextcloud/l10n'
import { NcModal as Modal, NcButton, NcProgressBar } from '@nextcloud/vue'
import Upload from 'vue-material-design-icons/TrayArrowUp.vue'
import ImportScreenRow from '@/components/AppNavigation/Settings/ImportScreenRow.vue'

export default {
	name: 'ImportScreen',
	components: {
		NcButton,
		NcProgressBar,
		ImportScreenRow,
		Modal,
		Upload,
	},

	props: {
		entries: {
			type: Array,
			required: true,
		},

		stage: {
			type: String,
			required: true,
		},

		totals: {
			type: Object,
			required: true,
		},

		activeSession: {
			type: Object,
			default: null,
		},
	},

	emits: ['cancelImport', 'importCalendar'],

	computed: {
		isSelecting() {
			return this.stage === 'selecting'
		},

		progressValue() {
			return Math.round(this.totals.processed / Math.max(this.totals.discovered, 1) * 100)
		},

		/**
		 * Progress summary listing only the counters that are not zero.
		 *
		 * @return {string}
		 */
		statusLine() {
			const { discovered, processed, created, updated, exists, error } = this.totals
			const parts = []
			if (discovered > 0) {
				parts.push(this.$n('calendar', 'Processing {processed} of %n', 'Processing {processed} of %n', discovered, { processed }))
			}
			if (created > 0) {
				parts.push(this.$n('calendar', 'Created %n', 'Created %n', created))
			}
			if (updated > 0) {
				parts.push(this.$n('calendar', 'Updated %n', 'Updated %n', updated))
			}
			if (exists > 0) {
				parts.push(this.$n('calendar', 'Skipped %n', 'Skipped %n', exists))
			}
			if (error > 0) {
				parts.push(this.$n('calendar', 'Failed %n', 'Failed %n', error))
			}

			return new Intl.ListFormat(getLanguage(), { type: 'unit' }).format(parts)
		},

		activeFileLabel() {
			if (!this.activeSession) {
				return this.$t('calendar', 'Preparing import…')
			}

			return this.$t('calendar', 'Importing {fileName} into {calendar}', {
				fileName: this.activeSession.fileName,
				calendar: this.activeSession.targetDisplayName || this.$t('calendar', 'selected calendar'),
			})
		},
	},

	methods: {
		importCalendar() {
			this.$emit('importCalendar')
		},

		cancelImport() {
			this.$emit('cancelImport')
		},
	},
}
</script>
