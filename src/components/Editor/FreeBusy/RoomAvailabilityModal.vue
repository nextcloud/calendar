<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcModal size="large"
		:show="show"
		:name="$t('calendar', 'Check room availability')"
		@update:show="(e) => $emit('update:show', e)">
		<div class="modal__content">
			<div class="modal__content__header">
				<h2>{{ $t('calendar', 'Find a time') }}</h2>
			</div>
			<div class="modal__content__actions">
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

					<NcDateTimePickerNative :id="datePickerInputId"
						:hide-label="true"
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
										<div class="fregetebusy-caption-item__label">
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
		</div>
	</NcModal>
</template>
<script>
import { NcButton, NcDateTimePickerNative, NcModal, NcPopover } from '@nextcloud/vue'
import { getFullCalendarLocale } from '../../../fullcalendar/localization/localeProvider.js'
import FullCalendar from '@fullcalendar/vue'
import { getDateFormattingConfig } from '../../../fullcalendar/localization/dateFormattingConfig.js'
import { getBusySlots, getFirstFreeSlot } from '../../../services/freeBusySlotService.js'
import dateFormat from '../../../filters/dateFormat.js'
import { getColorForFBType } from '../../../utils/freebusy.js'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import momentPluginFactory from '../../../fullcalendar/localization/momentPlugin.js'
import VTimezoneNamedTimezone from '../../../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'
import interactionPlugin from '@fullcalendar/interaction'
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue'
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue'
import HelpCircleIcon from 'vue-material-design-icons/HelpCircle.vue'
import freeBusyBlockedForAllEventSource from '../../../fullcalendar/eventSources/freeBusyBlockedForAllEventSource.js'
import freeBusyFakeBlockingEventSource from '../../../fullcalendar/eventSources/freeBusyFakeBlockingEventSource.js'
import freeBusyResourceEventSource from '../../../fullcalendar/eventSources/freeBusyResourceEventSource.js'
import { mapPrincipalObjectToAttendeeObject } from '../../../models/attendee.js'
import { mapState } from 'pinia'
import useSettingsStore from '../../../store/settings.js'
import { randomId } from '../../../utils/randomId.js'

export default {
	name: 'RoomAvailabilityModal',
	components: {
		ChevronRightIcon,
		ChevronLeftIcon,
		HelpCircleIcon,
		NcPopover,
		NcModal,
		FullCalendar,
		NcDateTimePickerNative,
		NcButton,
	},
	props: {
		show: {
			type: Boolean,
			required: true,
		},
		startDate: {
			type: Date,
			required: true,
		},
		endDate: {
			type: Date,
			required: true,
		},
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		organizer: {
			type: Object,
			required: true,
		},
		rooms: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			currentDate: this.startDate,
			currentStart: this.startDate,
			currentEnd: this.endDate,
			lang: getFullCalendarLocale().locale,
			freeSlots: [],
		}
	},
	computed: {
		...mapState(useSettingsStore, {
			timezoneId: 'getResolvedTimezone',
		}),
		/**
		 * Map all given rooms to attendee properties.
		 *
		 * @return {import('@nextcloud/calendar-js').AttendeeProperty[]}
		 */
		attendees() {
			return this.rooms.map((room) => mapPrincipalObjectToAttendeeObject(room))
		},
		resources() {
			const resources = []
			for (const attendee of this.attendees) {
				const title = attendee.commonName || attendee.uri.slice(7)
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
		scrollTime() {
			const options = { hour: '2-digit', minute: '2-digit', seconds: '2-digit', hour12: false }

			return this.currentDate.getHours() > 0 ? new Date(this.currentDate.getTime() - 60 * 60 * 1000).toLocaleTimeString(this.lang, options) : '10:00:00'
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
						headerContent: 'Room',
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
		/**
		 * @return {string}
		 */
		datePickerInputId() {
			return randomId()
		},
	},
	methods: {
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
				endSearchDate.setDate(startSearch.getDate() + 7)
				const eventResults = await getBusySlots(
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty),
					startSearch,
					endSearchDate,
					this.timeZoneId,
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
	},
}
</script>
<style scoped lang="scss">
.icon-close {
	display: block;
	height: 100%;
}
.modal__content {
	padding: 15px;
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
