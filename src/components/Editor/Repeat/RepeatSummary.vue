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
	<div v-if="display" class="repeat-option-set repeat-option-set--summary">
		<span class="repeat-option-set-summary__label">{{ $t('calendar', 'Summary') }}:</span>
		<span class="repeat-option-set-summary__summary">{{ summary }}</span>
	</div>
</template>

<script>
import moment from '@nextcloud/moment'
import { getDayNames, getMonthNames } from '@nextcloud/l10n'

export default {
	name: 'RepeatSummary',
	props: {
		/**
		 *
		 */
		frequency: {
			type: String,
			required: true,
		},
		/**
		 *
		 */
		interval: {
			type: Number,
			required: true,
		},
		/**
		 *
		 */
		byDay: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		byMonth: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		byMonthDay: {
			type: Array,
			required: true,
		},
		/**
		 *
		 */
		bySetPosition: {
			type: Number,
			default: null,
		},
		/**
		 *
		 */
		count: {
			type: Number,
			default: null,
		},
		/**
		 *
		 */
		until: {
			type: Date,
			default: null,
		},
	},
	computed: {
		/**
		 * Returns whether or not to display the summary.
		 * We do not want to show it if it doesn't repeat
		 *
		 * @returns {boolean}
		 */
		display() {
			return this.frequency !== 'NONE'
		},
		summary() {
			// Do not remove this if, because it is still used by RepeatSummaryReadOnly.vue
			// Ideally we would outsource this into a filter
			if (this.frequency === 'NONE') {
				return this.$t('calendar', 'Does not repeat')
			}

			let freqPart = ''
			if (this.interval === 1) {
				switch (this.frequency) {
				case 'DAILY':
					freqPart = this.$t('calendar', 'Daily')
					break

				case 'WEEKLY':
					freqPart = this.$t('calendar', 'Weekly')
					break

				case 'MONTHLY':
					freqPart = this.$t('calendar', 'Monthly')
					break

				case 'YEARLY':
					freqPart = this.$t('calendar', 'Yearly')
					break
				}
			} else {
				switch (this.frequency) {
				case 'DAILY':
					freqPart = this.$n('calendar', 'Every %n day', 'Every %n days', this.interval)
					break

				case 'WEEKLY':
					freqPart = this.$n('calendar', 'Every %n week', 'Every %n weeks', this.interval)
					break

				case 'MONTHLY':
					freqPart = this.$n('calendar', 'Every %n month', 'Every %n months', this.interval)
					break

				case 'YEARLY':
					freqPart = this.$n('calendar', 'Every %n year', 'Every %n years', this.interval)
					break
				}
			}

			let limitPart = ''
			if (this.frequency === 'WEEKLY' && this.byDay.length !== 0) {
				const formattedDays = this.getTranslatedByDaySet(this.byDay)

				limitPart = this.$n('calendar', 'on {weekday}', 'on {weekdays}', this.byDay.length, {
					weekday: formattedDays,
					weekdays: formattedDays,
				})
			} else if (this.frequency === 'MONTHLY') {
				if (this.byMonthDay.length !== 0) {
					const dayOfMonthList = this.byMonthDay.join(', ')

					limitPart = this.$n('calendar', 'on day {dayOfMonthList}', 'on days {dayOfMonthList}', this.byMonthDay.length, {
						dayOfMonthList,
					})
				} else {
					const ordinalNumber = this.getTranslatedOrdinalNumber(this.bySetPosition)
					const byDaySet = this.getTranslatedByDaySet(this.byDay)

					limitPart = this.$t('calendar', 'on the {ordinalNumber} {byDaySet}', {
						ordinalNumber,
						byDaySet,
					})
				}
			} else if (this.frequency === 'YEARLY') {
				const monthNames = this.getTranslatedMonths(this.byMonth)

				if (this.byDay.length === 0) {
					limitPart = this.$t('calendar', 'in {monthNames}', {
						monthNames,
					})
				} else {
					const ordinalNumber = this.getTranslatedOrdinalNumber(this.bySetPosition)
					const byDaySet = this.getTranslatedByDaySet(this.byDay)

					limitPart = this.$t('calendar', 'in {monthNames} on the {ordinalNumber} {byDaySet}', {
						monthNames,
						ordinalNumber,
						byDaySet,
					})
				}
			}

			let endPart = ''
			if (this.until !== null) {
				const untilDate = moment(this.until).format('L')

				endPart = this.$t('calendar', ', until {untilDate}', {
					untilDate,
				})
			} else if (this.count !== null) {
				endPart = this.$n('calendar', ', %n time', ', %n times', this.count)
			}

			return [
				freqPart,
				limitPart,
				endPart,
			].join(' ').trim()
		},
	},
	methods: {
		/**
		 * Gets the translated ordinal number for by-set-position
		 *
		 * @param {Number} bySetPositionNum The by-set-position number to get the translation of
		 * @returns {string}
		 */
		getTranslatedOrdinalNumber(bySetPositionNum) {
			switch (bySetPositionNum) {
			case 1:
				return this.$t('calendar', 'first')

			case 2:
				return this.$t('calendar', 'second')

			case 3:
				return this.$t('calendar', 'third')

			case 4:
				return this.$t('calendar', 'fourth')

			case 5:
				return this.$t('calendar', 'fifth')

			case -2:
				return this.$t('calendar', 'second to last')

			case -1:
				return this.$t('calendar', 'last')

			default:
				return ''
			}
		},
		/**
		 * Gets the byDay list as formatted list of translated weekdays
		 *
		 * @param {string[]} byDayList The by-day-list to get formatted
		 * @returns {string}
		 */
		getTranslatedByDaySet(byDayList) {
			const byDayNames = []
			const allByDayNames = getDayNames()

			if (byDayList.includes('MO')) {
				byDayNames.push(allByDayNames[1])
			}
			if (byDayList.includes('TU')) {
				byDayNames.push(allByDayNames[2])
			}
			if (byDayList.includes('WE')) {
				byDayNames.push(allByDayNames[3])
			}
			if (byDayList.includes('TH')) {
				byDayNames.push(allByDayNames[4])
			}
			if (byDayList.includes('FR')) {
				byDayNames.push(allByDayNames[5])
			}
			if (byDayList.includes('SA')) {
				byDayNames.push(allByDayNames[6])
			}
			if (byDayList.includes('SU')) {
				byDayNames.push(allByDayNames[0])
			}

			return byDayNames.join(', ')
		},
		/**
		 * Gets the byMonth list as formatted list of translated month-names
		 *
		 *
		 * @param {number[]} byMonthList The by-month list to get formatted
		 * @returns {string}
		 */
		getTranslatedMonths(byMonthList) {
			const sortedByMonth = byMonthList.slice()
			sortedByMonth.sort()

			const monthNames = []
			const allMonthNames = getMonthNames()

			for (const month of sortedByMonth) {
				monthNames.push(allMonthNames[month - 1])
			}

			return monthNames.join(', ')
		},
	},
}
</script>
