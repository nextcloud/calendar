<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<Modal class="import-modal" size="large" @close="cancelImport">
		<h2 class="import-modal__title">
			{{ $t('calendar', 'Import calendars') }}
		</h2>
		<h4 class="import-modal__subtitle">
			{{ $t('calendar', 'Please select a calendar to import into ...') }}
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
			<button @click="cancelImport">
				{{ $t('calendar', 'Cancel' ) }}
			</button>
			<button class="primary" @click="importCalendar">
				{{ $n('calendar', 'Import calendar', 'Import calendars', files.length) }}
			</button>
		</div>
	</Modal>
</template>

<script>
import ImportScreenRow from './ImportScreenRow.vue'
import {
	Modal
} from '@nextcloud/vue'

export default {
	name: 'ImportScreen',
	components: {
		ImportScreenRow,
		Modal
	},
	props: {
		files: {
			type: Array,
			required: true
		}
	},
	computed: {
		headerRowKey() {
			return this._uid + '-header-row'
		}
	},
	methods: {
		importCalendar() {
			this.$emit('import-calendar')
		},
		cancelImport() {
			this.$emit('cancel-import')
		}
	}
}
</script>
