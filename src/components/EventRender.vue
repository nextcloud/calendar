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
	<div class="fc-event-main-frame">
		<div class="fc-event-main-frame--text">
			<b>{{ eventDetails.event.title }}</b>
			<span class="fc-event-main-frame--text--time">{{ eventDetails.timeText }}</span>
		</div>
		<div class="fc-event-main-frame--icons">
			<Bell v-if="hasAlarms"
				:size="14"
				:style="{ color: isDarkText ? 'var(--color-main-text)' : 'var(--fc-event-text-color)' }" />
			<AccountMultiple v-if="hasAttendees"
				:style="{ color: isDarkText ? 'var(--color-main-text)' : 'var(--fc-event-text-color)' }"
				:size="16" />
			<CheckboxMarkedOutline v-if="isTask && isCheckedTaskEvent"
				:style="{ color: isDarkText ? 'var(--color-main-text)' : 'var(--fc-event-text-color)' }"
				:size="16" />
			<CheckboxBlankOutline v-if="isTask && !isCheckedTaskEvent"
				:style="{ color: isDarkText ? 'var(--color-main-text)' : 'var(--fc-event-text-color)' }"
				:size="16" />
		</div>
	</div>
</template>

<script>
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import Bell from 'vue-material-design-icons/Bell.vue'
import CheckboxBlankOutline from 'vue-material-design-icons/CheckboxBlankOutline.vue'
import CheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'

export default {
	name: 'EventRender',
	components: {
	  AccountMultiple,
		Bell,
	  CheckboxBlankOutline,
	  CheckboxMarkedOutline,
	},
	props: {
		eventDetails: {
			type: Object,
			required: true,
		},
	},
	computed: {
		viewType() {
			return this.eventDetails?.view?.type
		},
		hasAlarms() {
			return this.eventDetails?.event?._def?.extendedProps?.hasAlarms
		},
		hasAttendees() {
			return this.eventDetails?.event?._def?.extendedProps?.hasAttendees
		},
	  isTask() {
		  return this.eventDetails?.event?._def?.extendedProps?.isTask
	  },
		isDarkText() {
			return this.eventDetails?.event?._def?.extendedProps?.darkText
		},
	  isCheckedTaskEvent() {
		  return this.eventDetails?.event?._def?.extendedProps?.percent === 100
	  },
	},
}
</script>

<style scoped>
.fc-event-main-frame {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.fc-event-main-frame--text {
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	padding-right: 5px;
}

.fc-event-main-frame--text--time {
	padding-right: 5px;
}

.fc-event-main-frame--icons {
	display: flex;
	flex-shrink: 0;
}

</style>
