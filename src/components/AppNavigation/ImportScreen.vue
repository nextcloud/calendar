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
	<modal @close="cancelImport">
		<h2>{{ importLabel }}</h2>
		<h4>Please select a calendar to import into ...</h4>
		<transition-group name="file-list" tag="ul">
			<li :key="'file-list-header-bar'" class="import-file-row import-file-row-header">
				<div class="import-file-row-filename">
					{{ fileNameLabel }}
				</div>
				<div class="import-file-row-select">
					{{ calendarLabel }}
				</div>
			</li>
			<import-screen-row v-for="(file, index) in files" :key="`import-file-${index}`" :file="file" />
		</transition-group>
		<button @click="cancelImport">
			Cancel
		</button>
		<button class="primary" @click="importCalendar">
			Import
		</button>
	</modal>
</template>

<script>
import ImportScreenRow from './ImportScreen/ImportScreenRow'
import {
	Modal
} from 'nextcloud-vue'

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
		},
	},
	computed: {
		importLabel() {
			return t('calendar', 'Import calendars')
		},
		fileNameLabel() {
			return t('calendar', 'Filename')
		},
		calendarLabel() {
			return t('calendar', 'Calendar to import into')
		},
		canBeClosed() {
			return true
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
