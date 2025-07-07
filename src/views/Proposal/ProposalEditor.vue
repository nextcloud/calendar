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
				<div class="proposal-listview__row proposal-listview__row-title">
					<h2>{{ t('calendar', 'Meeting Proposal List') }}</h2>
				</div>
				<!-- Row 2: List -->
				<div class="proposal-listview__row proposal-listview__row-list">
					<div v-if="storedProposals.length === 0" class="proposal-listview__proposal-content">
						<NcEmptyContent  name="No proposals found">
							<template #icon>
								<PollIcon />
							</template>
							<template #description>
								{{ t('calendar', 'Create a new proposal to get started.') }}
							</template>
						</NcEmptyContent>
					</div>
					<div v-if="storedProposals.length > 0" class="proposal-listview__proposal-content">
						<div v-for="proposal in storedProposals" :key="proposal.id" class="proposal-listview__proposal-item proposal-listview__proposal-item--horizontal">
							<div class="proposal-listview__proposal-overview">
								<div class="proposal-listview__proposal-title">{{ proposal.title }}</div>
								<div class="proposal-listview__proposal-participants">
									{{ proposal.participants.filter(p => p.status === ProposalParticipantStatus.Responded).length }} / {{ proposal.participants.length }} responded
								</div>
								<div class="proposal-listview__proposal-actions">
									<NcButton size="small" variant="secondary" @click="onProposalModify(proposal)">
										{{ t('calendar', 'Modify') }}
									</NcButton>
									<NcButton size="small" variant="tertiary" @click="onProposalDestroy(proposal)">
										{{ t('calendar', 'Delete') }}
									</NcButton>
								</div>
							</div>
							<div class="proposal-listview__proposal-dates">
								<template v-for="entry in proposal.dates">
									<div class="proposal-listview__proposal-date">
										<span class="proposal-listview__proposal-date-time">
											{{ 
												// TODO: localize and make this more readable
												entry.date.toLocaleString() 	
											}}
										</span>
										<span class="proposal-listview__proposal-vote-yes">
											{{ entry.votedYes }}
											<CheckIcon />
										</span>
										<span class="proposal-listview__proposal-vote-no">
											{{ entry.votedNo }}
											<CloseIcon />
										</span>
										<span class="proposal-listview__proposal-vote-no">
											{{ entry.votedMaybe }}
											<HelpIcon />
										</span>
									</div>
								</template>
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
			<div v-else class="proposal-editview__content">
				<!-- Only render form if selectedProposal is not null -->
				<div v-if="selectedProposal">
					<!-- Row 1: Title -->
					<div class="proposal-editview__row proposal-editview__row-title">
						<h2>{{ modalEditLabel }}</h2>
					</div>
					<!-- Row 2: Basic Details -->
					<div class="proposal-editview__row proposal-editview__row-fields">
						<div class="proposal-editview__column-left">
							<NcTextField class="proposal-editview__title"
								:label="t('calendar', 'Title')"
								:value.sync="selectedProposal.title" />
							<NcTextField class="proposal-editview__duration"
								:label="t('calendar', 'Duration')"
								:value.sync="selectedProposal.duration"
								type="number"
								min="1"
								step="1"
								@input="onProposalDurationChange($event)" />
							<InviteesListSearch class="proposal-editview__participants-selector"
								:already-invited-emails="existingParticipantAddressess"
								@add-attendee="onProposalParticipantAdd" />
						</div>
						<div class="proposal-editview__column-right">
							<NcTextArea class="proposal-editview__description"
								:label="t('calendar', 'Description')"
								:value.sync="selectedProposal.description" />
						</div>
					</div>
					<!-- Row 3: Availability -->
					<div class="proposal-editview__row proposal-editview__row-availability proposal-editview__row-availability--fullwidth">
						<FullCalendar ref="proposalFullCalendar"
							:options="calendarConfiguration" class="proposal-editview__fullcalendar" />
					</div>
					<!-- Row 4: Actions -->
					<div class="proposal-editview__row modal__row-actions">
						<div v-if="selectedProposal.dates.length > 0" class="proposal-editview__column-action-proposed-dates">
							<!-- TODO: localize and make this more readable -->
							<NcChip v-for="(entry, idx) in selectedProposal.dates"
								class="proposal-editview__proposed-date-chip"
								:key="idx"
								:text="entry.date.toLocaleString()"
								@close="onProposalDateRemove(idx)" />
						</div>
						<div v-if="selectedProposal.participants.length > 0" class="proposal-editview__column-action-proposed-participants">
							<NcUserBubble v-for="entry in selectedProposal.participants"
								class="proposal-editview__proposed-participant-chip"
								:key="entry.address"
								:display-name="entry.name"
								:title="entry.address">
								<template #name>
									<a href="#"
										title="Remove Participant"
										class="icon-close"
										@click="onProposalParticipantRemove(entry.address)" />
								</template>
							</NcUserBubble>
						</div>
						<div class="proposal-editview__column-action-buttons">
							<NcButton variant="primary" :disabled="!modalEditSaveState" @click="onProposalSave()">{{ modalEditSaveLabel }}</NcButton>
							<NcButton variant="secondary" :disabled="modalEditDestroyState" @click="onProposalDestroy(selectedProposal)">{{ 'Delete Proposal' }}</NcButton>
							<NcButton variant="secondary" @click="onEditClose()">{{ t('calendar', 'Cancel') }}</NcButton>
							<NcButton variant="secondary" @click="onModalClose()">{{ t('calendar', 'Close') }}</NcButton>
						</div>
					</div>
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
import { defineComponent } from 'vue'
import { t } from '@nextcloud/l10n'
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
import InviteesListSearch from '@/components/Editor/Invitees/InviteesListSearch'
import NcUserBubble from '@nextcloud/vue/components/NcUserBubble'
// icons
import PollIcon from 'vue-material-design-icons/Poll.vue'
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
		NcUserBubble,
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
				return t('calendar', 'Meeting Proposals')
			} else { 
				if (this.selectedProposal?.id) {
					return t('calendar', 'Edit Meeting Proposal')
				} else {
					return t('calendar', 'Create Meeting Proposal')
				}
			}
		},
		modalEditLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update Meeting Proposal') : t('calendar', 'Create Meeting Proposal')
		},
		modalEditSaveLabel(): string {
			return !this.selectedProposal || this.selectedProposal.id ? t('calendar', 'Update Proposal') : t('calendar', 'Create Proposal')
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
					console.error('Failed to save proposal:', error)
				}
			}
		},

		async onProposalSave() {
			try {
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
			if (!participant) {
				return
			}
			if (participant.calendarUserType === 'INDIVIDUAL') {
				return (this as any).addParticipant(participant)
			}
			if (participant.calendarUserType === 'GROUP') {
				return (this as any).addGroup(participant)
			}
		},
		
		onProposalParticipantRemove(address: string): void {
			// remove the participant's availability data
			if (this.participantAvailabilityIndividual[address]) {
				delete this.participantAvailabilityIndividual[address]
			}
			// remove the participant from the proposal
			this.selectedProposal.participants = this.selectedProposal.participants.filter((p: ProposalParticipant) => p.address !== address)
			// update the calendar availability
			this.combineParticipantAvailability()
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
		
		addGroup(participant: any): void {
			if (!participant.email) {
				return
			}
			
			const newParticipant = new ProposalParticipant()
			newParticipant.address = participant.email
			newParticipant.name = participant.commonName || participant.email
			newParticipant.realm = participant.isUser ? ProposalParticipantRealm.Internal : ProposalParticipantRealm.External
			
			this.selectedProposal.participants.push(newParticipant)
		},

		addProposedDate(date: Date): void {
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
	height: 100%;
}
.proposal-listview__content {
  margin: 30px 50px 20px 50px;
  border-radius: 8px;
  padding: 1.5rem 1rem 1rem 1rem;
}
.proposal-listview__row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.proposal-listview__row-title h2 {
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 auto;
  text-align: center;
  width: 100%;
}
.proposal-listview__proposal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.proposal-listview__proposal-item {
  width: 100%;
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.proposal-listview__proposal-item--horizontal {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}
.proposal-listview__proposal-overview {
  width: 40%;
  min-width: 220px;
  box-sizing: border-box;
}
.proposal-listview__proposal-dates {
  width: 60%;
  box-sizing: border-box;
}

.proposal-listview__proposal-row-flex {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;
}
.proposal-listview__proposal-overview {
  width: 40%;
  min-width: 220px;
  box-sizing: border-box;
}
.proposal-listview__proposal-dates {
  width: 60%;
  box-sizing: border-box;
}
.proposal-listview__proposal-title {
  flex: 2 1 40%;
  font-weight: 500;
  font-size: 1.05em;
  color: var(--color-main-text, #222);
  word-break: break-word;
}
.proposal-listview__proposal-participants {
  flex: 1 1 20%;
  font-size: 0.98em;
}
.proposal-listview__proposal-actions {
  display: flex;
  gap: 0.5rem;
}
.proposal-listview__proposal-empty {
  padding: 1rem;
  text-align: center;
}
.proposal-listview__row-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.proposal-modal__content {
  margin: calc(var(--default-grid-baseline) * 12);
}
.proposal-editview__content {
  margin: 30px 50px 20px 50px;
  border-radius: 8px;
  padding: 1.5rem 1rem 1rem 1rem;
}
.proposal-editview__row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.proposal-editview__row-title h2 {
  font-size: 1.3em;
  font-weight: 600;
  margin: 0 auto;
  text-align: center;
  width: 100%;
}
.proposal-editview__row-fields {
  display: flex;
  gap: 2rem;
  align-items: stretch;
  margin-bottom: 0;
}
.proposal-editview__column-left {
  flex: 1 1 48%;
  max-width: 48%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.proposal-editview__column-right {
  flex: 1 1 48%;
  max-width: 48%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.proposal-editview__row-availability {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}
.proposal-editview__participants-selector {
  margin-right: 2rem;
  min-width: 260px;
  align-self: flex-start;
}
.proposal-editview__column-action-proposed-dates,
.proposal-editview__column-action-proposed-participants,
.proposal-editview__column-action-buttons {
  min-width: 0;
  flex-shrink: 1;
  flex-grow: 1;
}
.proposal-editview__column-action-buttons {
  min-width: 180px;
  flex-basis: 180px;
  max-width: 100%;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.5rem;
  display: flex;
  flex-direction: row;
}
.proposal-editview__proposed-date-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 16px;
  padding: 0.25rem 0.75rem 0.25rem 0.75rem;
  font-size: 0.95em;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  min-width: 0;
  word-break: break-word;
  max-width: 100%;
}
@media (max-width: 800px) {
  .proposal-editview__row-fields,
  .proposal-editview__row-availability {
	flex-direction: column;
  }
  .proposal-editview__column-left,
  .proposal-editview__column-right {
	flex: 1 1 100%;
	max-width: 100%;
  }
  .proposal-editview__participants-selector {
	margin-right: 0;
	margin-bottom: 1rem;
	min-width: 0;
  }
  .proposal-editview__column-action-proposed-dates,
  .proposal-editview__column-action-proposed-participants,
  .proposal-editview__column-action-buttons {
	flex: 1 1 100%;
	max-width: 100%;
	justify-content: flex-start;
  }
  .proposal-editview__column-action-buttons {
	justify-content: flex-start;
  }
}
/* Make FullCalendar full width in proposal editor */
.proposal-editview__row-availability--fullwidth {
  width: 100%;
  max-width: 100%;
  padding: 0;
}
.proposal-editview__fullcalendar {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0;
}
.proposal-listview__proposal-overview {
  width: 100%;
  box-sizing: border-box;
}
.proposal-listview__proposal-dates {
  width: 100%;
  box-sizing: border-box;
}
.proposal-listview__proposal-date {
  display: flex;
  align-items: center;
  gap: 1.5em;
  margin-bottom: 0.25em;
  width: 100%;
  flex-wrap: nowrap;
}
.proposal-listview__proposal-date > span {
  display: inline-flex;
  align-items: center;
}
.proposal-listview__proposal-date-time {
  white-space: nowrap;
}

.proposal-listview__row-actions {
	position: sticky;
	bottom: calc(var(--default-grid-baseline) * 4);
	background-color: var(--color-main-background);
}
</style>