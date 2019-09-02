<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
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
		<div class="row">
			<DatetimePicker lang="en" :format="timeFormat" :value="start"
				:type="timeType"
			/>
			<span>
				{{ toLabel }}
			</span>
			<DatetimePicker lang="en" :format="timeFormat" :value="end"
				:type="timeType"
			/>
		</div>
		<div v-if="displayTimezones" class="row">
			<timezone-select :value="startTimezoneId" />
			<span style="visibility: hidden">
				{{ toLabel }}
			</span>
			<timezone-select :value="endTimezoneId" />
		</div>

		<div class="row-checkboxes">
			<div>
				<input id="allDay" v-model="isAllDay" type="checkbox"
					class="checkbox" :disabled="!canModifyAllDay"
					@change="updateAllDay"
				>
				<label for="allDay">
					{{ allDayLabel }}
				</label>
			</div>

			<div>
				<input id="showTimezones" v-model="showTimezones" type="checkbox"
					class="hidden"
				>
				<label v-if="!isAllDay" for="showTimezones">
					{{ showTimezonesLabel }}
				</label>
			</div>
		</div>
	</div>
</template>

<script>
import { DatetimePicker } from 'nextcloud-vue'
import TimezoneSelect from '../../Shared/TimezoneSelect'
import PropertyMixin from '../../../mixins/PropertyMixin'

export default {
	name: 'PropertyTitleTimePicker',
	components: {
		DatetimePicker,
		TimezoneSelect
	},
	mixins: [
		PropertyMixin
	],
	data() {
		return {
			start: null,
			startTimezoneId: 'Europe/Berlin',
			end: null,
			endTimezoneId: 'Europe/Berlin',
			isAllDay: false,
			showTimezones: false,
			canModifyAllDay: true
		}
	},
	computed: {
		allDayLabel() {
			return t('calendar', 'All day')
		},
		showTimezonesLabel() {
			return this.showTimezones
				? t('calendar', 'Hide timezones')
				: t('canledar', 'Show timezones')
		},
		toLabel() {
			return t('calendar', 'to')
		},
		timeFormat() {
			if (this.isAllDay) {
				return 'YYYY-MM-DD'
			}

			return 'YYYY-MM-DD HH:mm'
		},
		timeType() {
			if (this.isAllDay) {
				return 'date'
			}

			return 'datetime'
		},
		displayTimezones() {
			return !this.isAllDay && this.showTimezones
		},
	},
	watch: {
		eventComponent() {
			this.initValue()
		}
	},
	created() {
		this.initValue()
	},
	methods: {
		changeValue(value) {
			console.debug(value)
		},
		initValue() {
			if (!this.eventComponentLoaded) {
				return
			}

			this.isAllDay = this.eventComponent.isAllDay()
			this.start = this.eventComponent.startDate.jsDate
			this.startTimezoneId = this.eventComponent.startDate.timezoneId
			this.end = this.eventComponent.endDate.jsDate
			this.endTimezoneId = this.eventComponent.endDate.timezoneId
			this.canModifyAllDay = this.eventComponent.canModifyAllDay

			console.debug(this.eventComponent)
		},
		updateAllDay() {
			this.showTimezones = false
		}
	}
}
</script>

<style scoped>
.row,
.row-checkboxes {
	display: flex;
}

.row {
	align-items: center;
}

.row-checkboxes {
	align-items: center;
	justify-content: space-between;
}

.row > div.mx-datepicker,
.row > div.multiselect {
	flex-grow: 2;
}

.row > span {
	margin: 0 10px;
}
</style>
