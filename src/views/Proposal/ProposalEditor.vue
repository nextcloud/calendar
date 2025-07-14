<template>
	<div>
	   <NcModal v-if="modalVisible"
		   :title="modalTitle"
	   	   class="proposal-modal__content"
		   size="full"
		   @close="onModalClose()">
			<!-- Show proposal list view -->
			<div v-if="!modalView" class="proposal-listview__content">
				<!-- Row 1: Title -->
				<div class="proposal-listview__row-title">
					<h2>{{ t('calendar', 'Meeting Proposal List') }}</h2>
				</div>
				<!-- Row 2: List -->
				<div class="proposal-listview__row-list">
					<div v-if="storedProposals.length === 0" class="proposal-listview__list-content">
						<NcEmptyContent  name="No proposals found">
							<template #icon>
								<PollIcon />
							</template>
							<template #description>
								{{ t('calendar', 'Create a new proposal to get started.') }}
							</template>
						</NcEmptyContent>
					</div>
					<div v-if="storedProposals.length > 0" class="proposal-listview__list-content">
						<div v-for="proposal in storedProposals" :key="proposal.id" class="proposal-listview__list-item">
							<div class="proposal-listview__list-item-details">
								<div class="proposal-listview__list-item-overview">
									<div class="proposal-listview__list-item-title">
										<h3>{{ proposal.title }}</h3>
									</div>
									<div class="proposal-listview__list-item-responses">
										{{ proposal.participants.filter(p => p.status === ProposalParticipantStatus.Responded).length }} / {{ proposal.participants.length }} responded
									</div>
									<div class="proposal-listview__list-item-actions">
										<NcButton size="small" variant="secondary" @click="onProposalModify(proposal)">
											{{ t('calendar', 'Modify') }}
										</NcButton>
										<NcButton size="small" variant="tertiary" @click="onProposalDestroy(proposal)">
											{{ t('calendar', 'Delete') }}
										</NcButton>
									</div>
								</div>
								<div class="proposal-listview__list-item-dates">
									<template v-for="entry in proposal.dates">
										<div class="proposal-listview__list-item-date">
											<span class="proposal-listview__list-item-date-time">
												{{ formatProposalDate(entry.date) }}
											</span>
											<span class="proposal-listview__list-item-vote-yes">
												{{ entry.votedYes }}
												<CheckIcon />
											</span>
											<span class="proposal-listview__list-item-vote-no">
												{{ entry.votedNo }}
												<CloseIcon />
											</span>
											<span class="proposal-listview__list-item-vote-maybe">
												{{ entry.votedMaybe }}
												<HelpIcon />
											</span>
										</div>
									</template>
								</div>
							</div>
						</div>
					</div>
				</div>
				<!-- Row 3: Actions -->
				<div class="proposal-listview__row-actions">
					<NcButton variant="primary" @click="onProposalCreate()">{{ t('calendar', 'Create') }}</NcButton>
					<NcButton variant="secondary" @click="onModalClose()">{{ t('calendar', 'Close') }}</NcButton>
				</div>
			</div>
			<!-- Show proposal edit view -->
			<div v-if="selectedProposal" class="proposal-editview__content">
				<div class="proposal-editview__column-left">
					<!-- Row 1: Title -->
					<div class="proposal-editview__row-title">
						<h2>{{ modalEditLabel }}</h2>
					</div>
					<!-- Row 2: Details -->
					<div class="proposal-editview__row-details">
						<NcTextField class="proposal-editview__proposal-title"
							:label="t('calendar', 'Title')"
							v-model="selectedProposal.title" />
						<NcTextArea class="proposal-editview__proposal-description"
							:label="t('calendar', 'Description')"
							v-model="selectedProposal.description" />
						<div class="proposal-editview__proposal-location-container">
							<NcTextField class="proposal-editview__proposal-location"
								:label="t('calendar', 'Location')"
								:value="selectedProposal.location"
								@input="onProposalLocationInput($event)" />
							<NcButton class="proposal-editview__proposal-location-selector"
								variant="secondary"
								@click="onProposalLocationTypeToggle">
								{{ modalEditLocationButtonLabel }}
							</NcButton>
						</div>
						<NcTextField class="proposal-editview__proposal-duration"
							:label="t('calendar', 'Duration')"
							v-model="selectedProposal.duration"
							type="number"
							min="1"
							step="1"
							@input="onProposalDurationChange($event)" />
						<InviteesListSearch class="proposal-editview__proposal-participants-selector"
							:already-invited-emails="existingParticipantAddressess"
							@add-attendee="onProposalParticipantAdd" />
						<div v-if="selectedProposal.participants.length > 0" class="proposal-editview__proposal-participants">
							<ProposalParticipantItem v-for="(participant, idx) in selectedProposal.participants"
								:key="idx"
								:proposal-participant="participant"
								@remove-participant="onProposalParticipantRemove(participant.address)" />
						</div>
						<div v-if="selectedProposal.dates.length > 0" class="proposal-editview__proposed-dates">
							<ProposalDateItem v-for="(entry, idx) in selectedProposal.dates"
								:key="idx"
								:proposal-date="entry"
								@remove-date="onProposalDateRemove(idx)" />
						</div>
					</div>
					<!-- Row 3: Actions -->
					<div class="proposal-editview__row-actions">
						<NcButton variant="primary" :disabled="!modalEditSaveState" @click="onProposalSave()">{{ modalEditSaveLabel }}</NcButton>
						<NcButton variant="secondary" v-if="modalEditDestroyState" @click="onProposalDestroy(selectedProposal)">{{ 'Delete' }}</NcButton>
						<NcButton variant="secondary" @click="onEditClose()">{{ t('calendar', 'Cancel') }}</NcButton>
						<NcButton variant="secondary" @click="onModalClose()">{{ t('calendar', 'Close') }}</NcButton>
					</div>
				</div>
				<div class="proposal-editview__column-right">
					<div class="proposal-editview__calendar-actions">
						<NcButton variant="secondary" @click="onCalendarFocusToday()">
							{{ t('calendar', 'Today') }}
						</NcButton>
						<NcButton type="secondary"
							:aria-label="t('calendar', 'Previous span')"
							@click="onCalendarSpanPrevious()">
							<template #icon>
								<ChevronLeftIcon />
							</template>
						</NcButton>
						<NcButton type="secondary"
							:aria-label="t('calendar', 'Next span')"
							@click="onCalendarSpanNext()">
							<template #icon>
								<ChevronRightIcon />
							</template>
						</NcButton>
						<h2>{{ calendarDateRange }}</h2>
						<NcButton type="secondary"
							:aria-label="t('calendar', 'Less days')"
							@click="onCalendarSpanDecrease()">
							<template #icon>
								<ChevronLeftIcon />
							</template>
						</NcButton>
						<NcButton type="secondary"
							:aria-label="t('calendar', 'More days')"
							@click="onCalendarSpanIncrease()">
							<template #icon>
								<ChevronRightIcon />
							</template>
						</NcButton>
					</div>
					<FullCalendar ref="proposalFullCalendar"
					:options="calendarConfiguration" class="proposal-editview__calendar" />
				</div>
			</div>
		</NcModal>
	</div>
</template>

<script lang="ts">
// stores and services
import useProposalStore from '@/store/proposalStore'
import usePrincipalStore from '@/store/principals'
/// functions
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { Proposal, ProposalParticipant, ProposalDate } from '@/models/proposals/proposals'
import { ProposalParticipantRealm, ProposalParticipantStatus } from '@/types/proposals/proposalEnums'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { getBusySlots } from '../../services/freeBusySlotService'
import { AttendeeProperty } from '@nextcloud/calendar-js'
// components
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcChip from '@nextcloud/vue/components/NcChip'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcModal from '@nextcloud/vue/components/NcModal'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import NcSelect from '@nextcloud/vue/components/NcSelect'
import NcTextArea from '@nextcloud/vue/components/NcTextArea'
import FullCalendar from '@fullcalendar/vue'
import FullCalendarTimeGrid from '@fullcalendar/timegrid'
import FullCalendarInteraction from '@fullcalendar/interaction'; // for selectable
import InviteesListSearch from '@/components/Editor/Invitees/InviteesListSearch.vue'
import ProposalParticipantItem from '@/components/Proposal/ProposalParticipantItem.vue'
import ProposalDateItem from '@/components/Proposal/ProposalDateItem.vue'
// icons
import PollIcon from 'vue-material-design-icons/Poll'
import CheckIcon from 'vue-material-design-icons/Check'
import CloseIcon from 'vue-material-design-icons/Close'
import HelpIcon from 'vue-material-design-icons/Help'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight'
import type RepeatUnsupportedWarning from '@/components/Editor/Repeat/RepeatUnsupportedWarning.vue'

export default {
	name: 'ProposalEditor',

	data() {
		const principalStore = usePrincipalStore()
		const proposalStore = useProposalStore()
		return {
			principalStore,
			proposalStore,
			ProposalParticipantStatus,
			modalView: false, // Toggle between list and edit view
			calendarApi: null as any, // FullCalendar API instance
			storedProposals: [] as Array<Proposal>,
			selectedProposal: null as Proposal | null,
			participantAvailabilityIndividual: {} as Record<string, Record<string, any>>,
			participantAvailabilityCombined: [] as Array<{ start: Date, end: Date }>, // Store available slots
			calendarSlotPrecision: 1, // default to 30 min
			calendarSpanDays: 7, // Track current span duration
			calendarSpanOverride: false, // Track if user manually changed span
			screenWidth: window.innerWidth, // Track screen width
		}
	},

	mounted() {
		window.addEventListener('resize', this.onWindowResize)
		this.calendarSpanDays = this.optimalSpanDays
	},

	beforeDestroy() {
		window.removeEventListener('resize', this.onWindowResize)
	},

	components: {
		NcEmptyContent,
		NcButton,
		NcChip,
		NcCheckboxRadioSwitch,
		NcModal,
		NcTextField,
		NcSelect,
		NcTextArea,
		FullCalendar,
		InviteesListSearch,
		ProposalParticipantItem,
		ProposalDateItem,
		PollIcon,
		CheckIcon,
		CloseIcon,
		HelpIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
	},

	props: {
	},

	watch: {
		modalVisible(newVal) {
			if (newVal) {
				this.$nextTick(() => {
					this.onModalOpen()
				});
			}
		},
		
		optimalSpanDays(newVal) {
			// Only update calendar view when optimal span days changes if user hasn't manually overridden
			if (this.calendarApi && newVal !== this.calendarSpanDays && !this.calendarSpanOverride) {
				return
			}
			this.calendarSpanDays = newVal
			this.calendarApi.setOption('views', {
				timeGridSpan: {
					type: 'timeGrid',
					duration: { days: newVal }
				}
			})
			this.calendarApi.changeView('timeGridSpan')
		},
	},

	computed: {
		modalVisible(): boolean {
			return this.proposalStore.modalVisible
		},
		modalTitle(): string {
			if (this.modalView === false) {
				return t('calendar', 'Meeting proposals')
			} else { 
				if (this.selectedProposal?.id) {
					return t('calendar', 'Edit meeting proposal')
				} else {
					return t('calendar', 'Create meeting proposal')
				}
			}
		},
		modalEditLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update meeting proposal') : t('calendar', 'Create meeting proposal')
		},
		modalEditSaveLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update') : t('calendar', 'Create')
		},
		modalEditSaveState(): boolean {
			if (!this.selectedProposal) return false // disable if no proposal selected
			return (
				this.selectedProposal.title !== null &&
				this.selectedProposal.duration > 0 &&
				this.selectedProposal.participants.length > 0 &&
				this.selectedProposal.dates.length > 0
			)
		},
		modalEditDestroyState(): boolean {
			return !this.selectedProposal || this.selectedProposal.id !== null
		},
		
		modalEditLocationButtonLabel() {
			if (!this.selectedProposal) return 'Talk'
			if (this.selectedProposal.location === 'Talk Room') {
				return t('calendar', 'Physical')
			} else {
				return t('calendar', 'Virtual')
			}
		},
		/**
		* Configuration options for FullCalendar
		* Please see https://fullcalendar.io/docs#toc for details
		*
		* @return {object}
		*/
		calendarConfiguration() {
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			// Slot durations and current index for zoom controls
			const slotDurations = [
				{ label: '5 min', value: '00:05:00' },
				{ label: '10 min', value: '00:10:00' },
				{ label: '15 min', value: '00:15:00' },
				{ label: '30 min', value: '00:30:00' },
				{ label: '1 hour', value: '01:00:00' }
			]

			if (this.calendarSlotPrecision === undefined) {
				this.calendarSlotPrecision = 2 // default to 15 min
			}

			return {
				schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
				plugins: [FullCalendarTimeGrid, FullCalendarInteraction],
				headerToolbar: false,
				initialView: 'timeGridSpan',
				views: {
					timeGridSpan: {
						type: 'timeGrid',
						duration: { days: this.calendarSpanDays }
					}
				},
				dayHeaderFormat: { weekday: 'short', day: 'numeric' },
				allDaySlot: false,
				slotMinTime: '08:00:00',
				slotMaxTime: '18:00:00',
				slotDuration: slotDurations[this.calendarSlotPrecision].value,
				validRange: {
					start: today,
				},
				nowIndicator: true,
				editable: true,
				eventOverlap: true,
				selectable: true,
				selectMirror: true,
				droppable: true,
				eventStartEditable: true,
				eventDurationEditable: false,
				select: (info: any) => this.onProposalDateAdd(info),
				eventDrop: (info: any) => this.onProposalDateMove(info),
				datesSet: () => {
					if (!this.modalVisible) return
					if (!this.calendarApi) return
					this.fetchParticipantAvailability()
					// Force reactivity update for the date range display
					this.$forceUpdate()
				},
			}
		},
		existingParticipantAddressess(): string[] {
			return this.selectedProposal ? this.selectedProposal.participants.map((p: ProposalParticipant) => p.address) : []
		},
		
		optimalSpanDays(): number {
			// Get the available width for the calendar (roughly half the screen minus padding)
			const availableWidth = this.screenWidth - 400 // Account for left column and padding
			const minDayWidth = 140 // Minimum width per day column in pixels
			const maxDays = 28 // Maximum reasonable span
			const minDays = 1 // Minimum span
			
			const calculatedDays = Math.floor(availableWidth / minDayWidth)
			return Math.max(minDays, Math.min(maxDays, calculatedDays))
		},
		
		/**
		 * Get the formatted date range currently shown in the calendar
		 * @return {string} Formatted date range like "July 11 to 24"
		 */
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
	
	methods: {
		t,
		
		onWindowResize(): void {
			const oldWidth = this.screenWidth
			this.screenWidth = window.innerWidth
			
			// Reset manual override if window size changed significantly (more than 200px)
			if (Math.abs(oldWidth - this.screenWidth) > 200) {
				this.calendarSpanOverride = false
			}
		},
		
		onModalOpen() {
			this.fetchProposals();
			if (this.storedProposals.length === 0) {
				this.selectProposal(new Proposal())
			}
		},

		onModalClose() {
			this.storedProposals = []
			this.proposalStore.hideModal()
			this.unselectProposal()
		},

		onEditClose() {
			this.unselectProposal()
		},

		onProposalCreate() {
			this.selectProposal(new Proposal())
		},

		onProposalModify(proposal: Proposal) {
			this.selectProposal(proposal)
		},

		async onProposalDestroy(proposal: Proposal) {
			if (confirm(t('calendar', 'Are you sure you want to delete this proposal?'))) {
				try {
					await this.proposalStore.destroyProposal(proposal)
					this.fetchProposals()
					if (this.selectedProposal && this.selectedProposal.id === proposal.id) {
						this.unselectProposal()
					}
					showSuccess(t('calendar', 'Proposal deleted successfully'))
					console.log('Proposal deleted successfully:', proposal)
				} catch (error) {
					showError(t('calendar', 'Failed to delete proposal'))
					console.error('Failed to delete proposal:', error)
				}
			}
		},

		async onProposalSave() {
			try {
				if (!this.selectedProposal) {
					return console.error('No proposal selected for this operation')
				}
				await this.proposalStore.storeProposal(this.selectedProposal)
				this.unselectProposal()
				this.fetchProposals()
				showSuccess(t('calendar', 'Proposal saved successfully'))
				console.log('Proposal saved successfully:', this.selectedProposal)
			} catch (error) {
				showError(t('calendar', 'Failed to save proposal'))
				console.error('Failed to save proposal:', error)
			}
		},

		onProposalDurationChange(event: Event) {
			const value = (event.target as HTMLInputElement).value
			// Only allow positive integers
			if (!/^[\d]+$/.test(value)) {
				if (this.selectedProposal) this.selectedProposal.duration = 0
			} else {
				if (this.selectedProposal) this.selectedProposal.duration = parseInt(value, 10)
			}
		},

		onProposalLocationInput(event: Event) {
			const value = (event.target as HTMLInputElement).value
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			if (this.selectedProposal.location !== 'Talk Room') {
				this.selectedProposal.location = value
			} else {
				// Prevent the input change when location is 'Talk Room'
				event.preventDefault();
				(event.target as HTMLInputElement).value = 'Talk Room';
				return false;
			}
		},

		onProposalLocationTypeToggle(): void {
			if (!this.selectedProposal) {
				return
			}
			if (this.selectedProposal.location === 'Talk Room') {
				this.selectedProposal.location = ''
			} else {
				this.selectedProposal.location = 'Talk Room'
			}
		},

		onProposalParticipantAdd(participant: any): void {
			if (participant.calendarUserType === 'INDIVIDUAL') {
				return (this as any).addParticipant(participant)
			}
			if (participant.calendarUserType === 'GROUP') {
				return (this as any).addGroup(participant)
			}
		},
		
		onProposalParticipantRemove(address: string): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			this.removeParticipant(address)
		},

		onProposalDateAdd(info: any): void {
			// validate selection
			const isAvailable = this.participantAvailabilityCombined.some(e =>
				info.start >= e.start && info.end <= e.end
			)
			if (!isAvailable) {
				showError(t('calendar', 'Selected time slot is not available. Please choose a different time.'));
				return;
			}
			// validate duration
			let duration = parseInt(String(this.selectedProposal?.duration ?? ''), 10);
			if (isNaN(duration) || duration <= 0) {
				showError(t('calendar', 'Please enter a valid duration in minutes.'));
				return;
			}
			// @ts-ignore
			this.addProposedDate(info.start);
			// Clear selection in FullCalendar and re-render view
			this.calendarApi.unselect()
		},
		
		onProposalDateMove(info: any): void {
			// Only handle drag for proposed dates
			if (info.event.extendedProps && info.event.extendedProps.proposedDate) {
				// Validate that the new time slot is available
				const newStart = info.event.start;
				const newEnd = info.event.end;
				const isAvailable = this.participantAvailabilityCombined.some(e =>
					newStart >= e.start && newEnd <= e.end
				);
				
				if (!isAvailable) {
					// Revert the drag operation
					info.revert();
					showError(t('calendar', 'Selected time slot is not available. Please choose a different time.'));
					return;
				}
				
				this.changeProposedDate(info.event.extendedProps.proposedDateId, info.event.start);
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

		onCalendarFocusToday(): void {
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			this.calendarApi.today()
			// Reset manual override when going to today
			this.calendarSpanOverride = false
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
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			// Decrease the span duration (fewer days) from current optimal
			const newDays = Math.max(1, this.calendarSpanDays - 1) // Minimum 1 day
			this.calendarSpanDays = newDays
			this.calendarSpanOverride = true // Mark as manually overridden
			this.calendarApi.setOption('views', {
				timeGridSpan: {
					type: 'timeGrid',
					duration: { days: newDays }
				}
			})
			this.calendarApi.changeView('timeGridSpan')
		},

		onCalendarSpanIncrease(): void {
			if (!this.calendarApi) {
				return console.error('Calendar API not initialized')
			}
			// Increase the span duration (more days) from current optimal
			const newDays = Math.min(28, this.calendarSpanDays + 1) // Maximum 28 days
			this.calendarSpanDays = newDays
			this.calendarSpanOverride = true // Mark as manually overridden
			this.calendarApi.setOption('views', {
				timeGridSpan: {
					type: 'timeGrid',
					duration: { days: newDays }
				}
			})
			this.calendarApi.changeView('timeGridSpan')
		
		},

		async fetchProposals() {
			try {
				this.storedProposals = await this.proposalStore.listProposals()
			} catch (error) {
				showError(t('calendar', 'Failed to fetch proposals'))
				console.error('Failed to fetch proposals:', error)
			}
		},

		selectProposal(proposal: Proposal): void {
			this.modalView = true
			this.selectedProposal = proposal
			this.$nextTick(() => {
				const calendarRef = this.$refs.proposalFullCalendar as any;
				if (calendarRef && typeof calendarRef.getApi === 'function') {
					this.calendarApi = calendarRef.getApi();
					this.fetchParticipantAvailability()
				}
			});
		},

		unselectProposal(): void {
			this.selectedProposal = null
			this.modalView = false
			this.participantAvailabilityIndividual = {}
			this.participantAvailabilityCombined = []
			if (this.calendarApi) {
				this.calendarApi.removeAllEvents()
				this.calendarApi.unselect()
			}
		},
		
		addParticipant(participant: any): void {
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
			// retrieve availability for the new participant
			this.fetchParticipantAvailability(newParticipant)
		},

		removeParticipant(address: string): void {
			if (!this.selectedProposal) {
				return console.error('No proposal selected for this operation')
			}
			// remove the participant's availability data
			if (this.participantAvailabilityIndividual[address]) {
				delete this.participantAvailabilityIndividual[address]
			}
			// remove the participant from the proposal
			this.selectedProposal.participants = this.selectedProposal.participants.filter((p: ProposalParticipant) => p.address !== address)
			// update the calendar availability
			this.combineParticipantAvailability()
		},
		
		addGroup(participant: any): void {
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
				if (!a.date || !b.date) return 0
				return a.date.getTime() - b.date.getTime()
			})
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
			// Get start and end from FullCalendar's current view
			const view = this.calendarApi.view
			let start = view.activeStart
			let end = view.activeEnd
			const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone
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
			const { events, error } = await getBusySlots(organizer, attendees, start, end, timeZoneId)
			if (error) {
				console.error('Failed to fetch free/busy data:', error)
				showError(t('calendar', 'Failed to fetch free/busy data'))
				return
			}
			events.forEach((event: any) => {
				let resourceId = event.resourceId
				if (resourceId.startsWith('mailto:')) {
					resourceId = resourceId.replace('mailto:', '')
				}
				if (!this.participantAvailabilityIndividual[resourceId]) {
					this.participantAvailabilityIndividual[resourceId] = {}
				}
				this.participantAvailabilityIndividual[resourceId][event.id] = event
			})
			// @ts-ignore
			this.combineParticipantAvailability()
		},
		
		combineParticipantAvailability(): void {
			// gather all busy slots for all participants
			const busySlots: Array<{ start: Date, end: Date }> = []
			Object.values(this.participantAvailabilityIndividual).forEach(eventsObj => {
				Object.values(eventsObj).forEach((event: any) => {
					busySlots.push({ start: new Date(event.start), end: new Date(event.end) })
				})
			})

			// find available slots between busy slots
			const view = this.calendarApi.view
			const start = view.activeStart
			const end = view.activeEnd

			const workingStartHour = 8
			const workingEndHour = 18
			const dayMs = 24 * 60 * 60 * 1000
			this.participantAvailabilityCombined = []
			for (let d = new Date(start); d < end; d = new Date(d.getTime() + dayMs)) {
				const dayStart = new Date(d)
				dayStart.setHours(workingStartHour, 0, 0, 0)
				const dayEnd = new Date(d)
				dayEnd.setHours(workingEndHour, 0, 0, 0)

				// Find all busy slots for this day
				const dayBusy = busySlots
					.filter(slot => (slot.start < dayEnd && slot.end > dayStart))
					.sort((a, b) => a.start.getTime() - b.start.getTime())

				let lastEnd = new Date(dayStart)
				for (let i = 0; i < dayBusy.length; i++) {
					const slot = dayBusy[i]
					// If there's a gap between lastEnd and the start of this busy slot, it's available
					if (slot.start > lastEnd) {
						this.participantAvailabilityCombined.push({ start: new Date(lastEnd), end: new Date(slot.start) })
					}
					// Move lastEnd forward if this busy slot ends later
					if (slot.end > lastEnd) {
						lastEnd = new Date(slot.end)
					}
				}
				// After all busy slots, if there's time left in the working day, add it as available
				if (lastEnd < dayEnd) {
					this.participantAvailabilityCombined.push({ start: new Date(lastEnd), end: new Date(dayEnd) })
				}
			}

			this.renderParticipantAvailability()
		},
		
		renderParticipantAvailability(): void {
			// Clear existing events
			this.calendarApi.removeAllEvents()
			// Add participant availability
			this.participantAvailabilityCombined.forEach(slot => {
				this.calendarApi.addEvent({
					title: 'Available',
					start: slot.start,
					end: slot.end,
					classNames: ['proposal-editview__calendar-availability'],
					allDay: false,
					display: 'background',
				})
			})
			// Add proposed dates
			let duration = parseInt(String(this.selectedProposal?.duration ?? ''), 10);
			this.selectedProposal?.dates.forEach((proposalDate, index) => {
				if (!proposalDate.date) return
				this.calendarApi.addEvent({
					id: `proposed-date-${index}`,
					title: t('calendar', 'Selected'),
					start: proposalDate.date,
					end: new Date(proposalDate.date.getTime() + duration * 60000),
					backgroundColor: '#0073e6',
					borderColor: '#0073e6',
					allDay: false,
					editable: true,
					startEditable: true,
					durationEditable: false,
					extendedProps: {
						proposedDate: true,
						proposedDateId: index,
					}
				});
			});
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
.icon-close {
	display: block;
}

.proposal-modal__content {
	height: 100vh;
	overflow: hidden;
}

.proposal-listview__content {
	padding-bottom: calc(var(--default-grid-baseline) * 4);
	padding-left: calc(var(--default-grid-baseline) * 4);
	padding-right: calc(var(--default-grid-baseline) * 4);
	display: flex;
	flex-direction: column;
	height: 100%;
}

.proposal-listview__row-title {
	flex-shrink: 0;
}

.proposal-listview__row-list {
	flex: 1;
	overflow-y: auto;
	margin-bottom: calc(var(--default-grid-baseline) * 4);
}

.proposal-listview__row-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	background-color: var(--color-main-background);
	flex-shrink: 0;
	padding-top: calc(var(--default-grid-baseline) * 2);
}

.proposal-listview__list-content {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 4);
}

.proposal-listview__list-item {
	transition: background-color 0.2s ease;

	&:hover {
		background-color: var(--color-background-hover);
	}
}

.proposal-listview__list-item-details {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 4);
	align-items: flex-start;
	padding: calc(var(--default-grid-baseline) * 2);
}

.proposal-listview__list-item-overview {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-listview__list-item-title {
	h3 {
		margin-top: 0;
		margin-bottom: calc(var(--default-grid-baseline) * 1);
	}
}

.proposal-listview__list-item-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-listview__list-item-dates {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
}

.proposal-listview__list-item-date {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 4);
}

.proposal-listview__list-item-date-time {
	flex: 1;
	min-width: 0;
}

.proposal-listview__list-item-vote-yes,
.proposal-listview__list-item-vote-no,
.proposal-listview__list-item-vote-maybe {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 4);
	white-space: nowrap;
}

.proposal-editview__content {
	padding-bottom: calc(var(--default-grid-baseline) * 4);
	padding-left: calc(var(--default-grid-baseline) * 4);
	padding-right: calc(var(--default-grid-baseline) * 4);
	display: flex;
	gap: calc(var(--default-grid-baseline) * 4);
	height: calc(100% - calc(var(--default-grid-baseline) * 4));
	overflow: hidden;
}

.proposal-editview__column-left {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	max-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	height: 100%;
}

.proposal-editview__column-right {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	height: calc(100% - calc(var(--default-grid-baseline) * 8));
	margin-top: calc(var(--default-grid-baseline) * 8);
}

.proposal-editview__row-title {
	flex-shrink: 0;
	margin-bottom: calc(var(--default-grid-baseline) * 2);
}

.proposal-editview__row-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	overflow-y: auto;
	margin-bottom: calc(var(--default-grid-baseline) * 2);
	min-height: 0;
}

.proposal-editview__row-actions {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 2);
	background-color: var(--color-main-background);
	flex-shrink: 0;
	padding-top: calc(var(--default-grid-baseline) * 2);
}

.proposal-editview__calendar {
	flex: 1;
	min-height: 0;
}

.proposal-editview__calendar-actions {
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

.proposal-editview__proposal-location-container {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}

.proposal-editview__proposal-location {
	flex: 1;
}

:deep(.proposal-editview__calendar-availability) {
	background: repeating-linear-gradient(45deg, transparent 0px, transparent 10px, var(--color-primary) 10px, var(--color-primary) 15px) !important;
}
</style>