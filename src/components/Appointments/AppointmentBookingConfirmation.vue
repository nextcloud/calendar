<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="appointment-booking-confirmation">
		<EmptyContent :name="$t('calendar', 'Please confirm your reservation')" :description="$t('calendar', 'We sent you an email with details. Please confirm your appointment using the link in the email. You can close this page now.')">
			<template #icon>
				<EmailIcon decorative />
			</template>
		</EmptyContent>
	</div>
</template>

<script>
import { NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import EmailIcon from 'vue-material-design-icons/Email.vue'

export default {
	name: 'AppointmentBookingConfirmation',
	components: {
		EmptyContent,
		EmailIcon,
	},
}
</script>

<style lang="scss" scoped>
.appointment-booking-confirmation {
	max-width: 500px;

	.empty-content {
		margin-bottom: 20px;
		margin-top: 0;
	}

	&__desc {
		text-align: center;
	}
}
</style>
