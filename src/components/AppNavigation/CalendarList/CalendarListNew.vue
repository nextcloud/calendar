<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { showError } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import {
	NcActionButton as ActionButton,
	NcActionInput as ActionInput,
	NcActionSeparator as ActionSeparator,
	NcActionText as ActionText,
	NcAppNavigationCaption,
} from '@nextcloud/vue'
import {
	computed,
	defineAsyncComponent,
	nextTick,
	ref,
	watch,
} from 'vue'
import CalendarBlank from 'vue-material-design-icons/CalendarBlankOutline.vue'
import CalendarCheck from 'vue-material-design-icons/CalendarCheckOutline.vue'
import LinkIcon from 'vue-material-design-icons/Link.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import Web from 'vue-material-design-icons/Web.vue'
import useCalendarsStore from '@/store/calendars.js'
import useSettingsStore from '@/store/settings.js'
import { uidToHexColor } from '@/utils/color.js'

const PublicCalendarSubscriptionPicker = defineAsyncComponent(() => import(/* webpackChunkName: "public-calendar-subscription-picker" */ '../../Subscription/PublicCalendarSubscriptionPicker.vue'))

const calendarsStore = useCalendarsStore()
const settingsStore = useSettingsStore()

// Open state
const isOpen = ref(false)
// New calendar
const showCreateCalendarLabel = ref(true)
const showCreateCalendarInput = ref(false)
const showCreateCalendarSaving = ref(false)
// New calendar with task list
const showCreateCalendarTaskListLabel = ref(true)
const showCreateCalendarTaskListInput = ref(false)
const showCreateCalendarTaskListSaving = ref(false)
// New subscription
const showCreateSubscriptionLabel = ref(true)
const showCreateSubscriptionInput = ref(false)
const showCreateSubscriptionSaving = ref(false)
const showHolidaySubscriptionPicker = ref(false)
const showPublicCalendarSubscriptionPicker = ref(false)

const canSubscribeLink = computed<boolean>(() => settingsStore.canSubscribeLink)
const hasPublicCalendars = computed<boolean>(() => Boolean(settingsStore.publicCalendars))

watch(isOpen, (newValue) => {
	if (newValue) {
		return
	}

	closeMenu()
})

/**
 * Updates the open state of the Actions menu
 *
 * @param value The new open state
 */
function setMenuOpen(value: boolean): void {
	isOpen.value = value
}

/**
 * Opens the Actions menu when clicking on the main item label
 */
function toggleDialog(): void {
	isOpen.value = !isOpen.value
}

/**
 * Opens the create calendar input
 */
function openCreateCalendarInput(): void {
	showCreateCalendarLabel.value = false
	showCreateCalendarInput.value = true
	showCreateCalendarSaving.value = false

	showCreateCalendarTaskListLabel.value = true
	showCreateCalendarTaskListInput.value = false

	showCreateSubscriptionLabel.value = true
	showCreateSubscriptionInput.value = false
}

/**
 * Opens the create calendar with task list input
 */
function openCreateCalendarTaskListInput(): void {
	showCreateCalendarTaskListLabel.value = false
	showCreateCalendarTaskListInput.value = true
	showCreateCalendarTaskListSaving.value = false

	showCreateCalendarLabel.value = true
	showCreateCalendarInput.value = false

	showCreateSubscriptionLabel.value = true
	showCreateSubscriptionInput.value = false
}

/**
 * Opens the create subscription input
 */
function openCreateSubscriptionInput(): void {
	showCreateSubscriptionLabel.value = false
	showCreateSubscriptionInput.value = true
	showCreateSubscriptionSaving.value = false

	showCreateCalendarLabel.value = true
	showCreateCalendarInput.value = false

	showCreateCalendarTaskListLabel.value = true
	showCreateCalendarTaskListInput.value = false
}

/**
 * Creates a new calendar
 *
 * @param event The submit event
 */
async function createNewCalendar(event: Event): Promise<void> {
	const displayName = (event.target as HTMLElement).querySelector<HTMLInputElement>('input[type=text]')?.value ?? ''

	if (!displayName.trim()) {
		showError(t('calendar', 'Calendar name can not be blank'))
		return
	}

	showCreateCalendarInput.value = false
	showCreateCalendarSaving.value = true

	try {
		await calendarsStore.appendCalendar({
			displayName,
			color: uidToHexColor(displayName),
		})
	} catch (error) {
		console.debug(error)
		showError(t('calendar', 'An error occurred, unable to create the calendar.'))
	} finally {
		showCreateCalendarSaving.value = false
		showCreateCalendarLabel.value = true
		isOpen.value = false
		closeMenu()
	}
}

/**
 * Creates a new calendar with task list
 *
 * @param event The submit event
 */
async function createNewCalendarTaskList(event: Event): Promise<void> {
	const displayName = (event.target as HTMLElement).querySelector<HTMLInputElement>('input[type=text]')?.value ?? ''

	if (!displayName.trim()) {
		showError(t('calendar', 'Calendar name can not be blank'))
		return
	}

	showCreateCalendarTaskListInput.value = false
	showCreateCalendarTaskListSaving.value = true

	try {
		await calendarsStore.appendCalendar({
			displayName,
			color: uidToHexColor(displayName),
			components: ['VEVENT', 'VTODO'],
		})
	} catch (error) {
		console.debug(error)
		showError(t('calendar', 'An error occurred, unable to create the calendar.'))
	} finally {
		showCreateCalendarTaskListSaving.value = false
		showCreateCalendarTaskListLabel.value = true
		isOpen.value = false
		closeMenu()
	}
}

/**
 * Creates a new subscription
 *
 * @param event The submit event
 */
async function createNewSubscription(event: Event): Promise<void> {
	const link = (event.target as HTMLElement).querySelector<HTMLInputElement>('input[type=text]')?.value.trim() ?? ''
	let url: URL
	let hostname: string
	try {
		url = new URL(link)
		hostname = url.hostname
	} catch (error) {
		console.error(error)
		showError(t('calendar', 'Please enter a valid link (starting with http://, https://, webcal://, or webcals://)'))
		return
	}

	showCreateSubscriptionInput.value = false
	showCreateSubscriptionSaving.value = true

	try {
		await calendarsStore.appendSubscription({
			displayName: hostname,
			color: uidToHexColor(link),
			source: link,
		})
	} catch (error) {
		console.debug(error)
		showError(t('calendar', 'An error occurred, unable to create the calendar.'))
	} finally {
		showCreateSubscriptionSaving.value = false
		showCreateSubscriptionLabel.value = true
		isOpen.value = false
		closeMenu()
	}
}

/**
 * Opens the public holiday calendar subscription picker
 */
async function openHolidaySubscriptionPicker(): Promise<void> {
	// Use nextTick to ensure the menu closes before opening the modal
	await nextTick()
	showHolidaySubscriptionPicker.value = true
}

/**
 * Opens the custom public calendar subscription picker
 */
async function openPublicCalendarSubscriptionPicker(): Promise<void> {
	// Use nextTick to ensure the menu closes before opening the modal
	await nextTick()
	showPublicCalendarSubscriptionPicker.value = true
}

/**
 * This resets the actions on close of menu
 */
function closeMenu(): void {
	showCreateCalendarLabel.value = true
	showCreateCalendarInput.value = false
	showCreateCalendarSaving.value = false
	showCreateCalendarTaskListLabel.value = true
	showCreateCalendarTaskListInput.value = false
	showCreateCalendarTaskListSaving.value = false
	showCreateSubscriptionLabel.value = true
	showCreateSubscriptionInput.value = false
	showCreateSubscriptionSaving.value = false
}
</script>

<template>
	<div>
		<NcAppNavigationCaption
			class="app-navigation-entry-new-calendar"
			:class="{ 'app-navigation-entry-new-calendar--open': isOpen }"
			:name="t('calendar', 'My calendars')"
			:menuOpen="isOpen"
			@update:menuOpen="setMenuOpen"
			@click.prevent.stop="toggleDialog">
			<template #actionsTriggerIcon>
				<Plus :size="20" :title="t('calendar', 'Add new')" decorative />
			</template>
			<template #actions>
				<ActionButton
					v-if="showCreateCalendarLabel"
					@click.prevent.stop="openCreateCalendarInput">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ t('calendar', 'New calendar') }}
				</ActionButton>
				<ActionInput
					v-if="showCreateCalendarInput"
					:aria-label="t('calendar', 'Name for new calendar')"
					@submit.prevent.stop="createNewCalendar">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
				</ActionInput>
				<ActionText
					v-if="showCreateCalendarSaving">
					<template #icon>
						<div class="icon icon-loading-small" />
					</template>
					{{ t('calendar', 'Creating calendar …') }}
				</ActionText>

				<ActionButton
					v-if="showCreateCalendarTaskListLabel"
					@click.prevent.stop="openCreateCalendarTaskListInput">
					<template #icon>
						<CalendarCheck :size="20" decorative />
					</template>
					{{ t('calendar', 'New calendar with task list') }}
				</ActionButton>
				<ActionInput
					v-if="showCreateCalendarTaskListInput"
					:aria-label="t('calendar', 'Name for new calendar')"
					@submit.prevent.stop="createNewCalendarTaskList">
					<template #icon>
						<CalendarCheck :size="20" decorative />
					</template>
				</ActionInput>
				<ActionText
					v-if="showCreateCalendarTaskListSaving">
					<template #icon>
						<div class="icon icon-loading-small" />
					</template>
					{{ t('calendar', 'Creating calendar …') }}
				</ActionText>

				<ActionSeparator v-if="canSubscribeLink" />
				<ActionButton
					v-if="showCreateSubscriptionLabel && canSubscribeLink"
					@click.prevent.stop="openCreateSubscriptionInput">
					<template #icon>
						<LinkIcon :size="20" decorative />
					</template>
					{{ t('calendar', 'New subscription from link (read-only)') }}
				</ActionButton>
				<ActionInput
					v-if="showCreateSubscriptionInput"
					:aria-label="t('calendar', 'Name for new calendar')"
					@submit.prevent.stop="createNewSubscription">
					<template #icon>
						<LinkIcon :size="20" decorative />
					</template>
				</ActionInput>
				<ActionText
					v-if="showCreateSubscriptionSaving">
					<template #icon>
						<div class="icon icon-loading-small" />
					</template>
					{{ t('calendar', 'Creating subscription …') }}
				</ActionText>
				<ActionButton
					v-if="canSubscribeLink"
					:closeAfterClick="true"
					@click="openHolidaySubscriptionPicker">
					{{ t('calendar', 'Add public holiday calendar') }}
					<template #icon>
						<Web :size="20" decorative />
					</template>
				</ActionButton>
				<ActionButton
					v-if="hasPublicCalendars"
					:closeAfterClick="true"
					@click="openPublicCalendarSubscriptionPicker">
					{{ t('calendar', 'Add custom public calendar') }}
					<template #icon>
						<Web :size="20" decorative />
					</template>
				</ActionButton>
			</template>
		</NcAppNavigationCaption>
		<PublicCalendarSubscriptionPicker
			v-if="showHolidaySubscriptionPicker"
			:showHolidays="true"
			@close="showHolidaySubscriptionPicker = false" />
		<PublicCalendarSubscriptionPicker
			v-if="showPublicCalendarSubscriptionPicker"
			@close="showPublicCalendarSubscriptionPicker = false" />
	</div>
</template>

<style scoped>
:deep(.action-item__menutoggle) {
	opacity: 1 !important;
}
</style>
