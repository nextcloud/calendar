<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { isRTL as isRTLFn, t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { useHotKey } from '@nextcloud/vue/composables/useHotKey'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router/composables'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import DatePicker from '../../Shared/DatePickerOld.vue'
import formatDateRange from '../../../filters/dateRangeFormat.js'
import useSettingsStore from '../../../store/settings.js'
import useWidgetStore from '../../../store/widget.js'
import {
	getDateFromFirstdayParam,
	getYYYYMMDDFromDate,
	modifyDate,
} from '../../../utils/date.js'

const props = defineProps<{
	isWidget?: boolean
}>()

const route = useRoute()
const router = useRouter()

const isDatepickerOpen = ref(false)

const widgetStore = useWidgetStore()
const settingsStore = useSettingsStore()
const isRTL = computed(() => isRTLFn())

const selectedDate = computed<Date>(() => {
	if (props.isWidget) {
		return getDateFromFirstdayParam(widgetStore.widgetDate)
	}
	return getDateFromFirstdayParam(route.params?.firstDay ?? 'now')
})

const view = computed<string>(() => {
	if (props.isWidget) {
		return widgetStore.widgetView
	}
	return route.params.view
})

const formattedSelectedDate = computed<string>(() => formatDateRange(selectedDate.value, view.value, settingsStore.momentLocale))

const previousLabel = computed(() => {
	switch (view.value) {
		case 'timeGridDay':
			return t('calendar', 'Previous day')

		case 'timeGridWeek':
			return t('calendar', 'Previous week')

		case 'multiMonthYear':
			return t('calendar', 'Previous year')

		case 'dayGridMonth':
		default:
			return t('calendar', 'Previous month')
	}
})

const nextLabel = computed(() => {
	switch (view.value) {
		case 'timeGridDay':
			return t('calendar', 'Next day')

		case 'timeGridWeek':
			return t('calendar', 'Next week')

		case 'multiMonthYear':
			return t('calendar', 'Next year')

		case 'dayGridMonth':
		default:
			return t('calendar', 'Next month')
	}
})

function navigateTimeRangeForward(): void {
	navigateTimeRangeByFactor(1)
}

function navigateTimeRangeBackward(): void {
	navigateTimeRangeByFactor(-1)
}

function navigateTimeRangeByFactor(factor: number): void {
	let newDate: Date | undefined

	switch (route.params.view) {
		case 'timeGridDay':
			newDate = modifyDate(selectedDate.value, {
				day: factor,
			})
			break

		case 'timeGridWeek':
			newDate = modifyDate(selectedDate.value, {
				week: factor,
			})
			break

		case 'multiMonthYear':
			newDate = modifyDate(selectedDate.value, {
				year: factor,
			})
			break

		case 'dayGridMonth':
		case 'listMonth':
		default: {
		// modifyDate is just adding one month, so we have to manually
		// set the date of month to 1. Otherwise if your date is set to
		// January 30th and you add one month, February 30th doesn't exist
		// and it automatically changes to March 1st. Same happens on March 31st.
			const firstDayOfCurrentMonth = new Date(selectedDate.value.getTime())
			firstDayOfCurrentMonth.setDate(1)
			newDate = modifyDate(firstDayOfCurrentMonth, {
				month: factor,
			})
			break
		}
	}

	// newDate is always set at this point
	// TODO: migrate modifyDate() to TypeScript to fix typing
	navigateToDate(newDate!)
}

async function navigateToDate(date: Date): Promise<void> {
	if (props.isWidget) {
		widgetStore.setWidgetDate({ widgetDate: getYYYYMMDDFromDate(date) })
	} else {
		// Don't push new route when day didn't change
		if (route.params.firstDay === getYYYYMMDDFromDate(date)) {
			return
		}

		const name = route.name!
		const params = {
			...route.params,
			firstDay: getYYYYMMDDFromDate(date),
		}

		await router.push({ name, params })
	}
}

function toggleDatepicker() {
	isDatepickerOpen.value = !isDatepickerOpen.value
}

useHotKey(['n', 'j'], () => navigateTimeRangeForward())
useHotKey(['p', 'k'], () => navigateTimeRangeBackward())
</script>

<template>
	<div class="datepicker-button-section">
		<NcButton
			v-if="!props.isWidget"
			:aria-label="isRTL ? nextLabel : previousLabel"
			:class="{ 'datepicker-button-section__right': isRTL, 'datepicker-button-section__left': !isRTL }"
			:name="isRTL ? nextLabel : previousLabel"
			@click="navigateTimeRangeBackward">
			<template #icon>
				<ChevronRightIcon v-if="isRTL" :size="22" />
				<ChevronLeftIcon v-else :size="22" />
			</template>
		</NcButton>
		<NcButton
			v-if="!props.isWidget"
			class="datepicker-button-section__datepicker-label datepicker-label"
			@click.stop.prevent="toggleDatepicker"
			@mousedown.stop.prevent="() => {}"
			@mouseup.stop.prevent="() => {}">
			{{ formattedSelectedDate }}
		</NcButton>
		<DatePicker
			:class="props.isWidget ? 'datepicker-widget' : 'datepicker-button-section__datepicker'"
			:append-to-body="props.isWidget"
			:date="selectedDate"
			:is-all-day="true"
			:open.sync="isDatepickerOpen"
			:type="view === 'multiMonthYear' ? 'year' : 'date'"
			@change="navigateToDate" />
		<NcButton
			v-if="!props.isWidget"
			:aria-label="isRTL ? previousLabel : nextLabel"
			:class="{ 'datepicker-button-section__right': !isRTL, 'datepicker-button-section__left': isRTL }"
			:name="isRTL ? previousLabel : nextLabel"
			@click="navigateTimeRangeForward">
			<template #icon>
				<ChevronLeftIcon v-if="isRTL" :size="22" />
				<ChevronRightIcon v-else :size="22" />
			</template>
		</NcButton>
	</div>
</template>

<style lang="scss">
.datepicker-widget{
	width: 135px;
    margin: 2px 5px 5px 5px;
}
</style>
