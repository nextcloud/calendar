<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { CalendarInterface } from '@/types/calendar.ts'

import { showError } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import { NcAppNavigationCaption, NcAppNavigationSpacer } from '@nextcloud/vue'
import debounce from 'debounce'
import pLimit from 'p-limit'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Draggable from 'vuedraggable'
import CalendarListItem from './CalendarList/CalendarListItem.vue'
import CalendarListItemLoadingPlaceholder from './CalendarList/CalendarListItemLoadingPlaceholder.vue'
import CalendarListNew from './CalendarList/CalendarListNew.vue'
import PublicCalendarListItem from './CalendarList/PublicCalendarListItem.vue'
import useCalendarsStore from '@/store/calendars.js'
import usePrincipalsStore from '@/store/principals.js'
import { isAfterVersion } from '@/utils/nextcloudVersion.ts'

interface DelegatedGroup {
	delegatorUrl: string
	displayname: string
	readOnly: boolean
	calendars: CalendarInterface[]
}

withDefaults(defineProps<{
	isPublic: boolean
	loadingCalendars?: boolean
}>(), {
	loadingCalendars: false,
})

const limit = pLimit(1)

const calendarsStore = useCalendarsStore()
const principalsStore = usePrincipalsStore()

const calendars = ref<CalendarInterface[]>([])

/**
 * Calendars sorted by personal, shared, deck, tasks, and delegated
 */
const sortedCalendars = reactive({
	personal: [] as CalendarInterface[],
	shared: [] as CalendarInterface[],
	deck: [] as CalendarInterface[],
	tasks: [] as CalendarInterface[],
	delegated: [] as CalendarInterface[],
})

const disableDragging = ref(false)

const serverCalendars = computed<CalendarInterface[]>(() => calendarsStore.sortedCalendarsSubscriptions)

const isDelegationSupported = computed(() => isAfterVersion(34))

/**
 * Delegated calendars grouped by the delegator (the user who granted
 * proxy access), which may differ from each calendar's owner when the
 * delegator only has access via a regular share.
 */
const delegatedGroups = computed<DelegatedGroup[]>(() => {
	const groups = new Map<string, DelegatedGroup>()
	for (const calendar of sortedCalendars.delegated) {
		const delegatorUrl = calendar.delegatorUrl || calendar.owner || ''
		if (!groups.has(delegatorUrl)) {
			const principal = principalsStore.getPrincipalByUrl(delegatorUrl)
			groups.set(delegatorUrl, {
				delegatorUrl,
				displayname: principal?.displayname || principal?.userId || '',
				readOnly: !!calendar.readOnly,
				calendars: [],
			})
		}
		groups.get(delegatorUrl)!.calendars.push(calendar)
	}
	return Array.from(groups.values())
})

/**
 * Sorts the calendars into the personal, shared, deck, tasks, and delegated groups
 */
function sortCalendars(): void {
	sortedCalendars.personal = []
	sortedCalendars.shared = []
	sortedCalendars.deck = []
	sortedCalendars.tasks = []
	sortedCalendars.delegated = []

	for (const calendar of calendars.value) {
		if (calendar.isDelegated) {
			sortedCalendars.delegated.push(calendar)
			continue
		}

		if (calendar.isSharedWithMe) {
			sortedCalendars.shared.push(calendar)
			continue
		}

		if (calendar.url.includes('app-generated--deck--board')) {
			sortedCalendars.deck.push(calendar)
			continue
		}

		if (calendar.supportsTasks && !calendar.supportsEvents && !calendar.supportsJournals) {
			sortedCalendars.tasks.push(calendar)
			continue
		}

		sortedCalendars.personal.push(calendar)
	}
}

/**
 * Persists the new calendar list order after a drag and drop operation
 */
async function update(): Promise<void> {
	disableDragging.value = true
	const currentCalendars = [
		...sortedCalendars.personal,
		...sortedCalendars.shared,
		...sortedCalendars.deck,
		...sortedCalendars.tasks,
	]
	const newOrder = currentCalendars.reduce<Record<string, number>>((newOrderObj, currentItem, currentIndex) => {
		newOrderObj[currentItem.id] = currentIndex
		return newOrderObj
	}, {})

	calendars.value = currentCalendars

	try {
		await limit(() => calendarsStore.updateCalendarListOrder({ newOrder }))
	} catch (error) {
		console.error(error)
		showError(t('calendar', 'Could not update calendar order.'))
		// Reset calendar list order on error
		calendars.value = calendarsStore.sortedCalendarsSubscriptions
	} finally {
		disableDragging.value = false
	}
}

const updateInput = debounce(update, 2500)

watch(serverCalendars, (val) => {
	calendars.value = val
})

watch(calendars, () => {
	sortCalendars()
})

onMounted(() => {
	calendarsStore.$onAction(({ name, args, after }) => {
		if (name === 'toggleCalendarEnabled') {
			after(() => {
				const calendar = calendars.value.find((calendar) => calendar.id === args[0].calendar.id)
				if (calendar) {
					calendar.enabled = args[0].calendar.enabled
				}
				sortCalendars()
				update()
			})
		}
	})
})
</script>

<template>
	<div class="calendar-list-wrapper">
		<CalendarListNew />
		<template v-if="!isPublic">
			<Draggable
				v-model="sortedCalendars.personal"
				itemKey="id"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<template #item="{ element: calendar }">
					<CalendarListItem
						:key="calendar.id"
						class="draggable-calendar-list-item"
						:calendar="calendar" />
				</template>
			</Draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.personal"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationCaption v-if="sortedCalendars.shared.length" :name="t('calendar', 'Shared calendars')" />
		<template v-if="!isPublic">
			<Draggable
				v-model="sortedCalendars.shared"
				itemKey="id"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<template #item="{ element: calendar }">
					<CalendarListItem
						:key="calendar.id"
						class="draggable-calendar-list-item"
						:calendar="calendar" />
				</template>
			</Draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.shared"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationCaption v-if="sortedCalendars.deck.length" :name="t('calendar', 'Deck')" />
		<template v-if="!isPublic">
			<Draggable
				v-model="sortedCalendars.deck"
				itemKey="id"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<template #item="{ element: calendar }">
					<CalendarListItem
						:key="calendar.id"
						class="draggable-calendar-list-item"
						:calendar="calendar" />
				</template>
			</Draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.deck"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<NcAppNavigationCaption v-if="sortedCalendars.tasks.length" :name="t('calendar', 'Tasks')" />
		<template v-if="!isPublic">
			<Draggable
				v-model="sortedCalendars.tasks"
				itemKey="id"
				:disabled="disableDragging"
				v-bind="{ swapThreshold: 0.30, delay: 500, delayOnTouchOnly: true, touchStartThreshold: 3 }"
				draggable=".draggable-calendar-list-item"
				@update="updateInput">
				<template #item="{ element: calendar }">
					<CalendarListItem
						:key="calendar.id"
						class="draggable-calendar-list-item"
						:calendar="calendar" />
				</template>
			</Draggable>
		</template>
		<template v-else>
			<PublicCalendarListItem
				v-for="calendar in sortedCalendars.tasks"
				:key="calendar.id"
				:calendar="calendar" />
		</template>

		<template v-if="!isPublic && isDelegationSupported && sortedCalendars.delegated.length">
			<template v-for="group in delegatedGroups" :key="group.delegatorUrl">
				<NcAppNavigationCaption
					:name="group.readOnly
						? t('calendar', 'Delegated by {name} (read-only)', { name: group.displayname })
						: t('calendar', 'Delegated by {name}', { name: group.displayname })" />
				<CalendarListItem
					v-for="calendar in group.calendars"
					:key="calendar.id"
					:calendar="calendar" />
			</template>
		</template>

		<NcAppNavigationSpacer />

		<!-- The header slot must be placed here, otherwise vuedraggable adds undefined as item to the array -->
		<template>
			<CalendarListItemLoadingPlaceholder v-if="loadingCalendars" />
		</template>
	</div>
</template>
