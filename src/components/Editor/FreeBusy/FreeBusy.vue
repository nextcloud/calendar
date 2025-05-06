<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal size="full"
		:name="dialogName || $t('calendar', 'Availability of attendees')"
		@close="$emit('close')">
		<div class="modal__content modal--scheduler">
			<div v-if="loadingIndicator" class="loading-indicator">
				<div class="icon-loading" />
			</div>
			<p v-if="isMobile && freeSlots && !disableFindTime">
				{{ $t('calendar', 'Available times:') }}
				<NcSelect class="available-slots__multiselect"
					:options="freeSlots"
					:placeholder="placeholder"
					:clearable="false"
					input-id="slot"
					label="displayStart"
					:label-outside="true"
					:value="selectedSlot"
					@option:selected="setSlotSuggestion">
					<template #selected-option="{}">
						{{ $t('calendar', 'Suggestion accepted') }}
					</template>
				</NcSelect>
			</p>
			<div class="modal__content__header">
				<div v-if="isMobile" class="modal__content__header__attendees">
					{{ `${eventTitle ?? ''} ${t('calendar', 'with')}` }}
					<NcUserBubble :size="24" :display-name="organizer.commonName" />
					<NcUserBubble v-for="attendee in attendees"
						:key="attendee.id"
						:size="24"
						class="modal__content__header__attendees__user-bubble"
						:display-name="attendee.commonName">
						<template #name>
							<a href="#"
								title="Remove user"
								class="icon-close"
								@click="removeAttendee(attendee)" />
						</template>
					</NcUserBubble>
				</div>
			</div>
			<p v-if="!isMobile && freeSlots && !disableFindTime">
				{{ $t('calendar', 'Available times:') }}
				<NcSelect class="available-slots__multiselect"
					:options="freeSlots"
					:placeholder="placeholder"
					:clearable="false"
					input-id="slot"
					label="displayStart"
					:label-outside="true"
					:value="selectedSlot"
					@option:selected="setSlotSuggestion">
					<template #selected-option="{}">
						{{ $t('calendar', 'Suggestion accepted') }}
					</template>
				</NcSelect>
			</p>
			<div class="modal__content__actions">
				<InviteesListSearch v-if="isMobile"
					class="modal__content__actions__select"
					:already-invited-emails="alreadyInvitedEmails"
					:organizer="organizer"
					@add-attendee="addAttendee" />
				<div v-if="isMobile" class="modal__content__actions__date">
					<NcButton type="secondary"
						:aria-label="t('calendar', 'Today')"
						@click="handleActions('today')">
						{{ $t('calendar', 'Today') }}
					</NcButton>
					<NcButton type="secondary"
						:aria-label="isRTL? t('calendar', 'Previous date') : t('calendar', 'Next date')"
						@click="handleActions(isRTL ? 'next' : 'prev')">
						<template #icon>
							<ChevronRightIcon v-if="isRTL" :size="22" />
							<ChevronLeftIcon v-else :size="22" />
						</template>
					</NcButton>
					<NcDateTimePickerNative :hide-label="true"
						:value="currentStart"
						@input="(date)=>handleActions('picker', date)" />
					<NcButton type="secondary"
						:aria-label="isRTL? t('calendar', 'Next date') : t('calendar', 'Previous date')"
						@click="handleActions(isRTL ? 'prev' : 'next')">
						<template #icon>
							<ChevronLeftIcon v-if="isRTL" :size="22" />
							<ChevronRightIcon v-else :size="22" />
						</template>
					</NcButton>
					<NcPopover :focus-trap="false">
						<template #trigger>
							<NcButton type="tertiary-no-background"
								:aria-label="t('calendar', 'Legend')">
								<template #icon>
									<HelpCircleIcon :size="20" />
								</template>
							</NcButton>
						</template>
						<template #default>
							<div class="freebusy-caption">
								<div class="freebusy-caption__calendar-user-types" />
								<div class="freebusy-caption__colors">
									<div class="freebusy-caption-item">
										<div class="freebusy-caption-item__color"
											:style=" { 'background': 'repeating-linear-gradient(45deg, #dbdbdb, #dbdbdb 1px, transparent 1px, transparent 3.5px)'}" />
										<div class="
											freebusy-caption-item__label">
											{{ $t('calendar', 'Out of office') }}
										</div>
									</div>
								</div>
							</div>
						</template>
					</NcPopover>
				</div>
			</div>
			<div class="modal__content__title">
				<div v-if="!isMobile" class="modal__content__actions__title__date">
					<NcButton type="secondary"
						:aria-label="t('calendar', 'Today')"
						@click="handleActions('today')">
						{{ $t('calendar', 'Today') }}
					</NcButton>
					<NcButton type="secondary"
						:aria-label="isRTL? t('calendar', 'Previous date') : t('calendar', 'Next date')"
						@click="handleActions(isRTL ? 'next' : 'prev')">
						<template #icon>
							<ChevronRightIcon v-if="isRTL" :size="22" />
							<ChevronLeftIcon v-else :size="22" />
						</template>
					</NcButton>
					<NcDateTimePickerNative :hide-label="true"
						:value="currentStart"
						@input="(date)=>handleActions('picker', date)" />
					<NcButton type="secondary"
						:aria-label="isRTL? t('calendar', 'Next date') : t('calendar', 'Previous date')"
						@click="handleActions(isRTL ? 'prev' : 'next')">
						<template #icon>
							<ChevronLeftIcon v-if="isRTL" :size="22" />
							<ChevronRightIcon v-else :size="22" />
						</template>
					</NcButton>
					<NcPopover :focus-trap="false">
						<template #trigger>
							<NcButton type="tertiary-no-background">
								<template #icon>
									<HelpCircleIcon :size="20" />
								</template>
							</NcButton>
						</template>
						<template #default>
							<div class="freebusy-caption">
								<div class="freebusy-caption__calendar-user-types" />
								<div class="freebusy-caption__colors">
									<div class="freebusy-caption-item">
										<div class="freebusy-caption-item__color"
											:style=" { 'background': 'repeating-linear-gradient(45deg, #dbdbdb, #dbdbdb 1px, transparent 1px, transparent 3.5px)'}" />
										<div class="
											freebusy-caption-item__label">
											{{ $t('calendar', 'Out of office') }}
										</div>
									</div>
								</div>
							</div>
						</template>
					</NcPopover>
				</div>
				<h2>{{ $t('calendar', 'Week #{weekNumber}', { weekNumber: weekNumber }) }}</h2>
				<div class="modal__content__title__buttons">
					<NcButton :type="view === 'timeGridWeek' ? 'secondary' : 'tertiary'"
						:disabled="view === 'timeGridWeek'"
						@click="updateView('timeGridWeek')">
						{{ t('calendar','Week') }}
					</NcButton>
					<NcButton :type="view === 'timeGridDay' ? 'secondary' : 'tertiary'"
						:disabled="view === 'timeGridDay'"
						@click="updateView('timeGridDay')">
						{{ t('calendar','Day') }}
					</NcButton>
				</div>
			</div>
			<div class="modal__content__body">
				<div v-if="!isMobile" class="modal__content__body__attendees">
					<InviteesListSearch class="modal__content__actions__select"
						:already-invited-emails="alreadyInvitedEmails"
						:organizer="organizer"
						@add-attendee="addAttendee" />
					<NcListItemIcon :name="organizer.commonName"
						class="modal__content__body__attendees__item" />
					<NcListItemIcon v-for="attendee in attendees"
						:key="attendee.id"
						:name="attendee.commonName"
						class="modal__content__body__attendees__item">
						<NcActions>
							<NcActionButton @click="removeAttendee(attendee)">
								<template #icon>
									<Delete :size="20" />
								</template>
								Delete
							</NcActionButton>
						</NcActions>
					</NcListItemIcon>
				</div>
				<FullCalendar ref="freeBusyFullCalendar"
					:options="options" />
			</div>
		</div>
		<div class="modal__content__footer">
			<div>
				<p class="modal__content__footer__date">
					{{ formattedCurrentStart }}
				</p>
				<p>{{ formattedCurrentTime }}<span class="modal__content__footer__timezone">{{ formattedTimeZone }}</span></p>
			</div>
			<NcButton type="primary"
				@click="save">
				{{ $t('calendar', 'Done') }}
				<template #icon>
					<CheckIcon :size="20" />
				</template>
			</NcButton>
		</div>
	</NcModal>
</template>

<script>
// Import FullCalendar itself
import FullCalendar from '@fullcalendar/vue'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Import event sources
import freeBusyEventSource from '../../../fullcalendar/eventSources/freeBusyEventSource.js'

// Import localization plugins
import { getDateFormattingConfig } from '../../../fullcalendar/localization/dateFormattingConfig.js'
import { getFullCalendarLocale } from '../../../fullcalendar/localization/localeProvider.js'
import momentPluginFactory from '../../../fullcalendar/localization/momentPlugin.js'

// Import timezone plugins
import VTimezoneNamedTimezone from '../../../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'

import { NcDateTimePickerNative, NcButton, NcPopover, NcUserBubble, NcModal, NcSelect, NcListItemIcon, NcActions, NcActionButton } from '@nextcloud/vue'
import isMobile from '@nextcloud/vue/dist/Mixins/isMobile.js'
import { AttendeeProperty } from '@nextcloud/calendar-js'
import { isRTL } from '@nextcloud/l10n'

import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import HelpCircleIcon from 'vue-material-design-icons/HelpCircle.vue'

import InviteesListSearch from '../Invitees/InviteesListSearch.vue'

import { getFirstFreeSlot, getBusySlots } from '../../../services/freeBusySlotService.js'
import dateFormat from '../../../filters/dateFormat.js'
import { mapState } from 'pinia'
import useSettingsStore from '../../../store/settings.js'
import useCalendarsStore from '../../../store/calendars.js'
import { uidToHexColor } from '../../../utils/color.js'

export default {
	name: 'FreeBusy',
	components: {
		NcSelect,
		FullCalendar,
		InviteesListSearch,
		NcActions,
		NcActionButton,
		NcDateTimePickerNative,
		NcModal,
		NcButton,
		NcPopover,
		NcUserBubble,
		NcListItemIcon,
		ChevronRightIcon,
		ChevronLeftIcon,
		CheckIcon,
		HelpCircleIcon,
		Delete,
	},
	mixins: [isMobile],
	props: {
		/**
		 * The organizer object.
		 * See /src/models/attendee.js for details
		 */
		organizer: {
			type: Object,
			required: true,
		},
		/**
		 * The attendee objects.
		 * See /src/models/attendee.js for details
		 */
		attendees: {
			type: Array,
			required: true,
		},
		/**
		 * The start-date to query free-busy information from
		 */
		startDate: {
			type: Date,
			required: true,
		},
		/**
		 * The end-date to query free-busy information from
		 */
		endDate: {
			type: Date,
			required: true,
		},
		allDay: {
			type: Boolean,
			default: false,
		},
		eventTitle: {
			type: String,
			default: '',
		},
		alreadyInvitedEmails: {
			type: Array,
			default: () => [],
		},
		dialogName: {
			type: String,
			required: false,
			default: null,
		},
		disableFindTime: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			loadingIndicator: true,
			currentIsAllDay: this.allDay,
			currentStart: this.startDate,
			currentEnd: this.endDate,
			lang: getFullCalendarLocale().locale,
			formattingOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
			freeSlots: [],
			selectedSlot: null,
			view: 'timeGridWeek',
			// used to avoid double update of start and end date
			navigatingWithButtons: false,
		}
	},
	computed: {
		...mapState(useSettingsStore, {
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState(useSettingsStore, ['showWeekends', 'showWeekNumbers', 'timezone']),
		...mapState(useCalendarsStore, {
			personalCalendarColor: 'getPersonalCalendarColor',
		}),
		isRTL() {
			return isRTL()
		},
		placeholder() {
			return this.$t('calendar', 'Select automatic slot')
		},
		/**
		 * FullCalendar Plugins
		 *
		 * @return {(PluginDef)[]}
		 */
		plugins() {
			return [
				timeGridPlugin,
				momentPluginFactory(),
				VTimezoneNamedTimezone,
				interactionPlugin,
			]
		},
		formattedCurrentStart() {
			// Check if the event spawns over multiple days
			if (this.currentStart.getDate() !== this.currentEnd.getDate()) {
				return this.currentStart.toLocaleDateString(this.lang, this.formattingOptions) + ' - '
					+ this.currentEnd.toLocaleDateString(this.lang, this.formattingOptions)
			}
			return this.currentStart.toLocaleDateString(this.lang, this.formattingOptions)
		},
		weekNumber() {
			  const date = new Date(this.currentStart)
			  date.setDate(date.getDate() + 4 - (date.getDay() || 7))
			  const yearStart = new Date(date.getFullYear(), 0, 1)
			  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7)
		},
		formattedCurrentTime() {
			const options = { hour: '2-digit', minute: '2-digit', hour12: true }

			const startTime = this.currentStart.toLocaleTimeString(this.lang, options)
			const endTime = this.currentEnd?.toLocaleTimeString(this.lang, options)

			return `${startTime} - ${endTime} `
		},
		formattedTimeZone() {
			return this.timezoneId.replace('/', '-')
		},
		eventSources() {
			const attendees = this.attendees.map((a) => a.attendeeProperty)
			const organizer = new AttendeeProperty('ATTENDEE', this.organizer.attendeeProperty.email)
			organizer.commonName = this.organizer.attendeeProperty.commonName
			return [...attendees, organizer].map((a) => freeBusyEventSource(
				this._uid,
				this.organizer.attendeeProperty,
				a,
			))
		},
		resources() {
			const resources = []
			const roles = {
				CHAIR: this.$t('calendar', 'chairperson'),
				'REQ-PARTICIPANT': this.$t('calendar', 'required participant'),
				'NON-PARTICIPANT': this.$t('calendar', 'non-participant'),
				'OPT-PARTICIPANT': this.$t('calendar', 'optional participant'),
			}
			for (const attendee of [this.organizer, ...this.attendees]) {
				let title = attendee.commonName || attendee.uri.slice(7)
				if (attendee === this.organizer) {
					title = this.$t('calendar', '{organizer} (organizer)', {
						organizer: title,
					})
				} else {
					title = this.$t('calendar', '{attendee} ({role})', {
						attendee: title,
						role: roles[attendee.role],
					})
				}

				resources.push({
					id: attendee.attendeeProperty.email,
					title,
				})
			}
			// Sort the resources by ID, just like fullcalendar does. This ensures that
			// the fake blocking event can know the first and last resource reliably
			// ref https://fullcalendar.io/docs/resourceOrder
			resources.sort((a, b) => (a.id > b.id) - (a.id < b.id))

			return resources
		},
		/**
		 * Configuration options for FullCalendar
		 * Please see https://fullcalendar.io/docs#toc for details
		 *
		 * @return {object}
		 */
		options() {
			return {
				// Initialization:
				initialView: this.view,
				initialDate: this.currentStart,
				schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
				// Data
				eventSources: this.eventSources,
				// Plugins
				plugins: this.plugins,
				// Interaction:
				editable: false,
				selectable: true,
				select: this.handleSelect,
				eventDidMount: this.eventDidMount,
				eventChange: this.handleChange,
				// Localization:
				...getDateFormattingConfig(),
				...getFullCalendarLocale(),
				// Rendering
				height: 'auto',
				loading: this.loading,
				headerToolbar: false,
				// Timezones:
				timeZone: this.timezoneId,
				// Formatting of the title
				// will produce something like "Tuesday, September 18, 2018"
				// ref https://fullcalendar.io/docs/date-formatting
				titleFormat: {
				  month: 'long',
				  year: 'numeric',
				  day: 'numeric',
				  weekday: 'long',
				},
				dateClick: this.findFreeSlots(),
			}
		},
	},
	watch: {
		view(newView) {
			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			calendar.changeView(newView)
		},
		attendees(newVal) {
			if (newVal.length === 0) {
				this.$emit('close:no-attendees')
			}
		},
	},
	mounted() {
		const calendar = this.$refs.freeBusyFullCalendar.getApi()
		this.view = this.attendees.length > 4 || this.isMobile ? 'timeGridDay' : 'timeGridWeek'
		if (this.allDay) {
			this.currentEnd.setDate(this.currentEnd.getDate() + 1)
		}
		calendar.addEvent({
			id: 'selected-event-slot',
			title: 'Selected slot',
			start: this.currentStart,
			end: this.currentEnd,
			textColor: '#fff',
			backgroundColor: 'rgba(0, 0, 0, 0)',
			editable: true,
			overlap: true,
			allDay: this.allDay,
		})

		this.findFreeSlots()
	},
	methods: {
		updateView(view) {
			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			calendar.changeView(view)
			this.view = view
		},
		handleSelect(arg) {
			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			this.currentStart = arg.start
			this.currentEnd = arg.end
			this.currentIsAllDay = arg.allDay
			calendar.getEventById('selected-event-slot').setDates(arg.start, arg.end)
		},
		handleChange(e) {
			if (this.navigatingWithButtons) {
				this.navigatingWithButtons = false
				return
			}
			// Selected slot is the only editable event
			if (e.event.id === 'selected-event-slot') {
				this.currentStart = e.event.start
				this.currentEnd = e.event.end
			}

		},
		eventDidMount(e) {
			const eventElement = e.el
			if (e.event.id === 'selected-event-slot') {
				eventElement.style.setProperty('border', `2px solid ${this.personalCalendarColor}`, 'important')
				return
			}
			if (e.event.title === this.organizer.attendeeProperty.commonName && e.el.classList.contains('free-busy-busy-unavailable')) {
				eventElement.style.background = 'repeating-linear-gradient(45deg, #dbdbdb, #dbdbdb 1px, transparent 1px, transparent 3.5px)'
				return
			}
			const color = uidToHexColor(e.event.title)
			eventElement.style.background = `repeating-linear-gradient(45deg, ${color}, ${color} 1px, transparent 1px, transparent 3.5px)`
		},
		save() {
			this.$emit('update-dates', { start: this.currentStart, end: this.currentEnd })
		},
		addAttendee(attendee) {
			this.$emit('add-attendee', attendee)
			this.findFreeSlots()
		},
		removeAttendee(attendee) {
			this.$emit('remove-attendee', attendee)
			this.findFreeSlots()
		},
		loading(isLoading) {
			this.loadingIndicator = isLoading
		},
		handleActions(action, date = null) {
			this.navigatingWithButtons = true
			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			switch (action) {
			case 'today':
				calendar.today()
				break
			case 'prev':
				calendar.prev()
				break
			case 'next':
				calendar.next()
				break
			case 'picker':
				calendar.gotoDate(date)
				break
			}

			const newStart = calendar.getDate()
			const oldStart = new Date(this.currentStart)
			const oldEnd = new Date(this.currentEnd)

			// we want to preserve hh:mm as actions are only for changing the date
			oldStart.setDate(newStart.getDate())
			oldStart.setMonth(newStart.getMonth())
			oldStart.setFullYear(newStart.getFullYear())

			oldEnd.setDate(this.currentIsAllDay ? newStart.getDate() + 1 : newStart.getDate())
			oldEnd.setMonth(newStart.getMonth())
			oldEnd.setFullYear(newStart.getFullYear())

			this.currentStart = oldStart
			this.currentEnd = oldEnd

			calendar.getEventById('selected-event-slot').setStart(this.currentStart)
			calendar.getEventById('selected-event-slot').setEnd(this.currentEnd)
			this.findFreeSlots()
		},
		async findFreeSlots() {
			// Doesn't make sense for multiple days
			if (this.currentStart.getDate() !== this.currentEnd.getDate()) {
				return
			}

			// Needed to update with full calendar widget changes
			const startSearch = new Date(this.currentStart)

			const endSearch = new Date(this.currentEnd)

			try {
				// for now search slots only in the first week days
				const endSearchDate = new Date(startSearch)
				endSearchDate.setDate(startSearch.getDate() + 8)
				const eventResults = await getBusySlots(
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty),
					startSearch,
					endSearchDate,
					this.timezoneId,
				)

				const freeSlots = getFirstFreeSlot(
					startSearch,
					endSearch,
					eventResults.events,
				)

				freeSlots.forEach((slot) => {
					slot.displayStart = dateFormat(slot.start, false, getFullCalendarLocale().locale)
				})

				this.freeSlots = freeSlots
			} catch (error) {
				// Handle error here
				console.error('Error occurred while finding free slots:', error)
				throw error // Re-throwing the error to handle it in the caller
			}
		},
		setSlotSuggestion(slot) {
			this.selectedSlot = slot

			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			calendar.gotoDate(slot.start)

			// have to make these "selected" version of the props seeing as they can't be modified directly, and they aren't updated reactively when vuex is
			this.currentStart = slot.start
			this.currentEnd = slot.end
		},
	},
}
</script>

<style lang='scss' scoped>
.icon-close {
	display: block;
	height: 100%;
}
.modal__content {
	padding: 0 calc(var(--default-grid-baseline)*4);
	&__actions{
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		margin-bottom: calc(var(--default-grid-baseline)*4);
		;
		&__select{
			width: 260px;
		}
		&__date{
			display: flex;
			justify-content: space-between;
			align-items: center;
			& > *{
				margin-inline-start: var(--default-grid-baseline);
			}
		}
		&__title{
			&__date{
				display: flex;
				justify-content: space-between;
				align-items: center;
				& > *{
					margin-inline-start: var(--default-grid-baseline);
				}
			}
		}
	}
	&__title{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: calc(var(--default-grid-baseline)*4);
		h2{
			font-weight: 500;
			margin: 0;
		}
		&__buttons{
			display: flex;
			justify-content: flex-end;
			align-items: center;
		}
	}
	&__header{
		margin: calc(var(--default-grid-baseline)*4) 0;
		h3{
			font-weight: 500;
		}
		&__attendees{
			&__user-bubble{
				margin-inline-end: var(--default-grid-baseline);
			}
		}
	}
	&__body{
		display: flex;
		&__attendees{
			display: flex;
			flex-direction: column;
			margin-inline-end: calc(2 * var(--default-grid-baseline));
		}
	}
	&__footer{
		z-index: 9998;
		width: calc(100% - 24px);
		padding: 0 12px;
		right: 0;
		display: flex;
		justify-content: space-between;
		position: absolute;
		bottom: 10px;
		align-items: flex-end;
		&__date{
			margin-top: calc(var(--default-grid-baseline)*4);
			font-weight: 600;
		}
		&__timezone{
				color: var(--color-text-lighter);
			}
	}
}
:deep(.vs__search ) {
	text-overflow: ellipsis;
}
:deep(.mx-input) {
	height: 38px !important;
}
:deep(.fc-event) {
	margin-inline-end: 0 !important;
	border-radius: 6px !important;
	border: 2px solid transparent !important;
}
:deep(.fc-event-time){
	display: none !important;
}

</style>

<style lang="scss">
.blocking-event-free-busy {
	// Show the blocking event above any other blocks, especially the *blocked for all* one
	z-index: 3 !important;
}

.free-busy-block {
	opacity: 0.7 !important;
}
</style>
