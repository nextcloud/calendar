<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<NcModal
			v-if="modalVisible"
			class="proposal-modal__content"
			:name="modalTitle"
			:title="modalTitle"
			:size="modalSize"
			@close="onModalClose()">
			<!-- Show proposal viewer -->
			<div v-if="modalMode === 'view'" class="proposal-viewer__content">
				<div class="proposal-viewer__content-title">
					{{ selectedProposal?.title }}
				</div>
				<div class="proposal-viewer__content-description">
					{{ selectedProposal?.description || t('calendar', 'No Description') }}
				</div>
				<div class="proposal-viewer__content-location">
					<LocationIcon />
					{{ selectedProposal?.location || t('calendar', 'No Location') }}
				</div>
				<div class="proposal-viewer__content-details">
					<div class="proposal-viewer__content-duration-and-actions">
						<div class="proposal-viewer__content-duration">
							<DurationIcon />
							{{ selectedProposal?.duration ? selectedProposal.duration + ' min' : '-' }}
						</div>
						<div class="proposal-viewer__content-actions">
							<NcButton
								variant="tertiary"
								:title="t('calendar', 'Edit this meeting proposal')"
								@click="onProposalModify()">
								<template #icon>
									<EditIcon />
								</template>
								{{ t('calendar', 'Edit') }}
							</NcButton>
							<NcButton
								variant="tertiary"
								:title="t('calendar', 'Delete this meeting proposal')"
								@click="onProposalDestroy(selectedProposal)">
								<template #icon>
									<DeleteIcon />
								</template>
								{{ t('calendar', 'Delete') }}
							</NcButton>
						</div>
					</div>
				</div>
				<!-- Responses Matrix Row -->
				<div v-if="selectedProposal" class="proposal-viewer__content-matrix">
					<ProposalResponseMatrix
						mode="organizer"
						:proposal="selectedProposal"
						:timezoneId="userTimezone"
						@dateConvert="onProposalConvert" />
				</div>
			</div>
			<!-- Show proposal editor -->
			<div v-if="modalMode === 'create' || modalMode === 'modify'" class="proposal-editor__content">
				<div class="proposal-editor__column-left">
					<!-- Row 1: Title -->
					<div class="proposal-editor__row-title">
						<h2>{{ modalEditLabel }}</h2>
					</div>
					<!-- Row 2: Details -->
					<div class="proposal-editor__row-details">
						<NcTextField
							v-model="selectedProposal.title"
							class="proposal-editor__proposal-title"
							:label="t('calendar', 'Title')" />
						<NcTextArea
							v-model="selectedProposal.description"
							class="proposal-editor__proposal-description"
							:label="t('calendar', 'Description')" />
						<div class="proposal-editor__proposal-location-container">
							<NcTextField
								v-if="!settingsStore.talkEnabled || !modalEditLocationState"
								class="proposal-editor__proposal-location"
								:label="t('calendar', 'Location')"
								:modelValue="selectedProposal.location" />
							<NcCheckboxRadioSwitch
								v-if="settingsStore.talkEnabled"
								class="proposal-editor__proposal-location-selector"
								variant="secondary"
								:modelValue="modalEditLocationState"
								@update:modelValue="onProposalLocationTypeToggle">
								{{ t('calendar', 'Add Talk conversation') }}
							</NcCheckboxRadioSwitch>
						</div>
						<DurationSelector
							class="proposal-editor__proposal-duration"
							:modelValue="selectedProposal.duration"
							@update:modelValue="changeDuration" />
						<NcCheckboxRadioSwitch
							class="proposal-editor__proposal-response-notify"
							:modelValue="selectedProposal.responseNotify"
							@update:modelValue="onProposalResponseNotifyToggle">
							{{ t('calendar', 'Notify me when participants respond') }}
						</NcCheckboxRadioSwitch>
						<InviteesListSearch
							class="proposal-editor__proposal-participants-selector"
							:alreadyInvitedEmails="existingParticipantAddressess"
							@addAttendee="onProposalParticipantAdd" />
						<div v-if="selectedProposal.participants.length > 0" class="proposal-editor__proposal-participants">
							<h6>{{ t('calendar', 'Participants') }}</h6>
							<ProposalParticipantItem
								v-for="(participant, idx) in selectedProposal.participants"
								:key="idx"
								:proposalParticipant="participant"
								@participantAttendance="onProposalParticipantAttendance(participant.address, $event)"
								@participantRemove="onProposalParticipantRemove(participant.address)" />
						</div>
						<div v-if="selectedProposal.dates.length > 0" class="proposal-editor__proposed-dates">
							<h6>{{ t('calendar', 'Selected times') }}</h6>
							<ProposalDateItem
								v-for="(entry, idx) in selectedProposal.dates"
								:key="idx"
								:proposalDate="entry"
								:timezoneId="userTimezone"
								@dateFocus="onProposalDateFocus(entry)"
								@dateRemove="onProposalDateRemove(idx)" />
						</div>
					</div>
					<!-- Row 3: Actions -->
					<div class="proposal-editor__row-actions">
						<NcButton
							class="proposal-editor__save-button"
							variant="primary"
							:disabled="!modalEditSaveState"
							@click="onProposalSave()">
							{{ modalEditSaveLabel }}
						</NcButton>
						<NcButton
							v-if="modalEditDestroyState"
							variant="secondary"
							@click="onProposalDestroy(selectedProposal)">
							Delete
						</NcButton>
					</div>
				</div>
				<div class="proposal-editor__column-right">
					<div class="proposal-editor__calendar-actions">
						<NcButton variant="secondary" @click="onCalendarFocusToday()">
							{{ t('calendar', 'Today') }}
						</NcButton>
						<NcButton
							variant="secondary"
							:aria-label="t('calendar', 'Previous span')"
							@click="onCalendarSpanPrevious()">
							<template #icon>
								<PreviousSpanIcon />
							</template>
						</NcButton>
						<NcButton
							variant="secondary"
							:aria-label="t('calendar', 'Next span')"
							@click="onCalendarSpanNext()">
							<template #icon>
								<NextSpanIcon />
							</template>
						</NcButton>
						<h2>{{ calendarDateRange }}</h2>
						<NcButton
							variant="secondary"
							:aria-label="t('calendar', 'Less days')"
							@click="onCalendarSpanIncrease()">
							<template #icon>
								<ZoomInIcon />
							</template>
						</NcButton>
						<NcButton
							variant="secondary"
							:aria-label="t('calendar', 'More days')"
							@click="onCalendarSpanDecrease()">
							<template #icon>
								<ZoomOutIcon />
							</template>
						</NcButton>
					</div>
					<FullCalendar
						ref="proposalFullCalendar"
						:options="calendarConfiguration"
						class="proposal-editor__calendar" />
				</div>
			</div>
		</NcModal>

		<NcDialog
			:open="showDeleteDialog"
			:name="t('calendar', 'Delete proposal')"
			:message="deleteDialogMessage"
			:buttons="deleteDialogButtons"
			@update:open="showDeleteDialog = $event" />

		<NcDialog
			:open="showConvertDialog"
			:name="t('calendar', 'Create meeting')"
			:message="convertDialogMessage"
			:buttons="convertDialogButtons"
			@update:open="showConvertDialog = $event" />
	</div>
</template>

<script setup lang="ts">
import type { Calendar, CalendarOptions, DateSelectArg, DatesSetArg, EventDropArg } from '@fullcalendar/core'
import type { Proposal } from '@/models/proposals/proposals'
import type { ProposalParticipantAttendance } from '@/types/proposals/proposalEnums'

import FullCalendarInteraction from '@fullcalendar/interaction'
import FullCalendarTimeGrid from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { AttendeeProperty } from '@nextcloud/calendar-js'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import PreviousSpanIcon from 'vue-material-design-icons/ChevronLeft'
import NextSpanIcon from 'vue-material-design-icons/ChevronRight'
import DurationIcon from 'vue-material-design-icons/ClockOutline'
import ZoomOutIcon from 'vue-material-design-icons/MagnifyMinusOutline'
// icons
import ZoomInIcon from 'vue-material-design-icons/MagnifyPlusOutline'
import LocationIcon from 'vue-material-design-icons/MapMarkerOutline'
import EditIcon from 'vue-material-design-icons/PencilOutline'
import DeleteIcon from 'vue-material-design-icons/TrashCanOutline'
// components
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcDialog from '@nextcloud/vue/components/NcDialog'
import NcModal from '@nextcloud/vue/components/NcModal'
import NcTextArea from '@nextcloud/vue/components/NcTextArea'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import DurationSelector from '@/components/Editor/DurationSelector.vue'
import InviteesListSearch from '@/components/Editor/Invitees/InviteesListSearch.vue'
import ProposalDateItem from '@/components/Proposal/ProposalDateItem.vue'
import ProposalParticipantItem from '@/components/Proposal/ProposalParticipantItem.vue'
import ProposalResponseMatrix from '@/components/Proposal/ProposalResponseMatrix.vue'
import { getFullCalendarLocale } from '@/fullcalendar/localization/localeProvider.js'
import FullCalendarMoment from '@/fullcalendar/localization/momentPlugin.js'
import FullCalendarTimezones from '@/fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
import { ProposalDate, ProposalParticipant } from '@/models/proposals/proposals'
import { getBusySlots } from '@/services/freeBusySlotService.js'
// types, object and stores
import usePrincipalStore from '@/store/principals.js'
import useProposalStore from '@/store/proposalStore'
import useSettingsStore from '@/store/settings.js'
import { ProposalParticipantRealm } from '@/types/proposals/proposalEnums'
import logger from '@/utils/logger.js'

// Helper interface for participants emitted by InviteesListSearch
interface ParticipantSearchInterface {
	calendarUserType: 'INDIVIDUAL' | 'GROUP'
	email: string
	commonName?: string
	isUser?: boolean
}

// Helper interface for busy slots of a participant generated by getBusySlots
interface ParticipantBusySlotInterface {
	id: string
	resourceId: string
	start: string | Date
	end: string | Date
	[key: string]: unknown
}

const principalStore = usePrincipalStore()
const settingsStore = useSettingsStore()
const proposalStore = useProposalStore()

const fullCalendarRef = useTemplateRef<InstanceType<typeof FullCalendar>>('proposalFullCalendar')

const modalMode = ref<'view' | 'create' | 'modify'>('view')
const calendarApi = ref<Calendar | null>(null)
const selectedProposal = ref<Proposal | null>(null)
const participantAvailability = ref<Record<string, Record<string, ParticipantBusySlotInterface>>>({}) // availability per participant
const participantColors = ref<Record<string, string>>({})

const calendarColumnWidthMin = 80 // Minimum day column width
const calendarColumnWidthStep = 40 // Pixel change per zoom action
const calendarSpanMax = 28 // Maximum days that can be shown
const calendarSpanMin = 1 // Minimum days that can be shown

const calendarColumnWidth = ref(120) // Current pixel width allocated per day column
const calendarSpanDays = ref(7) // Currently applied span (derived)
const calendarRangeStart = ref<Date | null>(null) // Reactive copy of the calendar view's active start
const calendarRangeEnd = ref<Date | null>(null) // Reactive copy of the calendar view's active end
const screenWidth = ref(window.innerWidth) // Track screen width

const showDeleteDialog = ref(false)
const pendingDeleteProposal = ref<Proposal | null>(null)
const showConvertDialog = ref(false)
const pendingConvertDate = ref<ProposalDate | null>(null)

const userTimezone = computed<string>(() => settingsStore?.getResolvedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')

const modalVisible = computed<boolean>(() => proposalStore.modalVisible)

const modalSize = computed<string>(() => modalMode.value === 'view' ? 'normal' : 'full')

const modalTitle = computed<string>(() => {
	switch (modalMode.value) {
		case 'view':
			return t('calendar', 'Meeting proposals overview')
		case 'modify':
			return t('calendar', 'Edit meeting proposal')
		default:
			return t('calendar', 'Create meeting proposal')
	}
})

const modalEditLabel = computed<string>(() => !selectedProposal.value || selectedProposal.value.id ? t('calendar', 'Update meeting proposal') : t('calendar', 'Create meeting proposal'))

const modalEditSaveLabel = computed<string>(() => !selectedProposal.value || selectedProposal.value.id ? t('calendar', 'Update') : t('calendar', 'Create'))

const modalEditSaveState = computed<boolean>(() => {
	if (!selectedProposal.value) {
		// disable if no proposal selected
		return false
	}
	return (
		selectedProposal.value.title !== null
		&& selectedProposal.value.duration > 0
		&& selectedProposal.value.participants.length > 0
		&& selectedProposal.value.dates.length > 0
	)
})

const modalEditDestroyState = computed<boolean>(() => !selectedProposal.value || selectedProposal.value.id !== null)

const modalEditLocationState = computed<boolean>(() => {
	if (!selectedProposal.value) {
		return false
	}
	return selectedProposal.value.location === 'Talk conversation'
})

/**
 * Configuration options for FullCalendar
 * Please see https://fullcalendar.io/docs#toc for details
 */
const calendarConfiguration = computed<CalendarOptions>(() => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	return {
		plugins: [
			FullCalendarTimeGrid,
			FullCalendarInteraction,
			FullCalendarMoment,
			FullCalendarTimezones,
		],

		...getFullCalendarLocale(),
		headerToolbar: false,
		initialView: 'timeGridSpan',
		views: {
			timeGridSpan: {
				type: 'timeGrid',
				duration: { days: calendarSpanDays.value },
			},
		},

		dayHeaderFormat: { weekday: 'short', day: 'numeric' },
		allDaySlot: false,
		timeZone: userTimezone.value,
		slotDuration: '00:15:00',
		validRange: {
			start: today,
		},

		nowIndicator: true,
		eventOverlap: true,
		eventOrderStrict: true,
		eventOrder: 'duration,title',
		selectable: true,
		selectMirror: true,
		select: (info: DateSelectArg) => onProposalDateAdd(info),
		eventDrop: (info: EventDropArg) => onProposalDateMove(info),
		datesSet: (info: DatesSetArg) => {
			if (!modalVisible.value) {
				return
			}
			// Initialize calendar API when the calendar view is ready
			initializeCalendar()
			if (!calendarApi.value) {
				return
			}
			// Keep a reactive copy of the active range so calendarDateRange updates
			calendarRangeStart.value = info.view.activeStart
			calendarRangeEnd.value = info.view.activeEnd
			fetchParticipantAvailability()
		},
	}
})

const pendingConvertDateString = computed<string>(() => pendingConvertDate.value ? formatProposalDate(pendingConvertDate.value.date) : '')

const deleteDialogMessage = computed<string>(() => {
	const title = pendingDeleteProposal.value?.title ?? t('calendar', 'No title')
	return t('calendar', 'Are you sure you want to delete "{title}"?', { title })
})

const convertDialogMessage = computed<string>(() => t('calendar', 'Create a meeting for "{date}"? This will create a calendar event with all participants.', { date: pendingConvertDateString.value }))

const deleteDialogButtons = computed(() => [
	{
		label: t('calendar', 'Delete'),
		variant: 'secondary',
		callback: () => destroyProposal(),
	},
	{
		label: t('calendar', 'Cancel'),
		variant: 'primary',
		callback: () => { showDeleteDialog.value = false },
	},
])

const convertDialogButtons = computed(() => [
	{
		label: t('calendar', 'Cancel'),
		variant: 'secondary',
		callback: () => { showConvertDialog.value = false },
	},
	{
		label: t('calendar', 'Create meeting'),
		variant: 'primary',
		callback: () => convertProposal(),
	},
])

const existingParticipantAddressess = computed<string[]>(() => selectedProposal.value ? selectedProposal.value.participants.map((p) => p.address) : [])

const calendarDateSpan = computed<number>(() => {
	// Approximate available width (screen minus left column/gutters)
	const availableWidth = Math.max(0, screenWidth.value - 400)
	const calculatedDays = Math.floor(availableWidth / calendarColumnWidth.value)
	return Math.max(calendarSpanMin, Math.min(calendarSpanMax, calculatedDays))
})

const calendarDateRange = computed<string>(() => {
	if (!calendarRangeStart.value || !calendarRangeEnd.value) {
		return ''
	}

	const start = calendarRangeStart.value
	const end = new Date(calendarRangeEnd.value.getTime() - 1) // Subtract 1ms to get the last day shown

	// Format start date
	const startFormatted = moment(start).format('MMMM D')

	// If same month, just show day number for end
	if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
		return `${startFormatted} to ${end.getDate()}`
	}

	// Different months or years, show full format for both
	const endFormatted = moment(end).format('MMMM D')
	if (start.getFullYear() !== end.getFullYear()) {
		return `${moment(start).format('MMMM D, YYYY')} to ${moment(end).format('MMMM D, YYYY')}`
	}

	return `${startFormatted} to ${endFormatted}`
})

function onWindowResize(): void {
	screenWidth.value = window.innerWidth
}

function onModalOpen(): void {
	selectedProposal.value = proposalStore.modalProposal as Proposal | null
	modalMode.value = proposalStore.modalMode

	// Ensure proposal has default values to prevent null binding errors
	if (selectedProposal.value) {
		selectedProposal.value.title = selectedProposal.value.title || ''
		selectedProposal.value.description = selectedProposal.value.description || ''
		selectedProposal.value.location = selectedProposal.value.location || ''
		selectedProposal.value.duration = selectedProposal.value.duration || 30
	}

	// Wait for the FullCalendar component to be mounted before trying to initialize API
	nextTick(() => {
		initializeCalendar()
		// Calendar not ready yet, try again after a short delay
		if (!calendarApi.value) {
			setTimeout(() => {
				initializeCalendar()
			}, 100)
		}
	})
}

function onModalClose(): void {
	proposalStore.hideModal()
	selectedProposal.value = null
	modalMode.value = 'view'
	participantAvailability.value = {}
	if (calendarApi.value) {
		calendarApi.value.removeAllEvents()
		calendarApi.value.unselect()
		calendarApi.value = null
	}
}

function onProposalModify(): void {
	modalMode.value = 'modify'
}

function onProposalDestroy(proposal: Proposal): void {
	pendingDeleteProposal.value = proposal
	showDeleteDialog.value = true
}

async function onProposalSave(): Promise<void> {
	try {
		if (!selectedProposal.value) {
			return logger.error('No proposal selected for this operation')
		}
		showSuccess(t('calendar', 'Saving proposal "{title}"', { title: selectedProposal.value.title ?? t('calendar', 'No title') }))
		await proposalStore.storeProposal(selectedProposal.value)
		showSuccess(t('calendar', 'Successfully saved proposal'))
		onModalClose()
	} catch (error) {
		showError(t('calendar', 'Failed to save proposal'))
		logger.error('Failed to save proposal:', { error })
	}
}

function onProposalConvert(date: ProposalDate): void {
	if (!selectedProposal.value || !date.date) {
		return logger.error('No proposal selected or invalid date for meeting conversion')
	}
	pendingConvertDate.value = date
	showConvertDialog.value = true
}

function onProposalLocationTypeToggle(): void {
	if (!selectedProposal.value) {
		return
	}
	if (selectedProposal.value.location === 'Talk conversation') {
		selectedProposal.value.location = ''
	} else {
		selectedProposal.value.location = 'Talk conversation'
	}
}

function onProposalResponseNotifyToggle(value: boolean): void {
	if (!selectedProposal.value) {
		return
	}
	selectedProposal.value.responseNotify = value
}

function onProposalParticipantAdd(participant: ParticipantSearchInterface): void {
	if (participant.calendarUserType === 'INDIVIDUAL') {
		return addParticipant(participant)
	}
	if (participant.calendarUserType === 'GROUP') {
		return addGroup(participant)
	}
}

function onProposalParticipantRemove(address: string): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	removeParticipant(address)
}

function onProposalParticipantAttendance(address: string, attendance: ProposalParticipantAttendance): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	const participant = selectedProposal.value.participants.find((p) => p.address === address)
	if (participant) {
		participant.attendance = attendance
	} else {
		logger.error('Participant not found:', { address })
	}
}

function onProposalDateAdd(info: DateSelectArg): void {
	// validate duration
	const duration = parseInt(String(selectedProposal.value?.duration ?? ''), 10)
	if (isNaN(duration) || duration <= 0) {
		showError(t('calendar', 'Please enter a valid duration in minutes.'))
		return
	}
	addProposedDate(info.start)
	// Clear selection in FullCalendar and re-render view
	calendarApi.value?.unselect()
}

function onProposalDateMove(info: EventDropArg): void {
	// Only handle drag for proposed dates
	if (info.event.extendedProps && info.event.extendedProps.proposedDate) {
		changeProposedDate(info.event.extendedProps.proposedDateId, info.event.start as Date)
	}
}

function onProposalDateRemove(index: number): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	if (selectedProposal.value.dates[index] === undefined) {
		return logger.error('Can not remove proposed date, index value is invalid: ', { index })
	}
	selectedProposal.value.dates.splice(index, 1)
	renderParticipantAvailability()
}

function onProposalDateFocus(date: ProposalDate): void {
	if (!calendarApi.value || !date) {
		return logger.warn('Calendar API not available or invalid date')
	}
	// Focus the calendar on the specific date
	calendarApi.value.gotoDate(date.date as Date)
}

function onCalendarFocusToday(): void {
	if (!calendarApi.value) {
		return logger.error('Calendar API not initialized')
	}
	calendarApi.value.today()
}

function onCalendarSpanPrevious(): void {
	if (!calendarApi.value) {
		return logger.error('Calendar API not initialized')
	}
	calendarApi.value.prev()
}

function onCalendarSpanNext(): void {
	if (!calendarApi.value) {
		return logger.error('Calendar API not initialized')
	}
	calendarApi.value.next()
}

function onCalendarSpanDecrease(): void {
	calendarColumnWidth.value = Math.max(calendarColumnWidthMin, calendarColumnWidth.value - calendarColumnWidthStep)
}

function onCalendarSpanIncrease(): void {
	calendarColumnWidth.value = calendarColumnWidth.value + calendarColumnWidthStep
}

function initializeCalendar(): void {
	// Initialize the calendar API from the FullCalendar component reference
	if (fullCalendarRef.value && !calendarApi.value) {
		calendarApi.value = fullCalendarRef.value.getApi()
	}
}

async function destroyProposal(): Promise<void> {
	const proposal = pendingDeleteProposal.value
	showDeleteDialog.value = false
	pendingDeleteProposal.value = null
	if (!proposal) {
		return
	}
	try {
		showSuccess(t('calendar', 'Deleting proposal "{title}"', { title: proposal.title ?? t('calendar', 'No title') }))
		await proposalStore.destroyProposal(proposal)
		showSuccess(t('calendar', 'Successfully deleted proposal'))
		onModalClose()
	} catch (error) {
		showError(t('calendar', 'Failed to delete proposal'))
		logger.error('Failed to delete proposal:', { error })
	}
}

async function convertProposal(): Promise<void> {
	const date = pendingConvertDate.value
	showConvertDialog.value = false
	pendingConvertDate.value = null
	if (!selectedProposal.value || !date) {
		return
	}
	const dateString = formatProposalDate(date.date)
	try {
		showSuccess(t('calendar', 'Creating meeting for {date}', { date: dateString }))
		await proposalStore.convertProposal(selectedProposal.value, date, userTimezone.value)
		showSuccess(t('calendar', 'Successfully created meeting for {date}', { date: dateString }))
		onModalClose()
	} catch (error) {
		showError(t('calendar', 'Failed to create a meeting for {date}', { date: dateString }))
		logger.error('Failed to create a meeting:', { error })
	}
}

function changeDuration(duration: number): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	// Validate duration value
	if (isNaN(duration) || duration <= 0) {
		selectedProposal.value.duration = 0
		return logger.error('Invalid duration value:', { duration })
	}
	selectedProposal.value.duration = duration
	// Refresh calendar view
	renderParticipantAvailability()
}

function addParticipant(participant: ParticipantSearchInterface): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	if (!participant.email) {
		return
	}
	// add the participant to the proposal
	const newParticipant = new ProposalParticipant()
	newParticipant.address = participant.email
	newParticipant.name = participant.commonName || participant.email
	newParticipant.realm = participant.isUser ? ProposalParticipantRealm.Internal : ProposalParticipantRealm.External
	selectedProposal.value.participants.push(newParticipant)
	// generate a unique color for the participant
	participantColors.value[newParticipant.address] = generateParticipantColor(newParticipant.address)
	// retrieve availability for the new participant
	fetchParticipantAvailability(newParticipant)
}

function removeParticipant(address: string): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	// remove the participant's availability data
	if (participantAvailability.value[address]) {
		delete participantAvailability.value[address]
	}
	// remove the participant from the proposal
	selectedProposal.value.participants = selectedProposal.value.participants.filter((p) => p.address !== address)
	// update the calendar availability
	renderParticipantAvailability()
}

function addGroup(participant: ParticipantSearchInterface): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	if (!participant.email) {
		return
	}
	// add the group as a participant
	const newParticipant = new ProposalParticipant()
	newParticipant.address = participant.email
	newParticipant.name = participant.commonName || participant.email
	newParticipant.realm = participant.isUser ? ProposalParticipantRealm.Internal : ProposalParticipantRealm.External

	selectedProposal.value.participants.push(newParticipant)
}

function addProposedDate(date: Date): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	const newProposalDate = new ProposalDate()
	newProposalDate.date = date
	selectedProposal.value.dates.push(newProposalDate)
	selectedProposal.value.dates.sort((a, b) => {
		if (!a.date || !b.date) {
			return 0
		}
		return a.date.getTime() - b.date.getTime()
	})
	// Refresh calendar view
	renderParticipantAvailability()
}

function changeProposedDate(index: number, date: Date): void {
	if (!selectedProposal.value) {
		return logger.error('No proposal selected for this operation')
	}
	if (selectedProposal.value.dates[index] === undefined) {
		return logger.error('Can not change proposed date, index value is invalid: ', { index })
	}
	selectedProposal.value.dates[index].date = date
	// Force Vue to recognize the change for reactivity
	selectedProposal.value.dates = [...selectedProposal.value.dates]

	renderParticipantAvailability()
}

async function fetchParticipantAvailability(participant: ProposalParticipant | null = null): Promise<void> {
	// Check if calendar API is available
	if (!calendarApi.value) {
		logger.warn('Calendar API not available, skipping availability fetch')
		return
	}

	// Get start and end from FullCalendar's current view
	const view = calendarApi.value.view
	const start = view.activeStart
	const end = view.activeEnd
	const timeZoneId = userTimezone.value
	// Use current user for organizer
	const principal = principalStore.getCurrentUserPrincipal
	if (!principal) {
		logger.error('No current user found cannot retrieve availability data')
		return
	}
	const organizer = AttendeeProperty.fromNameAndEMail(principal.displayname || '', principal.emailAddress || '', true)
	const attendees: Array<{ name: string, email: string, isOrganizer: boolean }> = []
	if (participant) {
		if (participant.realm !== ProposalParticipantRealm.Internal) {
			logger.warn('Skipping availability fetch for non-internal participant:', { participant })
			return
		}
		attendees.push(AttendeeProperty.fromNameAndEMail(participant.name, participant.address, false))
	} else if (selectedProposal.value) {
		selectedProposal.value.participants.forEach((p) => {
			if (p.realm !== ProposalParticipantRealm.Internal) {
				logger.warn('Skipping availability fetch for non-internal participant:', { p })
				return
			}
			attendees.push(AttendeeProperty.fromNameAndEMail(p.name, p.address, false))
		})
	}
	// fetch availability data
	const { events, error } = await getBusySlots(organizer, attendees, start, end, timeZoneId) as { events: ParticipantBusySlotInterface[], error?: unknown }
	if (error) {
		logger.error('Failed to fetch free/busy data:', { error })
		showError(t('calendar', 'Failed to fetch free/busy data'))
		return
	}
	// Remove existing availability data for the organizer and participant(s)
	// This is necessary to avoid duplicate entries as busy slots are returned with a different event id every time
	attendees.forEach((attendee) => {
		delete participantAvailability.value[attendee.email]
	})
	delete participantAvailability.value[organizer.email]
	// Separate availability data per participant
	events.forEach((event) => {
		let resourceId = event.resourceId
		if (resourceId.startsWith('mailto:')) {
			resourceId = resourceId.replace('mailto:', '')
		}
		if (!participantAvailability.value[resourceId]) {
			participantAvailability.value[resourceId] = {}
		}
		participantAvailability.value[resourceId][event.id] = event
	})
	renderParticipantAvailability()
}

function renderParticipantAvailability(): void {
	// Check if calendar API is available
	if (!calendarApi.value) {
		logger.warn('Calendar API not available, skipping render')
		return
	}

	// Clear all existing events
	calendarApi.value.removeAllEvents()

	// Render individual participant busy slots
	Object.entries(participantAvailability.value).forEach(([participantId, participantSlots]) => {
		const participantColor = participantColors.value[participantId] || generateParticipantColor(participantId)

		// Clean up the participant ID for display (remove mailto: prefix if present)
		let displayId = participantId
		if (displayId.startsWith('mailto:')) {
			displayId = displayId.replace('mailto:', '')
		}

		// Add each busy slot as an individual event with participant-specific styling
		Object.values(participantSlots).forEach((slot) => {
			const eventDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime()
			const zIndex = Math.max(1, 1000 - Math.floor(eventDuration / 60000)) // Longer events get lower z-index

			calendarApi.value?.addEvent({
				title: displayId.split('@')[0], // Show just the name part of email
				start: new Date(slot.start),
				end: new Date(slot.end),
				allDay: false,
				display: 'background',
				backgroundColor: participantColor,
				borderColor: 'transparent',
				textColor: '#fff',
				zIndex,
				classNames: [`participant-busy-${participantId.replace(/[^a-zA-Z0-9]/g, '-')}`],
				extendedProps: {
					participantBusy: true,
					participantId,
				},
			})
		})
	})

	// Add proposed dates
	const duration = selectedProposal.value?.duration ?? 10
	selectedProposal.value?.dates.forEach((proposalDate, index) => {
		if (!proposalDate.date) {
			return
		}
		calendarApi.value?.addEvent({
			id: `proposed-date-${index}`,
			title: t('calendar', 'Selected'),
			start: proposalDate.date,
			end: new Date(proposalDate.date.getTime() + duration * 60000),
			backgroundColor: '#0073e6',
			borderColor: '#0073e6',
			allDay: false,
			startEditable: true,
			extendedProps: {
				proposedDate: true,
				proposedDateId: index,
			},
		})
	})
}

function generateParticipantColor(participantId: string): string {
	let hash = 0
	for (let i = 0; i < participantId.length; i++) {
		hash = participantId.charCodeAt(i) + ((hash << 5) - hash)
	}
	const hue = Math.abs(hash) % 360
	return `hsl(${hue}, 70%, 50%)`
}

function formatProposalDate(date: Date | null): string {
	if (!date) {
		return ''
	}
	// Examples: "Mon, Jul 8, 2:30 PM" (en), "Mon, 8 Jul, 14:30" (en-GB), "Mo, 8. Jul, 14:30" (de)
	return moment(date).format('dddd, MMMM D, LT')
}

watch(modalVisible, (newVal) => {
	if (newVal) {
		nextTick(() => {
			onModalOpen()
		})
	}
}, { immediate: true })

watch(calendarDateSpan, (newVal) => {
	if (newVal !== calendarSpanDays.value) {
		calendarSpanDays.value = newVal
	}
})

watch(calendarSpanDays, (newVal, oldVal) => {
	// Prevent unnecessary updates when value hasn't actually changed
	if (newVal === oldVal) {
		return
	}
	if (!calendarApi.value) {
		logger.warn('Calendar API not initialized yet')
		return
	}
	calendarApi.value.setOption('views', {
		timeGridSpan: {
			type: 'timeGrid',
			duration: { days: newVal },
		},
	})
	calendarApi.value.changeView('timeGridSpan')
})

onMounted(() => {
	window.addEventListener('resize', onWindowResize)
	calendarSpanDays.value = calendarDateSpan.value
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', onWindowResize)
})
</script>

<style lang="scss" scoped>
.proposal-modal__content {
	display: flex;
	width: 100%;
	height: 100vh;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	:deep(.modal-wrapper--normal .modal-container) {
		width: unset !important;
	}
}

.proposal-viewer__content {
	padding-top: calc(var(--default-grid-baseline) * 8);
	padding-bottom: calc(var(--default-grid-baseline) * 8);
	padding-inline: calc(var(--default-grid-baseline) * 8);
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 3);
}

.proposal-viewer__content-title {
	font-size: calc(var(--default-grid-baseline) * 6);
	font-weight: bold;
	overflow-wrap: break-word;
	hyphens: auto;
}

.proposal-viewer__content-details {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-viewer__content-duration-and-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.proposal-viewer__content-location,
.proposal-viewer__content-duration {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-viewer__content-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-viewer__row-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	background-color: var(--color-main-background);
	flex-shrink: 0;
	padding-top: calc(var(--default-grid-baseline) * 2);
}

.proposal-viewer__content-matrix {
	padding-top: calc(var(--default-grid-baseline) * 4);
	padding-bottom: calc(var(--default-grid-baseline) * 2);
	border-top: 2px solid var(--color-border);
	border-bottom: 2px solid var(--color-border);
}

.proposal-editor__content {
	padding-bottom: calc(var(--default-grid-baseline) * 4);
	padding-inline: calc(var(--default-grid-baseline) * 4);
	display: flex;
	gap: calc(var(--default-grid-baseline) * 4);
	height: calc(100% - calc(var(--default-grid-baseline) * 4));
	overflow: hidden;
}

.proposal-editor__column-left {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	max-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	height: 100%;
}

.proposal-editor__column-right {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	height: calc(100% - calc(var(--default-grid-baseline) * 8));
	margin-top: calc(var(--default-grid-baseline) * 8);
}

.proposal-editor__row-title {
	flex-shrink: 0;
	margin-bottom: calc(var(--default-grid-baseline) * 2);
}

.proposal-editor__row-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	overflow-y: auto;
	margin-bottom: calc(var(--default-grid-baseline) * 2);
	min-height: 0;
}

.proposal-editor__row-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	background-color: var(--color-main-background);
	flex-shrink: 0;
	padding-top: calc(var(--default-grid-baseline) * 2);
	align-items: stretch;
}

.proposal-editor__save-button {
	flex: 1 1 auto;
	width: auto;
	min-width: 0;
}

.proposal-editor__row-actions > .nc-button:not(.proposal-editor__save-button) {
	flex: 0 0 auto;
	white-space: nowrap;
}

.proposal-editor__calendar {
	flex: 1;
	min-height: 0;
}

.proposal-editor__calendar-actions {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
	margin-bottom: calc(var(--default-grid-baseline) * 2);
	flex-wrap: wrap;
	width: 100%;

	h2 {
		flex: 1;
		text-align: center;
		margin: 0;
	}
}

.proposal-editor__proposal-location-container {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-editor__proposal-location {
	flex: 1;
}

:deep([class*="participant-busy-"]) {
	opacity: 0.7 !important;
	border-radius: 4px !important;

	/* Override background with striped pattern for better visibility */
	background-image: repeating-linear-gradient(45deg, transparent 0px, transparent calc(var(--default-grid-baseline) * 1), var(--color-background-hover) calc(var(--default-grid-baseline) * 1), var(--color-background-hover) calc(var(--default-grid-baseline) * 4)) !important;
}
</style>
