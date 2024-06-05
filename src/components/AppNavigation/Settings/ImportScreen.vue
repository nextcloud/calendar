<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<Modal class="import-modal" size="large" @close="cancelImport">
		<h2 class="import-modal__title">
			{{ $t('calendar', 'Import calendars') }}
		</h2>
		<h4 class="import-modal__subtitle">
			<!-- eslint-disable-next-line no-irregular-whitespace -->
			{{ $t('calendar', 'Please select a calendar to import into …') }}
		</h4>

		<transition-group class="import-modal__file-list" tag="ul">
			<li :key="headerRowKey" class="import-modal-file-item import-modal-file-item--header">
				<div class="import-modal-file-item__filename">
					{{ $t('calendar', 'Filename') }}
				</div>
				<div class="import-modal-file-item__calendar-select">
					{{ $t('calendar', 'Calendar to import into') }}
				</div>
			</li>
			<ImportScreenRow v-for="(file, index) in files" :key="`import-file-${index}`" :file="file" />
		</transition-group>

		<div class="import-modal__actions">
			<NcButton @click="cancelImport">
				{{ $t('calendar', 'Cancel' ) }}
			</NcButton>
			<NcButton class="primary" @click="importCalendar">
				{{ $n('calendar', 'Import calendar', 'Import calendars', files.length) }}
			</NcButton>
		</div>
	</Modal>
</template>

<script>
import { NcButton, NcModal as Modal } from '@nextcloud/vue'
import ImportScreenRow from './ImportScreenRow.vue'

export default {
	name: 'ImportScreen',
	components: {
		NcButton,
		ImportScreenRow,
		Modal,
	},
	props: {
		files: {
			type: Array,
			required: true,
		},
	},
	computed: {
		headerRowKey() {
			return this._uid + '-header-row'
		},
	},
	methods: {
		importCalendar() {
			this.$emit('import-calendar')
		},
		cancelImport() {
			this.$emit('cancel-import')
		},
	},
}
</script>
