<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcDialog size="large"
		:name="dialogName || $t('calendar', 'Availability of attendees, resources and rooms')"
		@closing="$emit('close')">
		<div class="modal__content modal--scheduler">
			<div v-if="loadingIndicator" class="loading-indicator">
				<div class="icon-loading" />
			</div>
			<div class="modal__content__header">
				<h2>{{ $t('calendar', 'Find a time') }}</h2>
				<h3>{{ eventTitle }}</h3>
				<div class="modal__content__header__attendees">
					{{ t('calendar', 'with') }}
					<NcUserBubble size="24" :display-name="organizer.commonName" />
					<NcUserBubble v-for="attendee in attendees"
						:key="attendee.id"
						size="24"
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
			<div class="modal__content__actions">
				<InviteesListSearch class="modal__content__actions__select"
					:already-invited-emails="alreadyInvitedEmails"
					:organizer="organizer"
					@add-attendee="addAttendee" />
				<div class="modal__content__actions__date">
					<NcButton type="secondary"
						@click="handleActions('today')">
						{{ $t('calendar', 'Today') }}
					</NcButton>
					<NcButton type="secondary"
						@click="handleActions('left')">
						<template #icon>
							<ChevronLeftIcon :size="20" />
						</template>
					</NcButton>
					<NcButton type="secondary"
						@click="handleActions('right')">
						<template #icon>
							<ChevronRightIcon :size="20" />
						</template>
					</NcButton>

					<NcDateTimePickerNative :hide-label="true"
						:value="currentDate"
						@input="(date)=>handleActions('picker', date)" />
					<NcPopover :focus-trap="false">
						<template #trigger>
							<NcButton type="tertiary-no-background">
								<template #icon>
									<HelpCircleIcon :size="20" />
								</template>
							</NcButton>
						</template>
						<template>
							<div class="freebusy-caption">
								<div class="freebusy-caption__calendar-user-types" />
								<div class="freebusy-caption__colors">
									<div v-for="color in colorCaption" :key="color.color" class="freebusy-caption-item">
										<div class="freebusy-caption-item__color" :style="{ 'background-color': color.color }" />
										<div class="freebusy-caption-item__label">
											{{ color.label }}
										</div>
									</div>
								</div>
							</div>
						</template>
					</NcPopover>
				</div>
			</div>
			<FullCalendar ref="freeBusyFullCalendar"
				:options="options" />
			<div v-if="!disableFindTime" class="modal__content__footer">
				<div class="modal__content__footer__title">
					<p v-if="freeSlots">
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
					<h3>
						{{ formattedCurrentStart }}
					</h3>
					<p>{{ formattedCurrentTime }}<span class="modal__content__footer__title__timezone">{{ formattedTimeZone }}</span></p>
				</div>

				<NcButton type="primary"
					@click="save">
					{{ $t('calendar', 'Done') }}
					<template #icon>
						<CheckIcon :size="20" />
					</template>
				</NcButton>
			</div>
		</div>
	</NcDialog>
</template>

<script>
// Import FullCalendar itself
import FullCalendar from '@fullcalendar/vue'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import interactionPlugin from '@fullcalendar/interaction'

import { NcDateTimePickerNative, NcButton, NcPopover, NcUserBubble, NcDialog, NcSelect } from '@nextcloud/vue'
// Import event sources
import freeBusyBlockedForAllEventSource from '../../../fullcalendar/eventSources/freeBusyBlockedForAllEventSource.js'
import freeBusyFakeBlockingEventSource from '../../../fullcalendar/eventSources/freeBusyFakeBlockingEventSource.js'
import freeBusyResourceEventSource from '../../../fullcalendar/eventSources/freeBusyResourceEventSource.js'

// Import localization plugins
import { getDateFormattingConfig } from '../../../fullcalendar/localization/dateFormattingConfig.js'
import { getFullCalendarLocale } from '../../../fullcalendar/localization/localeProvider.js'
import momentPluginFactory from '../../../fullcalendar/localization/momentPlugin.js'

// Import timezone plugins
import VTimezoneNamedTimezone from '../../../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'

import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue'
import CheckIcon from 'vue-material-design-icons/Check.vue'
import HelpCircleIcon from 'vue-material-design-icons/HelpCircle.vue'

import InviteesListSearch from '../Invitees/InviteesListSearch.vue'

import { getColorForFBType } from '../../../utils/freebusy.js'
import { getFirstFreeSlot, getBusySlots } from '../../../services/freeBusySlotService.js'
import dateFormat from '../../../filters/dateFormat.js'
import { mapState } from 'pinia'
import useSettingsStore from '../../../store/settings.js'

export default {
	name: 'FreeBusy',
	components: {
		NcSelect,
		FullCalendar,
		InviteesListSearch,
		NcDateTimePickerNative,
		NcDialog,
		NcButton,
		NcPopover,
		NcUserBubble,
		ChevronRightIcon,
		ChevronLeftIcon,
		CheckIcon,
		HelpCircleIcon,
	},
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
		},
		disableFindTime: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			loadingIndicator: true,
			currentDate: this.startDate,
			currentStart: this.startDate,
			currentEnd: this.endDate,
			lang: getFullCalendarLocale().locale,
			formattingOptions: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
			freeSlots: [],
			selectedSlot: null,
		}
	},
	mounted() {
		const calendar = this.$refs.freeBusyFullCalendar.getApi()
		calendar.scrollToTime(this.scrollTime)

		this.findFreeSlots()
	},
	computed: {
		...mapState(useSettingsStore, {
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState(useSettingsStore, ['showWeekends', 'showWeekNumbers', 'timezone']),
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
				resourceTimelinePlugin,
				momentPluginFactory(),
				VTimezoneNamedTimezone,
				interactionPlugin,
			]
		},
		formattedCurrentStart() {
			return this.currentDate.toLocaleDateString(this.lang, this.formattingOptions)
		},
		formattedCurrentTime() {
			const options = { hour: '2-digit', minute: '2-digit', hour12: true }

			const startTime = this.currentStart.toLocaleTimeString(this.lang, options)
			const endTime = this.currentEnd.toLocaleTimeString(this.lang, options)

			return `${startTime} - ${endTime} `
		},
		scrollTime() {
			const options = { hour: '2-digit', minute: '2-digit', seconds: '2-digit', hour12: false }

			return this.currentDate.getHours() > 0 ? new Date(this.currentDate.getTime() - 60 * 60 * 1000).toLocaleTimeString(this.lang, options) : '10:00:00'
		},
		formattedTimeZone() {
			return this.timezoneId.replace('/', '-')
		},
		eventSources() {
			return [
				freeBusyResourceEventSource(
					this._uid,
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty),
				),
				freeBusyFakeBlockingEventSource(
					this._uid,
					this.resources,
					this.currentStart,
					this.currentEnd,
				),
				freeBusyBlockedForAllEventSource(
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty),
					this.resources,
				),
			]
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
		 * List of possible Free-Busy values.
		 * This is used as legend.
		 *
		 * @return {({color: string, label: string})[]}
		 */
		colorCaption() {
			return [{
				// TRANSLATORS: free as in available
				label: this.$t('calendar', 'Free'),
				color: getColorForFBType('FREE'),
			}, {
				label: this.$t('calendar', 'Busy (tentative)'),
				color: getColorForFBType('BUSY-TENTATIVE'),
			}, {
				label: this.$t('calendar', 'Busy'),
				color: getColorForFBType('BUSY'),
			}, {
				label: this.$t('calendar', 'Out of office'),
				color: getColorForFBType('BUSY-UNAVAILABLE'),
			}, {
				label: this.$t('calendar', 'Unknown'),
				color: getColorForFBType('UNKNOWN'),
			}]
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
				initialView: 'resourceTimelineDay',
				initialDate: this.currentStart,
				schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
				// Data
				eventSources: this.eventSources,
				resources: this.resources,
				// Plugins
				plugins: this.plugins,
				// Interaction:
				editable: false,
				selectable: true,
				select: this.handleSelect,
				// Localization:
				...getDateFormattingConfig(),
				...getFullCalendarLocale(),
				// Rendering
				height: 'auto',
				loading: this.loading,
				headerToolbar: false,
				resourceAreaColumns: [
					{
						field: 'title',
						headerContent: 'Attendees',
					},
				],
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
	methods: {
		handleSelect(arg) {
			this.currentStart = arg.start
			this.currentEnd = arg.end
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
			const calendar = this.$refs.freeBusyFullCalendar.getApi()
			switch (action) {
			case 'today':
				calendar.today()
				break
			case 'left':
				calendar.prev()
				break
			case 'right':
				calendar.next()
				break
			case 'picker':
				calendar.gotoDate(date)
				break
			}
			this.currentDate = calendar.getDate()
			calendar.scrollToTime(this.scrollTime)
			this.findFreeSlots()
		},
		async findFreeSlots() {
			// Doesn't make sense for multiple days
			if (this.currentStart.getDate() !== this.currentEnd.getDate()) {
				return
			}

			// Needed to update with full calendar widget changes
			const startSearch = new Date(this.currentStart)
			startSearch.setDate(this.currentDate.getDate())
			startSearch.setMonth(this.currentDate.getMonth())
			startSearch.setYear(this.currentDate.getFullYear())

			const endSearch = new Date(this.currentEnd)
			endSearch.setDate(this.currentDate.getDate())
			endSearch.setMonth(this.currentDate.getMonth())
			endSearch.setYear(this.currentDate.getFullYear())

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
			calendar.scrollToTime(this.scrollTime)

			// have to make these "selected" version of the props seeing as they can't be modified directly, and they aren't updated reactively when vuex is
			this.currentStart = slot.start
			this.currentEnd = slot.end
			const clonedDate = new Date(slot.start) // so as not to modify slot.start
			this.currentDate = new Date(clonedDate.setHours(0, 0, 0, 0))
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
	padding: 50px;
	//when the calendar is open, it's cut at the bottom, adding a margin fixes it
	margin-bottom: 95px;
	&__actions{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		&__select{
			width: 260px;
		}
		&__date{
			display: flex;
			justify-content: space-between;
			align-items: center;
			& > *{
				margin-left: 5px;
			}
		}
	}
	&__header{
		margin-bottom: 20px;
		h3{
			font-weight: 500;
		}
		&__attendees{
			&__user-bubble{
				margin-right: 5px;
			}
		}
	}
	&__footer{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
		&__title{
			h3{
				font-weight: 500;
			}
			&__timezone{
				color: var(--color-text-lighter);
			}
		}
	}
}
:deep(.vs__search ) {
	text-overflow: ellipsis;
}
:deep(.mx-input) {
	height: 38px !important;
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
