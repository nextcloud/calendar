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
		<Bell v-if="hasAlarms" />
		<b>{{ eventDetails.timeText }}</b>
		<span class="fc-event-title">{{ eventDetails.event.title }}</span>
	</div>
</template>

<script>
import Bell from 'vue-material-design-icons/Bell.vue'

export default {
	name: 'EventRender',
	components: {
		Bell,
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
	},
}
</script>
