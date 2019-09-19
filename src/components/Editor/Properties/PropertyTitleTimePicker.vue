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
			<DatetimePicker v-if="!isReadOnly" lang="en" :format="timeFormat"
				:value="start" :type="timeType" @change="changeStart"
			/>
			<div v-if="isReadOnly" class="fake-input-box">{{ start | formatDate(isAllDay) }}</div>
			<span>
				{{ toLabel }}
			</span>
			<DatetimePicker v-if="!isReadOnly" lang="en" :format="timeFormat"
				:value="end" :type="timeType" @change="changeEnd"
			/>
			<div v-if="isReadOnly" class="fake-input-box">{{ end | formatDate(isAllDay) }}</div>
		</div>
		<div v-if="displayTimezones" class="row">
			<timezone-select v-if="!isReadOnly" :value="startTimezoneId" @change="changeStartTimezone" />
			<div v-if="isReadOnly" class="fake-input-box">{{ startTimezoneId | formatTimezone }}</div>
			<span style="visibility: hidden">
				{{ toLabel }}
			</span>
			<timezone-select v-if="!isReadOnly" :value="endTimezoneId" @change="changeEndTimezone" />
			<div v-if="isReadOnly" class="fake-input-box">{{ endTimezoneId | formatTimezone }}</div>
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
import { getDateFromDateTimeValue } from '../../../services/dateService.js'
import getTimezoneManager from '../../../services/timezoneDataProviderService'
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
	mixins: [
		PropertyMixin
	],
	props: {
		userTimezone: {
			Type: String,
			required: true
		},
		startEndDateHash: {
			Type: String,
			required: false
		}
	},
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
	watch: {
		eventComponent() {
			this.initValue()
		},
		startEndDateHash() {
			this.initValue()
		}
	},
	created() {
		this.initValue()
	},
	methods: {
		changeStart(value) {
			this.eventComponent.startDate.year = value.getFullYear()
			this.eventComponent.startDate.month = value.getMonth() + 1
			this.eventComponent.startDate.day = value.getDate()
			this.eventComponent.startDate.hour = value.getHours()
			this.eventComponent.startDate.minute = value.getMinutes()
			this.eventComponent.startDate.second = 0

			// Do not allow end to be earlier than start
			if (this.eventComponent.endDate.compare(this.eventComponent.startDate) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(this.eventComponent.endDate.timezoneId)
				this.eventComponent.endDate = this.eventComponent.startDate.getInTimezone(timezone)
				this.end = getDateFromDateTimeValue(this.eventComponent.endDate)
			}

			this.start = value
		},
		changeEnd(value) {
			this.eventComponent.endDate.year = value.getFullYear()
			this.eventComponent.endDate.month = value.getMonth() + 1
			this.eventComponent.endDate.day = value.getDate()
			this.eventComponent.endDate.hour = value.getHours()
			this.eventComponent.endDate.minute = value.getMinutes()
			this.eventComponent.endDate.second = 0

			// Do not allow end to be earlier than start
			if (this.eventComponent.endDate.compare(this.eventComponent.startDate) === -1) {
				const timezone = getTimezoneManager().getTimezoneForId(this.eventComponent.startDate.timezoneId)
				this.eventComponent.startDate = this.eventComponent.endDate.getInTimezone(timezone)
				this.start = getDateFromDateTimeValue(this.eventComponent.startDate)
			}

			this.end = value
		},
		changeStartTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			const timezone = getTimezoneManager().getTimezoneForId(value)
			this.eventComponent.startDate.replaceTimezone(timezone)
			this.startTimezoneId = value

			// Either both are floating or both have a timezone, but obviously
			// it can't be mixed
			if (value === 'floating' || this.endTimezoneId === 'floating') {
				this.eventComponent.endDate.replaceTimezone(timezone)
				this.endTimezoneId = value
			}

			// Simulate a change of the start time to trigger the comparison
			// of start and end and trigger an update of end if necessary
			this.changeStart(this.start)
		},
		changeEndTimezone(value) {
			// If the value didn't change, value is null
			if (!value) {
				return
			}

			const timezone = getTimezoneManager().getTimezoneForId(value)
			this.eventComponent.endDate.replaceTimezone(timezone)
			this.endTimezoneId = value

			// Either both are floating or both have a timezone, but obviously
			// it can't be mixed
			if (value === 'floating' || this.startTimezoneId === 'floating') {
				this.eventComponent.startDate.replaceTimezone(timezone)
				this.startTimezoneId = value
			}

			// Simulate a change of the end time to trigger the comparison
			// of start and end and trigger an update of end if necessary
			this.changeEnd(this.end)
		},
		toggleAllDay() {
			if (!this.canModifyAllDay) {
				return
			}

			const isAllDay = this.eventComponent.isAllDay()
			this.eventComponent.startDate.isDate = !isAllDay
			this.eventComponent.endDate.isDate = !isAllDay
			this.isAllDay = this.eventComponent.isAllDay()
			this.showTimezones = false
		},
		initValue() {
			if (!this.eventComponentLoaded) {
				return
			}

			this.isAllDay = this.eventComponent.isAllDay()
			this.start = getDateFromDateTimeValue(this.eventComponent.startDate)
			this.startTimezoneId = this.eventComponent.startDate.timezoneId
			this.end = getDateFromDateTimeValue(this.eventComponent.endDate)
			this.endTimezoneId = this.eventComponent.endDate.timezoneId
			this.canModifyAllDay = this.eventComponent.canModifyAllDay()

			if (!this.isAllDay) {
				// Automatically show timezone select if:
				//  - start and end timezone are different
				//  - selected timezone is different from current-user-timezone
				if (this.startTimezoneId !== this.endTimezoneId || this.startTimezoneId !== this.userTimezone) {
					this.showTimezones = true
				}
			}
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
