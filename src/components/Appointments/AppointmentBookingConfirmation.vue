<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<Modal @close="$emit('close')">
		<div class="appointment-booking-confirmation">
			<EmptyContent>
				<template #icon>
					<CheckIcon decorative />
				</template>
				<template #desc>
					{{ $t('calendar', 'Your appointment is booked, we sent you an email with details.') }}
				</template>
			</EmptyContent>
			<div class="appointment-booking-confirmation__buttons">
				<button @click="$emit('close')">
					{{ $t('calendar', 'Close') }}
				</button>
			</div>
		</div>
	</Modal>
</template>

<script>
import Modal from '@nextcloud/vue/dist/Components/Modal'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import CheckIcon from 'vue-material-design-icons/Check'

export default {
	name: 'AppointmentBookingConfirmation',
	components: {
		Modal,
		EmptyContent,
		CheckIcon,
	},
}
</script>

<style lang="scss" scoped>
.appointment-booking-confirmation {
	overflow: auto;
	padding: 2vw;
	max-width: 300px;
	max-height: calc(80vh - 4vw);
	box-sizing: border-box;

	.empty-content {
		margin-top: 0 !important;
		margin-bottom: 20px;
	}

	&__buttons {
		display: flex;
		justify-content: center;
	}
}
</style>
