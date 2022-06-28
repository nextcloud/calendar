<!--
  - @copyright Copyright (c) 2022 Thomas Citharel <nextcloud@tcit.fr>
  -
  - @author Thomas Citharel <nextcloud@tcit.fr>
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
	<div>
		<div class="fc-event-main-frame">
			<div class="fc-event-time">
				{{ eventDetails.timeText }}
			</div>
			<div class="fc-event-title-container fc-event-main-frame--icons">
				<div class="fc-event-title fc-sticky">
					<span class="fc-event-title">{{ eventDetails.event.title }}</span>
				</div>
				<Bell v-if="hasAlarms"
					class="icon-event-reminder"
					:size="14"
					:style="{ color: iconColor }" />
				<AccountMultiple v-if="hasAttendees"
					:size="14"
					:style="{ color: iconColor }" />
			</div>
		</div>
	</div>
</template>

<script>
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import Bell from 'vue-material-design-icons/Bell.vue'

export default {
	name: 'EventRender',
	components: {
		AccountMultiple,
		Bell,
	},
	props: {
		eventDetails: {
			type: Object,
			required: true,
		},
	},
	computed: {
		iconColor() {
			return this.isDarkText ? 'var(--color-main-text)' : 'var(--fc-event-text-color)'
		},
		viewType() {
			return this.eventDetails?.view?.type
		},
		hasAlarms() {
			return this.eventDetails?.event?._def?.extendedProps?.hasAlarms
		},
		hasAttendees() {
			return this.eventDetails?.event?._def?.extendedProps?.hasAttendees
		},
		isDarkText() {
			return this.eventDetails?.event?._def?.extendedProps?.darkText
		},
	},
}
</script>

<style scoped>
.fc-event-title.fc-sticky {
	flex-grow: 1;
}
.fc-event-main-frame--icons {
	display: flex;
	justify-content: space-between;
}
</style>
