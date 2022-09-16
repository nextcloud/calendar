<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<div class="app-config-modal-confirmation">
		<EmptyContent :title="title">
			<template #icon>
				<CheckIcon />
			</template>
		</EmptyContent>
		<div class="app-config-modal-confirmation__buttons">
			<a :href="config.bookingUrl"
				class="button"
				rel="noopener noreferrer"
				target="_blank">
				{{ t('calendar', 'Preview') }}
			</a>
			<button v-if="showCopyLinkButton"
				@click="copyLink">
				{{ t('calendar', 'Copy link') }}
			</button>
		</div>
	</div>
</template>

<script>
import EmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import AppointmentConfig from '../../models/appointmentConfig.js'

export default {
	name: 'Confirmation',
	components: {
		EmptyContent,
		CheckIcon,
	},
	props: {
		config: {
			type: AppointmentConfig,
			required: true,
		},
		isNew: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		title() {
			if (this.isNew) {
				return this.$t('calendar', 'Appointment was created successfully')
			}

			return this.$t('calendar', 'Appointment was updated successfully')
		},
		showCopyLinkButton() {
			return navigator && navigator.clipboard
		},
	},
	methods: {
		copyLink() {
			navigator.clipboard.writeText(this.config.bookingUrl)
		},
	},
}
</script>
