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
				<!-- Row 1: Title -->
				<div class="proposal-editview__row-title">
					<h2>{{ modalEditLabel }}</h2>
				</div>
				<!-- Row 2: Details -->
				<div class="proposal-editview__row-details">
					<div class="proposal-editview__column-details-left">
						<NcTextField class="proposal-editview__proposal-title"
							:label="t('calendar', 'Title')"
							:value.sync="selectedProposal.title" />
						<NcTextArea class="proposal-editview__proposal-description"
							:label="t('calendar', 'Description')"
							:value.sync="selectedProposal.description" />
						<NcTextField class="proposal-editview__proposal-location"
							:label="t('calendar', 'Location')"
							:value.sync="selectedProposal.location" />
						<NcTextField class="proposal-editview__proposal-duration"
							:label="t('calendar', 'Duration')"
							:value.sync="selectedProposal.duration"
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
						<div v-if="selectedProposal.dates.length > 0" class="proposal-editview__column-action-proposed-dates">
							<ProposalDateItem v-for="(entry, idx) in selectedProposal.dates"
								:key="idx"
								:proposal-date="entry"
								@remove-date="onProposalDateRemove(idx)" />
						</div>
					</div>
					<div class="proposal-editview__column-details-right">
						<FullCalendar ref="proposalFullCalendar"
						:options="calendarConfiguration" class="proposal-editview__calendar" />
					</div>
				</div>
				<!-- Row 3: Actions -->
				<div class="proposal-editview__row-actions">
					<NcButton variant="primary" :disabled="!modalEditSaveState" @click="onProposalSave()">{{ modalEditSaveLabel }}</NcButton>
					<NcButton variant="secondary" :disabled="modalEditDestroyState" @click="onProposalDestroy(selectedProposal)">{{ 'Delete proposal' }}</NcButton>
					<NcButton variant="secondary" @click="onEditClose()">{{ t('calendar', 'Cancel') }}</NcButton>
					<NcButton variant="secondary" @click="onModalClose()">{{ t('calendar', 'Close') }}</NcButton>
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

export default {
	name: 'ProposalEditor',

	components: {
		NcEmptyContent,
		NcButton,
		NcChip,
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
	},

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
			currentSlotIndex: 1, // default to 30 min
		}
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
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update proposal') : t('calendar', 'Create proposal')
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
			return !this.selectedProposal || this.selectedProposal.id === null
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

			if (this.currentSlotIndex === undefined) {
				this.currentSlotIndex = 2 // default to 15 min
			}

			return {
				plugins: [FullCalendarTimeGrid, FullCalendarInteraction],
				headerToolbar: {
					left: 'prev,next today',
					center: 'title',
					right: 'zoomIn,zoomOut timeGridWeek,timeGridDay',
				},
				customButtons: {
					zoomIn: {
						text: '+',
						click: () => {
							if (this.currentSlotIndex > 0) {
								this.currentSlotIndex--;
								this.calendarApi?.setOption('slotDuration', slotDurations[this.currentSlotIndex].value);
							}
						}
					},
					zoomOut: {
						text: '-',
						click: () => {
							if (this.currentSlotIndex < slotDurations.length - 1) {
								this.currentSlotIndex++;
								this.calendarApi?.setOption('slotDuration', slotDurations[this.currentSlotIndex].value);
							}
						}
					}
				},
				initialView: 'timeGridWeek',
				allDaySlot: false,
				slotMinTime: '08:00:00',
				slotMaxTime: '18:00:00',
				slotDuration: slotDurations[this.currentSlotIndex].value,
				validRange: {
					start: today,
				},
				nowIndicator: true,
				editable: true,
				eventOverlap: true,
				selectable: true,
				selectMirror: true,
				select: (info: any) => this.onProposalDateAdd(info),
				eventDrop: (info: any) => this.onProposalDateMove(info),
				// Only switch view when clicking the column header date
				dayHeaderDidMount: (arg: any) => {
					arg.el.style.cursor = 'pointer';
					arg.el.addEventListener('click', () => {
						const calendarApi = (this.$refs.proposalFullCalendar as any)?.getApi?.();
						calendarApi?.changeView('timeGridDay', arg.date);
					});
				},
				datesSet: () => {
					if (!this.modalVisible) return
					if (!this.calendarApi) return
					this.fetchParticipantAvailability()
				},
			}
		},
		existingParticipantAddressess(): string[] {
			return this.selectedProposal ? this.selectedProposal.participants.map((p: ProposalParticipant) => p.address) : []
		},
	},
	
	methods: {
		t,
		
		/**
		 * Format a proposal date using the shortest, most localized format
		 * @param {Date} date The date to format
		 * @return {string} Formatted date string
		 */
		formatProposalDate(date: Date | null): string {
			if (!date) {
				return ''
			}
			// Examples: "Mon, Jul 8" (en), "Mon, 8 Jul" (en-GB), "Mo, 8. Jul" (de)
			return moment(date).format('dddd, MMMM D')
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
			const value = (event.target as HTMLInputElement).value;
			// Only allow positive integers
			if (!/^[\d]+$/.test(value)) {
				if (this.selectedProposal) this.selectedProposal.duration = 0;
			} else {
				if (this.selectedProposal) this.selectedProposal.duration = parseInt(value, 10);
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
				// @ts-ignore
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
					backgroundColor: '#5cb85c',
					borderColor: '#5cb85c',
					allDay: false,
					display: 'background',
				})
			})
			// Add proposed dates
			let duration = parseInt(String(this.selectedProposal?.duration ?? ''), 10);
			this.selectedProposal?.dates.forEach((proposalDate, index) => {
				if (!proposalDate.date) return
				this.calendarApi.addEvent({
					title: t('calendar', 'Selected'),
					start: proposalDate.date,
					end: new Date(proposalDate.date.getTime() + duration * 60000),
					backgroundColor: '#0073e6',
					borderColor: '#0073e6',
					allDay: false,
					editable: true, // ensure draggable
					proposedDate: true, // custom property to identify proposed date
					proposedDateId: index, // custom property to identify proposed date id
				});
			});
		},
	},
}
</script>

<style lang="scss" scoped>
.icon-close {
	display: block;
}

.proposal-modal__content {
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
	flex-direction: column;
	height: 100%;
}

.proposal-editview__row-title {
	flex-shrink: 0;
	margin-bottom: calc(var(--default-grid-baseline) * 2);
}

.proposal-editview__row-details {
	display: flex;
	gap: calc(var(--default-grid-baseline) * 4);
	align-items: flex-start;
	flex: 1;
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

.proposal-editview__column-details-left {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	max-width: calc(var(--default-grid-baseline) * 100);
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	overflow-y: auto;
	max-height: 100%;
}

.proposal-editview__column-details-right {
	flex: 1;
	min-width: calc(var(--default-grid-baseline) * 100);
	max-width: 100%;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.proposal-editview__calendar {
	flex: 1;
	min-height: 0;
}
</style>