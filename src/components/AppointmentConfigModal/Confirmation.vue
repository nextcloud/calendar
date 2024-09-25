<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="app-config-modal-confirmation">
		<EmptyContent :name="title">
			<template #icon>
				<CheckIcon />
			</template>
		</EmptyContent>
		<div class="app-config-modal-confirmation__buttons">
			<NcButton :href="config.bookingUrl"
				target="_blank"
				rel="noopener noreferrer">
				{{ t('calendar', 'Preview') }}
			</NcButton>
			<NcButton v-if="showCopyLinkButton"
				@click="copyLink">
				{{ t('calendar', 'Copy link') }}
			</NcButton>
		</div>
	</div>
</template>

<script>
import { NcButton, NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import AppointmentConfig from '../../models/appointmentConfig.js'

export default {
	name: 'Confirmation',
	components: {
		NcButton,
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
				return this.$t('calendar', 'Appointment schedule successfully created')
			}

			return this.$t('calendar', 'Appointment schedule successfully updated')
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
