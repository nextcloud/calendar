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
