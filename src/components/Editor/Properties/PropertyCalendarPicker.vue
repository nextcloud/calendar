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
	<div v-if="display" class="property-wrapper">
		<div class="property-icon icon-calendar-dark" :title="$t('calendar', 'Calendar')" />
		<div class="property-input">
			<calendar-picker
				v-if="!isReadOnly"
				:calendar="calendar"
				:calendars="calendars"
				:show-calendar-on-select="true"
				@selectCalendar="selectCalendar" />
			<div v-if="isReadOnly" class="fake-input-box row">
				<div class="color-indicator" :style="{ backgroundColor: avatarEnabledCalendar.color }" />
				<span>{{ avatarEnabledCalendar.displayName }}</span>
				<Avatar v-if="avatarEnabledCalendar.isSharedWithMe" :disable-menu="true" :disable-tooltip="true"
					:user="avatarEnabledCalendar.userId" :display-name="avatarEnabledCalendar.userDisplayName" :size="18" />
			</div>
		</div>
	</div>
</template>

<script>
import CalendarPicker from '../../Shared/CalendarPicker'

export default {
	name: 'PropertyCalendarPicker',
	components: {
		CalendarPicker
	},
	props: {
		calendar: {
			required: true
		},
		calendars: {
			type: Array,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true
		},
	},
	computed: {
		display() {
			return this.calendar !== undefined
		},
		avatarEnabledCalendar() {
			const principal = this.$store.getters.getPrincipalByUrl(this.calendar.owner)

			if (!principal) {
				return this.calendar
			}

			return Object.assign({}, this.calendar, {
				userId: principal.userId,
				userDisplayName: principal.displayname
			})
		},
	},
	methods: {
		selectCalendar(value) {
			this.$emit('selectCalendar', value)
		}
	}
}
</script>

<style scoped>
.property-wrapper {
	display: flex;
	width: 100%;
	align-items: flex-start;
	min-height: 46px;
}

.property-icon,
.property-info {
	height: 34px;
	width: 34px;
	margin-top: 3px;
}

.property-icon {
	margin-left: -5px;
	margin-right: 5px;
}

.property-info {
	opacity: .5;
}

.property-info:hover {
	opacity: 1
}

.property-input {
	flex-grow: 2;
}

.multiselect {
	width: 100%;
	margin: 3px 3px 3px 0;
}

.fake-input-box {
	white-space: pre-line;
	margin: 3px 3px 3px 0;
	padding: 8px 7px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	outline: none;
}

.row {
	width: 100%;
	display: flex;
	align-items: center;
}

.color-indicator {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: none;
	margin-right: 8px;
}

.row .avatardiv {
	margin-left: auto;
}
</style>
