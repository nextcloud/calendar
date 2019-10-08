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
			<DatetimePicker
				v-if="!isReadOnly"
				lang="en"
				:format="timeFormat"
				:value="startDate"
				:type="timeType"
				@change="changeStart" />
			<div v-if="isReadOnly" class="fake-input-box">
				{{ startDate | formatDate(isAllDay) }}
			</div>
			<span>
				{{ toLabel }}
			</span>
			<DatetimePicker
				v-if="!isReadOnly"
				lang="en"
				:format="timeFormat"
				:value="endDate"
				:type="timeType"
				@change="changeEnd" />
			<div v-if="isReadOnly" class="fake-input-box">
				{{ endDate | formatDate(isAllDay) }}
			</div>
		</div>
		<div v-if="displayTimezones" class="row">
			<timezone-select v-if="!isReadOnly" :value="startTimezone" @change="changeStartTimezone" />
			<div v-if="isReadOnly" class="fake-input-box">{{ startTimezone | formatTimezone }}</div>
			<span style="visibility: hidden">
				{{ toLabel }}
			</span>
			<timezone-select v-if="!isReadOnly" :value="endTimezone" @change="changeEndTimezone" />
			<div v-if="isReadOnly" class="fake-input-box">{{ endTimezone | formatTimezone }}</div>
		</div>

		<div class="row-checkboxes">
			<div>
				<input id="allDay" v-model="isAllDay" type="checkbox"
					class="checkbox" :disabled="!canModifyAllDay || isReadOnly"
					@change="toggleAllDay"
				>
				<label for="allDay" v-tooltip="allDayTooltip">
					{{ allDayLabel }}
				</label>
			</div>
		</div>
	</div>
</template>

<script>
import { DatetimePicker } from 'nextcloud-vue'
import TimezoneSelect from '../../Shared/TimezoneSelect'
import {
	getReadableTimezoneName,
} from '../../../services/timezoneSortingService'
import moment from 'nextcloud-moment'

export default {
	name: 'PropertyTitleTimePicker',
	components: {
		DatetimePicker,
		TimezoneSelect
	},
	props: {
		isReadOnly: {
			type: Boolean,
			required: true
		},
		startDate: {
			type: Date,
			required: true
		},
		startTimezone: {
			type: String,
			required: true
		},
		endDate: {
			type: Date,
			required: true
		},
		endTimezone: {
			type: String,
			required: true
		},
		isAllDay: {
			type: Boolean,
			required: true
		},
		canModifyAllDay: {
			type: Boolean,
			required: true
		},
		userTimezone: {
			Type: String,
			required: true
		}
	},
	data() {
		return {
			showTimezones: false
		}
	},
	filters: {
		formatDate(value, isAllDay) {
			if (!value) {
				return ''
			}
			if (isAllDay) {
				return moment(value).format('ll')
			} else {
				return moment(value).format('lll')
			}
		},
		formatTimezone(value) {
			if (!value) {
				return ''
			}

			return getReadableTimezoneName(value)
		}
	},
	computed: {
		allDayLabel() {
			return t('calendar', 'All day')
		},
		allDayTooltip() {
			if (this.canModifyAllDay) {
				return null
			}
			if (this.isReadOnly) {
				return null
			}

			return t('calendar', 'Can not modify all-day setting for events that are part of a recurrence-set.')
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
	methods: {
		changeStart(value) {
			this.$emit('updateStartDate', value)
		},
		changeEnd(value) {
			this.$emit('updateEndDate', value)
		},
		changeStartTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('updateStartTimezone', value)
		},
		changeEndTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			this.$emit('updateEndTimezone', value)
		},
		toggleAllDay() {
			if (!this.canModifyAllDay) {
				return
			}

			this.$emit('toggleAllDay')
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
.row > div.multiselect,
.row > .fake-input-box {
	flex-grow: 2;
}

.row > span {
	margin: 0 10px;
}

.fake-input-box {
	margin: 3px 3px 3px 0;
	padding: 8px 7px;
	background-color: var(--color-main-background);
	color: var(--color-main-text);
	outline: none;
}
</style>
