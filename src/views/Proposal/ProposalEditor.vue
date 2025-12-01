<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<NcModal
			v-if="modalVisible"
			class="proposal-modal__content"
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
				<div class="proposal-viewer__content-matrix">
					<ProposalResponseMatrix
						mode="organizer"
						:proposal="selectedProposal"
						:timezone-id="userTimezone"
						@date-convert="onProposalConvert" />
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
								:value="selectedProposal.location" />
							<NcCheckboxRadioSwitch
								v-if="settingsStore.talkEnabled"
								class="proposal-editor__proposal-location-selector"
								variant="secondary"
								:model-value="modalEditLocationState"
								@update:modelValue="onProposalLocationTypeToggle">
								{{ t('calendar', 'Add Talk conversation') }}
							</NcCheckboxRadioSwitch>
						</div>
						<div class="proposal-editor__proposal-duration-container">
							<NcTextField
								v-model="selectedProposal.duration"
								class="proposal-editor__proposal-duration"
								:label="t('calendar', 'Duration')"
								type="number"
								min="1"
								step="1"
								@input="onProposalDurationChange($event)" />
							<div class="proposal-editor__proposal-duration-helpers">
								<NcCheckboxRadioSwitch
									type="radio"
									class="proposal-editor__proposal-duration-helper"
									:button-variant="true"
									button-variant-grouped="horizontal"
									name="duration-helper"
									value="15"
									:model-value="String(selectedProposal.duration)"
									@update:modelValue="changeDuration(15)">
									{{ t('calendar', '15 min') }}
								</NcCheckboxRadioSwitch>
								<NcCheckboxRadioSwitch
									type="radio"
									class="proposal-editor__proposal-duration-helper"
									:button-variant="true"
									button-variant-grouped="horizontal"
									name="duration-helper"
									value="30"
									:model-value="String(selectedProposal.duration)"
									@update:modelValue="changeDuration(30)">
									{{ t('calendar', '30 min') }}
								</NcCheckboxRadioSwitch>
								<NcCheckboxRadioSwitch
									type="radio"
									class="proposal-editor__proposal-duration-helper"
									:button-variant="true"
									button-variant-grouped="horizontal"
									name="duration-helper"
									value="60"
									:model-value="String(selectedProposal.duration)"
									@update:modelValue="changeDuration(60)">
									{{ t('calendar', '60 min') }}
								</NcCheckboxRadioSwitch>
								<NcCheckboxRadioSwitch
									type="radio"
									class="proposal-editor__proposal-duration-helper"
									:button-variant="true"
									button-variant-grouped="horizontal"
									name="duration-helper"
									value="90"
									:model-value="String(selectedProposal.duration)"
									@update:modelValue="changeDuration(90)">
									{{ t('calendar', '90 min') }}
								</NcCheckboxRadioSwitch>
							</div>
						</div>
						<InviteesListSearch
							class="proposal-editor__proposal-participants-selector"
							:already-invited-emails="existingParticipantAddressess"
							@add-attendee="onProposalParticipantAdd" />
						<div v-if="selectedProposal.participants.length > 0" class="proposal-editor__proposal-participants">
							<h6>{{ t('calendar', 'Participants') }}</h6>
							<ProposalParticipantItem
								v-for="(participant, idx) in selectedProposal.participants"
								:key="idx"
								:proposal-participant="participant"
								@participant-attendance="onProposalParticipantAttendance(participant.address, $event)"
								@participant-remove="onProposalParticipantRemove(participant.address)" />
						</div>
						<div v-if="selectedProposal.dates.length > 0" class="proposal-editor__proposed-dates">
							<h6>{{ t('calendar', 'Selected times') }}</h6>
							<ProposalDateItem
								v-for="(entry, idx) in selectedProposal.dates"
								:key="idx"
								:proposal-date="entry"
								:timezone-id="userTimezone"
								@date-focus="onProposalDateFocus(entry)"
								@date-remove="onProposalDateRemove(idx)" />
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
	</div>
</template>

<script lang="ts">
import type { Proposal } from '@/models/proposals/proposals'

import FullCalendarInteraction from '@fullcalendar/interaction'
import FullCalendarTimeGrid from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue'
import { AttendeeProperty } from '@nextcloud/calendar-js'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
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
import NcModal from '@nextcloud/vue/components/NcModal'
import NcTextArea from '@nextcloud/vue/components/NcTextArea'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import InviteesListSearch from '@/components/Editor/Invitees/InviteesListSearch.vue'
import ProposalDateItem from '@/components/Proposal/ProposalDateItem.vue'
import ProposalParticipantItem from '@/components/Proposal/ProposalParticipantItem.vue'
import ProposalResponseMatrix from '@/components/Proposal/ProposalResponseMatrix.vue'
import { getBusySlots } from '../../services/freeBusySlotService.js'
import FullCalendarMoment from '@/fullcalendar/localization/momentPlugin.js'
import FullCalendarTimezones from '@/fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
import { ProposalDate, ProposalParticipant } from '@/models/proposals/proposals'
// types, object and stores
import usePrincipalStore from '@/store/principals.js'
import useProposalStore from '@/store/proposalStore'
import useSettingsStore from '@/store/settings.js'
import { ProposalDateVote, ProposalParticipantAttendance, ProposalParticipantRealm, ProposalParticipantStatus } from '@/types/proposals/proposalEnums'

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

export default {
	name: 'ProposalEditor',

	components: {
		NcButton,
		NcCheckboxRadioSwitch,
		NcModal,
		NcTextField,
		NcTextArea,
		FullCalendar,
		InviteesListSearch,
		ProposalParticipantItem,
		ProposalDateItem,
		ProposalResponseMatrix,
		ZoomInIcon,
		ZoomOutIcon,
		PreviousSpanIcon,
		NextSpanIcon,
		EditIcon,
		DeleteIcon,
		LocationIcon,
		DurationIcon,
	},

	data() {
		return {
			principalStore: usePrincipalStore(),
			settingsStore: useSettingsStore(),
			proposalStore: useProposalStore(),
			ProposalParticipantAttendance,
			ProposalParticipantStatus,
			ProposalDateVote,
			modalMode: 'view',
			calendarApi: null as unknown, // FullCalendar API instance
			selectedProposal: null as Proposal | null,
			participantAvailability: {} as Record<string, Record<string, ParticipantBusySlotInterface[]>>, // availability per participant
			participantColors: {} as Record<string, string>,
			calendarColumnWidth: 120, // Current pixel width allocated per day column
			calendarColumnWidthMin: 80, // Minimum day column width
			calendarColumnWidthStep: 40, // Pixel change per zoom action
			calendarSpanMax: 28, // Maximum days that can be shown
			calendarSpanMin: 1, // Minimum days that can be shown
			calendarSpanDays: 7, // Currently applied span (derived)
			screenWidth: window.innerWidth, // Track screen width
		}
	},

	computed: {
		userTimezone(): string {
			return this.settingsStore?.getResolvedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
		},

		modalVisible(): boolean {
			return this.proposalStore.modalVisible
		},

		modalSize(): string {
			if (this.modalMode === 'view') {
				return 'normal'
			} else {
				return 'full'
			}
		},

		modalTitle(): string {
			switch (this.modalMode) {
				case 'view':
					return t('calendar', 'Meeting proposals overview')
				case 'modify':
					return t('calendar', 'Edit meeting proposal')
				default:
					return t('calendar', 'Create meeting proposal')
			}
		},

		modalEditLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update meeting proposal') : t('calendar', 'Create meeting proposal')
		},

		modalEditSaveLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update') : t('calendar', 'Create')
		},

		modalEditSaveState(): boolean {
			if (!this.selectedProposal) {
				// disable if no proposal selected
				return false
			}
			return (
				this.selectedProposal.title !== null
				&& this.selectedProposal.duration > 0
				&& this.selectedProposal.participants.length > 0
				&& this.selectedProposal.dates.length > 0
			)
		},

		modalEditDestroyState(): boolean {
			return !this.selectedProposal || this.selectedProposal.id !== null
		},

		modalEditLocationState(): boolean {
			if (!this.selectedProposal) {
				return false
			}
			if (this.selectedProposal.location === 'Talk conversation') {
				return true
			} else {
				return false
			}
		},

		/**
		 * Configuration options for FullCalendar
		 * Please see https://fullcalendar.io/docs#toc for details
		 *
		 * @return
		 */
		calendarConfiguration() {
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			return {
				plugins: [
					FullCalendarTimeGrid,
					FullCalendarInteraction,
					FullCalendarMoment,
					FullCalendarTimezones,
				],

				headerToolbar: false,
				initialView: 'timeGridSpan',
				views: {
					timeGridSpan: {
						type: 'timeGrid',
						duration: { days: this.calendarSpanDays },
					},
				},

				dayHeaderFormat: { weekday: 'short', day: 'numeric' },
				allDaySlot: false,
				timeZone: this.userTimezone,
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
				select: (info: unknown) => this.onProposalDateAdd(info),
				eventDrop: (info: unknown) => this.onProposalDateMove(info),
				datesSet: () => {
					if (!this.modalVisible) {
						return
					}
					// Initialize calendar API when the calendar view is ready
					this.initializeCalendar()
					if (!this.calendarApi) {
						return
					}
					this.fetchParticipantAvailability()
				},
			}
		},

		existingParticipantAddressess(): string[] {
			return this.selectedProposal ? this.selectedProposal.participants.map((p: ProposalParticipant) => p.address) : []
		},

		calendarDateSpan(): number {
			// Approximate available width (screen minus left column/gutters)
			const availableWidth = Math.max(0, this.screenWidth - 400)
			const calculatedDays = Math.floor(availableWidth / this.calendarColumnWidth)
			return Math.max(this.calendarSpanMin, Math.min(this.calendarSpanMax, calculatedDays))
		},

		calendarDateRange(): string {
			if (!this.calendarApi) {
				return ''
			}

			const view = this.calendarApi.view
			const start = view.activeStart
			const end = new Date(view.activeEnd.getTime() - 1) // Subtract 1ms to get the last day shown

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
		},
	},

	watch: {
		modalVisible(newVal) {
			if (newVal) {
				this.$nextTick(() => {
					this.onModalOpen()
				})
			}
		},

		calendarDateSpan(newVal) {
			if (newVal !== this.calendarSpanDays) {
				this.calendarSpanDays = newVal
			}
		},

		calendarSpanDays(newVal, oldVal) {
			// Prevent unnecessary updates when value hasn't actually changed
			if (newVal === oldVal) {
				return
			}
			if (!this.calendarApi) {
				console.warn('Calendar API not initialized yet')
				return
			}
			this.calendarApi.setOption('views', {
				timeGridSpan: {
					type: 'timeGrid',
					duration: { days: newVal },
				},
			})
			this.calendarApi.changeView('timeGridSpan')
		},
	},

	mounted() {
		window.addEventListener('resize', this.onWindowResize)
		this.calendarSpanDays = this.calendarDateSpan
	},

	beforeDestroy() {
		window.removeEventListener('resize', this.onWindowResize)
	},

	methods: {
		t,

		onWindowResize(): void {
			this.screenWidth = window.innerWidth
		},

		onModalOpen() {
			this.selectedProposal = this.proposalStore.modalProposal
			this.modalMode = this.proposalStore.modalMode

			// Wait for the FullCalendar component to be mounted before trying to initialize API
			this.$nextTick(() => {
				this.initializeCalendar()
				// Calendar not ready yet, try again after a short delay
				if (!this.calendarApi) {
					setTimeout(() => {
						this.initializeCalendar()
					}, 100)
				}
			})
		},

		onModalClose() {
			this.proposalStore.hideModal()
			this.selectedProposal = null
			this.modalView = 'view'
			this.participantAvailability = {}
			if (this.calendarApi) {
				this.calendarApi.removeAllEvents()
				this.calendarApi.unselect()
				this.calendarApi = null
			}
		},

		onProposalModify() {
			this.modalMode = 'modify'
		},

		async onProposalDestroy(proposal: Proposal) {
			if (!confirm(t('calendar', 'Are you sure you want to delete "{title}"?', { title: proposal.title ?? t('calendar', 'No title') }))) {
				return
			}
			try {
				showSuccess(t('calendar', 'Deleting proposal "{title}"', { title: proposal.title ?? t('calendar', 'No title') }))
				await this.proposalStore.destroyProposal(proposal)
				showSuccess(t('calendar', 'Successfully deleted proposal'))
				this.onModalClose()
			} catch (error) {
				showError(t('calendar', 'Failed to delete proposal'))
				console.error('Failed to delete proposal:', error)
			}
		},

		async onProposalSave() {
			try {
				if (!this.selectedProposal) {
					return console.error('No proposal selected for this operation')
				}
				showSuccess(t('calendar', 'Saving proposal "{title}"', { title: this.selectedProposal.title ?? t('calendar', 'No title') }))
				await this.proposalStore.storeProposal(this.selectedProposal)
				showSuccess(t('calendar', 'Successfully saved proposal'))
				this.onModalClose()
			} catch (error) {
				showError(t('calendar', 'Failed to save proposal'))
				console.error('Failed to save proposal:', error)
			}
		},

		async onProposalConvert(date: ProposalDate) {
			if (!this.selectedProposal || !date.date) {
				return console.error('No proposal selected or invalid date for meeting conversion')
			}

			// Confirm the action with the user
			const dateString = this.formatProposalDate(date.date)
			if (!confirm(t('calendar', 'Create a meeting for "{date}"? This will create a calendar event with all participants.', { date: dateString }))) {
				return
			}

			try {
				showSuccess(t('calendar', 'Creating meeting for {date}', { date: dateString }))
				await this.proposalStore.convertProposal(this.selectedProposal, date, this.userTimezone)
				showSuccess(t('calendar', 'Successfully created meeting for {date}', { date: dateString }))
				this.onModalClose()
			} catch (error) {
				showError(t('calendar', 'Failed to create a meeting for {date}', { date: dateString }))
				console.error('Failed to create a meeting:', error)
			}
		},

		onProposalDurationChange(event: Event) {
			const value = (event.target as HTMLInputElement).value
			const duration = parseInt(value, 10)
			this.changeDuration(duration)
		},

		onProposalLocationTypeToggle(): void {
			if (!this.selectedProposal) {
				return
			}
			if (this.selectedProposal.location === 'Talk conversation') {
				this.selectedProposal.location = ''
			} else {
				this.selectedProposal.location = 'Talk conversation'
			}
		},

		onProposalParticipantAdd(participant: ParticipantSearchInterface): void {
			if (participant.calendarUserType === 'INDIVIDUAL') {
				return this.addParticipant(participant)
			}
			if (participant.calendarUserType === 'GROUP') {
				return this.addGroup(participant)
			}
		},

		onProposalParticipantRemove(address: string): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			this.removeParticipant(address)
		},

		onProposalParticipantAttendance(address: string, attendance: ProposalParticipantAttendance): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			const participant = this.selectedProposal.participants.find((p) => p.address === address)
			if (participant) {
				participant.attendance = attendance
			} else {
				console.error('Participant not found:', address)
			}
		},

		onProposalDateAdd(info: unknown): void {
			// validate duration
			const duration = parseInt(String(this.selectedProposal?.duration ?? ''), 10)
			if (isNaN(duration) || duration <= 0) {
				showError(t('calendar', 'Please enter a valid duration in minutes.'))
				return
			}
			this.addProposedDate(info.start)
			// Clear selection in FullCalendar and re-render view
			this.calendarApi.unselect()
		},

		onProposalDateMove(info: unknown): void {
			// Only handle drag for proposed dates
			if (info.event.extendedProps && info.event.extendedProps.proposedDate) {
				this.changeProposedDate(info.event.extendedProps.proposedDateId, info.event.start)
			}
		},

		onProposalDateRemove(index: number): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			if (this.selectedProposal.dates[index] === undefined) {
				return console.error('Can not remove proposed date, index value is invalid: ', index)
			}
			this.selectedProposal.dates.splice(index, 1)
			this.renderParticipantAvailability()
		},

		onProposalDateFocus(date: ProposalDate): void {
			if (!this.calendarApi || !date) {
				return console.warn('Calendar API not available or invalid date')
			}
			// Focus the calendar on the specific date
			this.calendarApi.gotoDate(date.date)
		},

		onCalendarFocusToday(): void {
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			this.calendarApi.today()
		},

		onCalendarSpanPrevious(): void {
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			this.calendarApi.prev()
		},

		onCalendarSpanNext(): void {
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			this.calendarApi.next()
		},

		onCalendarSpanDecrease(): void {
			this.calendarColumnWidth = Math.max(this.calendarColumnWidthMin, this.calendarColumnWidth - this.calendarColumnWidthStep)
		},

		onCalendarSpanIncrease(): void {
			this.calendarColumnWidth = this.calendarColumnWidth + this.calendarColumnWidthStep
		},

		initializeCalendar() {
			// Initialize the calendar API from the FullCalendar component reference
			if (this.$refs.proposalFullCalendar && !this.calendarApi) {
				const fullCalendarComponent = this.$refs.proposalFullCalendar as unknown
				if (fullCalendarComponent && typeof fullCalendarComponent.getApi === 'function') {
					this.calendarApi = fullCalendarComponent.getApi()
				}
			}
		},

		async fetchProposals() {
			try {
				this.storedProposals = await this.proposalStore.listProposals()
			} catch (error) {
				showError(t('calendar', 'Failed to fetch proposals'))
				console.error('Failed to fetch proposals:', error)
			}
		},

		changeDuration(duration: number): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			// Validate duration value
			if (isNaN(duration) || duration <= 0) {
				this.selectedProposal.duration = 0
				return console.error('Invalid duration value:', duration)
			}
			this.selectedProposal.duration = duration
			// Refresh calendar view
			this.renderParticipantAvailability()
		},

		addParticipant(participant: ParticipantSearchInterface): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			if (!participant.email) {
				return
			}
			// add the participant to the proposal
			const newParticipant = new ProposalParticipant()
			newParticipant.address = participant.email
			newParticipant.name = participant.commonName || participant.email
			newParticipant.realm = participant.isUser ? ProposalParticipantRealm.Internal : ProposalParticipantRealm.External
			this.selectedProposal.participants.push(newParticipant)
			// generate a unique color for the participant
			this.participantColors[newParticipant.address] = this.generateParticipantColor(newParticipant.address)
			// retrieve availability for the new participant
			this.fetchParticipantAvailability(newParticipant)
		},

		removeParticipant(address: string): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			// remove the participant's availability data
			if (this.participantAvailability[address]) {
				delete this.participantAvailability[address]
			}
			// remove the participant from the proposal
			this.selectedProposal.participants = this.selectedProposal.participants.filter((p: ProposalParticipant) => p.address !== address)
			// update the calendar availability
			this.renderParticipantAvailability()
		},

		addGroup(participant: ParticipantSearchInterface): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			if (!participant.email) {
				return
			}
			// add the group as a participant
			const newParticipant = new ProposalParticipant()
			newParticipant.address = participant.email
			newParticipant.name = participant.commonName || participant.email
			newParticipant.realm = participant.isUser ? ProposalParticipantRealm.Internal : ProposalParticipantRealm.External

			this.selectedProposal.participants.push(newParticipant)
		},

		addProposedDate(date: Date): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			const newProposalDate = new ProposalDate()
			newProposalDate.date = date
			this.selectedProposal.dates.push(newProposalDate)
			this.selectedProposal.dates.sort((a, b) => {
				if (!a.date || !b.date) {
					return 0
				}
				return a.date.getTime() - b.date.getTime()
			})
			// Refresh calendar view
			this.renderParticipantAvailability()
		},

		changeProposedDate(index: number, date: Date): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			if (this.selectedProposal.dates[index] === undefined) {
				return console.error('Can not change proposed date, index value is invalid: ', index)
			}
			this.selectedProposal.dates[index].date = date
			// Force Vue to recognize the change for reactivity
			this.selectedProposal.dates = [...this.selectedProposal.dates]

			this.renderParticipantAvailability()
		},

		async fetchParticipantAvailability(participant: ProposalParticipant | null = null): Promise<void> {
			// Check if calendar API is available
			if (!this.calendarApi) {
				console.warn('Calendar API not available, skipping availability fetch')
				return
			}

			// Get start and end from FullCalendar's current view
			const view = this.calendarApi.view
			const start = view.activeStart
			const end = view.activeEnd
			const timeZoneId = this.userTimezone
			// Use current user for organizer
			const principal = this.principalStore.getCurrentUserPrincipal
			if (!principal) {
				console.error('No current user found cannot retrieve availability data')
				return
			}
			const organizer = AttendeeProperty.fromNameAndEMail(principal.displayname || '', principal.emailAddress || '', true)
			const attendees: Array<{ name: string, email: string, isOrganizer: boolean }> = []
			if (participant) {
				if (participant.realm !== ProposalParticipantRealm.Internal) {
					console.warn('Skipping availability fetch for non-internal participant:', participant)
					return
				}
				attendees.push(AttendeeProperty.fromNameAndEMail(participant.name, participant.address, false))
			} else {
				this.selectedProposal.participants.forEach((p: ProposalParticipant) => {
					if (p.realm !== ProposalParticipantRealm.Internal) {
						console.warn('Skipping availability fetch for non-internal participant:', p)
						return
					}
					attendees.push(AttendeeProperty.fromNameAndEMail(p.name, p.address, false))
				})
			}
			// fetch availability data
			const { events, error } = await getBusySlots(organizer, attendees, start, end, timeZoneId) as { events: ParticipantBusySlotInterface[], error?: unknown }
			if (error) {
				console.error('Failed to fetch free/busy data:', error)
				showError(t('calendar', 'Failed to fetch free/busy data'))
				return
			}
			// Remove existing availability data for the organizer and participant(s)
			// This is necessary to avoid duplicate entries as busy slots are returned with a different event id every time
			attendees.forEach((attendee) => {
				delete this.participantAvailability[attendee.email]
			})
			delete this.participantAvailability[organizer.email]
			// Separate availability data per participant
			events.forEach((event) => {
				let resourceId = event.resourceId
				if (resourceId.startsWith('mailto:')) {
					resourceId = resourceId.replace('mailto:', '')
				}
				if (!this.participantAvailability[resourceId]) {
					this.participantAvailability[resourceId] = {}
				}
				this.participantAvailability[resourceId][event.id] = event
			})
			this.renderParticipantAvailability()
		},

		renderParticipantAvailability(): void {
			// Check if calendar API is available
			if (!this.calendarApi) {
				console.warn('Calendar API not available, skipping render')
				return
			}

			// Clear all existing events
			this.calendarApi.removeAllEvents()

			// Render individual participant busy slots
			Object.entries(this.participantAvailability).forEach(([participantId, participantSlots]) => {
				const participantColor = this.participantColors[participantId] || this.generateParticipantColor(participantId)

				// Clean up the participant ID for display (remove mailto: prefix if present)
				let displayId = participantId
				if (displayId.startsWith('mailto:')) {
					displayId = displayId.replace('mailto:', '')
				}

				// Add each busy slot as an individual event with participant-specific styling
				Object.values(participantSlots as Record<string, ParticipantBusySlotInterface>).forEach((slot: ParticipantBusySlotInterface) => {
					const eventDuration = new Date(slot.end).getTime() - new Date(slot.start).getTime()
					const zIndex = Math.max(1, 1000 - Math.floor(eventDuration / 60000)) // Longer events get lower z-index

					this.calendarApi.addEvent({
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
			const duration = this.selectedProposal?.duration ?? 10
			this.selectedProposal?.dates.forEach((proposalDate, index) => {
				if (!proposalDate.date) {
					return
				}
				this.calendarApi.addEvent({
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
		},

		generateParticipantColor(participantId) {
			let hash = 0
			for (let i = 0; i < participantId.length; i++) {
				hash = participantId.charCodeAt(i) + ((hash << 5) - hash)
			}
			const hue = Math.abs(hash) % 360
			return `hsl(${hue}, 70%, 50%)`
		},

		formatProposalDate(date: Date | null): string {
			if (!date) {
				return ''
			}
			// Examples: "Mon, Jul 8, 2:30 PM" (en), "Mon, 8 Jul, 14:30" (en-GB), "Mo, 8. Jul, 14:30" (de)
			return moment(date).format('dddd, MMMM D, LT')
		},

	},
}
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
	word-wrap: break-word;
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

.proposal-editor__proposal-duration-container {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-editor__proposal-duration {
	flex: 1;
}

.proposal-editor__proposal-duration-helpers {
	display: flex;
	gap: 0;

	// Deep CSS to remove default borders from radio switches and match secondary button styling
	:deep(.checkbox-radio-switch) {
		border: none !important;

		// Match NcButton secondary variant colors
		.checkbox-radio-switch__content {
			background-color: var(--color-background-hover);
			color: var(--color-text-primary);

			&:hover {
				background-color: var(--color-primary-element-light);
			}
		}

		// Selected state styling
		&.checkbox-radio-switch--checked .checkbox-radio-switch__content {
			background-color: var(--color-primary-element);
			color: var(--color-primary-element-text);

			&:hover {
				background-color: var(--color-primary-element-hover);
			}
		}
	}
}

:deep([class*="participant-busy-"]) {
	opacity: 0.7 !important;
	border-radius: 4px !important;

	/* Override background with striped pattern for better visibility */
	background-image: repeating-linear-gradient(45deg, transparent 0px, transparent calc(var(--default-grid-baseline) * 1), var(--color-background-hover) calc(var(--default-grid-baseline) * 1), var(--color-background-hover) calc(var(--default-grid-baseline) * 4)) !important;
}
</style>
