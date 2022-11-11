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
		<EmptyContent :title="$t('calendar', 'Please confirm your reservation')" :description="$t('calendar', 'We sent you an email with details. Please confirm your appointment using the link in the email. You can close this page now.')">
			<template #icon>
				<CheckIcon decorative />
			</template>
		</EmptyContent>
	</div>
</template>

<script>
import EmptyContent from '@nextcloud/vue/dist/Components/NcEmptyContent.js'
import CheckIcon from 'vue-material-design-icons/Check.vue'

export default {
	name: 'AppointmentBookingConfirmation',
	components: {
		EmptyContent,
		CheckIcon,
	},
}
</script>

<style lang="scss" scoped>
.appointment-booking-confirmation {
  margin: 25px auto;
	max-width: 500px;
  height: fit-content;

  // Taken from guest.css -> .guest-box
  color: var(--color-main-text);
  background-color: var(--color-main-background);
  padding: 16px;
  border-radius: var(--border-radius-large);
  box-shadow: 0 0 10px var(--color-box-shadow);

	.empty-content {
		margin-bottom: 20px;
			margin-top: 0;
	}

	&__desc {
		text-align: center;
	}
}

#content.app-calendar {
  // Enable scrolling
  overflow: auto;

  // Fix box being cutoff at the bottom
  margin-bottom: 0;
  height: calc(var(--body-height) + var(--body-container-margin));
}
</style>

<style lang="scss">
#content.app-calendar {
  // Enable scrolling
  overflow: auto;

  // Fix box being cutoff at the bottom
  margin-bottom: 0;
  height: calc(var(--body-height) + var(--body-container-margin));
}
</style>
