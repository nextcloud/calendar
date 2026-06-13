<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Modal
		class="import-modal"
		size="normal"
		:name="$t('calendar', 'Import destination selection')"
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

			<div class="import-modal__counters">
				<NcNoteCard type="info">
					<strong>{{ totals.discovered }}</strong> {{ $t('calendar', 'Discovered') }}
				</NcNoteCard>
				<NcNoteCard type="info">
					<strong>{{ totals.processed }}</strong> {{ $t('calendar', 'Processed') }}
				</NcNoteCard>
				<NcNoteCard type="success">
					<strong>{{ totals.created }}</strong> {{ $t('calendar', 'Created') }}
				</NcNoteCard>
				<NcNoteCard type="info">
					<strong>{{ totals.updated }}</strong> {{ $t('calendar', 'Updated') }}
				</NcNoteCard>
				<NcNoteCard type="warning">
					<strong>{{ totals.exists }}</strong> {{ $t('calendar', 'Skipped') }}
				</NcNoteCard>
				<NcNoteCard type="error">
					<strong>{{ totals.error }}</strong> {{ $t('calendar', 'Errors') }}
				</NcNoteCard>
			</div>
		</template>
	</Modal>
</template>

<script>
import { NcModal as Modal, NcButton, NcNoteCard, NcProgressBar } from '@nextcloud/vue'
import Upload from 'vue-material-design-icons/TrayArrowUp.vue'
import ImportScreenRow from './ImportScreenRow.vue'

export default {
	name: 'ImportScreen',
	components: {
		NcButton,
		NcNoteCard,
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
