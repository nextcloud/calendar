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
	<li class="settings-fieldset-interior-item settings-fieldset-interior-upload">
		<label id="calendar-input-form-label" class="button icon icon-upload" for="calendar-input-form">
			{{ importLabel }}
		</label>
		<input id="calendar-input-form" style="display:none" type="file"
			name="file" :accept="supportedFileTypes" :disabled="disableImport"
			multiple @change="loadFiles"
		>
	</li>
</template>

<script>
import { readFileAsText } from '../../../services/readFileAsTextService.js'
import { getParserManager } from 'calendar-js'

export default {
	name: 'ImportUploadButton',
	props: {
		isDisabled: {
			type: Boolean,
			required: true
		},
		supportedFileTypes: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			processingFiles: false
		}
	},
	computed: {
		supportedFileTypesList() {
			return this.supportedFileTypes.join(',')
		},
		importLabel() {
			return t('calendar', 'Import calendar')
		},
		disableImport() {
			return this.processingFiles || this.isDisabled
		}
	},
	methods: {
		async loadFiles(event) {
			this.processingFiles = true

			for (const file of event.target.files) {
				const contents = await readFileAsText(file)
				const lastModified = file.lastModified
				const name = file.name
				const size = file.size
				const type = file.type

				const parser = getParserManager()
					.getParserForFileType(type)
				parser.parse(contents)

				this.$store.commit('addFile', {
					contents,
					lastModified,
					name,
					size,
					type,
					parser
				})
			}

			this.processingFiles = false
			this.$emit('change')
		},
	}
}
</script>
