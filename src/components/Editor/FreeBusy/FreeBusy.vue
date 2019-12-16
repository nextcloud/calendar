<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<Modal
		size="large"
		:title="$t('calendar', 'Availability of attendees, resources and rooms')"
		@close="$emit('close')">
		<div class="modal__content modal--scheduler">
			<div v-if="loadingIndicator" class="loading-indicator">
				<div class="icon-loading" />
			</div>
			<FullCalendar
				ref="freeBusyFullCalendar"
				default-view="resourceTimelineDay"
				:editable="false"
				:selectable="false"
				height="auto"
				:plugins="plugins"
				:event-sources="eventSources"
				:time-zone="timezoneId"
				:default-date="startDate"
				:locales="locales"
				:resources="resources"
				:locale="fullCalendarLocale"
				:first-day="firstDay"
				scroll-time="06:00:00"
				:force-event-duration="false"
				:progressive-event-rendering="true"
				:resource-label-text="$t('calendar', 'Attendees, Resources and Rooms')"
				scheduler-license-key="GPL-My-Project-Is-Open-Source"
				@loading="loading" />
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
		</div>
	</Modal>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import {
	mapGetters,
	mapState,
} from 'vuex'
import { getLocale } from '@nextcloud/l10n'
import { Modal } from '@nextcloud/vue/dist/Components/Modal'
import VTimezoneNamedTimezone from '../../../fullcalendar/vtimezoneNamedTimezoneImpl.js'
import freeBusyEventSource from '../../../fullcalendar/freeBusyEventSource.js'
import { getColorForFBType } from '../../../utils/freebusy.js'
import freeBusyFakeBlockingEventSource from '../../../fullcalendar/freeBusyFakeBlockingEventSource.js'

export default {
	name: 'FreeBusy',
	components: {
		FullCalendar,
		Modal,
	},
	props: {
		organizer: {
			type: Object,
			required: true,
		},
		attendees: {
			type: Array,
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
	},
	data() {
		return {
			fullCalendarLocale: 'en',
			locales: [],
			firstDay: 0,
			loadingIndicator: true,
		}
	},
	computed: {
		...mapGetters({
			timezoneId: 'getResolvedTimezone',
		}),
		...mapState({
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			timezone: state => state.settings.timezone,
		}),
		plugins() {
			return [
				resourceTimelinePlugin,
				VTimezoneNamedTimezone,
			]
		},
		eventSources() {
			return [
				freeBusyEventSource(
					this._uid,
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty)
				),
				freeBusyFakeBlockingEventSource(
					this._uid,
					this.resources,
					this.startDate,
					this.endDate
				),
			]
		},
		resources() {
			const resources = []

			// for (const attendee of [this.organizer, ...this.attendees]) {
			for (const attendee of this.attendees) {
				resources.push({
					id: attendee.attendeeProperty.email,
					title: attendee.commonName || attendee.uri.substr(7),
				})
			}

			return resources
		},
		colorCaption() {
			return [{
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
	},
	async mounted() {
		this.loadFullCalendarLocale()
	},
	methods: {
		/**
		 * Loads the locale data for full-calendar
		 *
		 * @returns {Promise<void>}
		 */
		async loadFullCalendarLocale() {
			let locale = getLocale().replace('_', '-').toLowerCase()
			try {
				// try to load the default locale first
				const fcLocale = await import('@fullcalendar/core/locales/' + locale)
				this.locales.push(fcLocale)
				// We have to update firstDay manually till https://github.com/fullcalendar/fullcalendar-vue/issues/36 is fixed
				this.firstDay = fcLocale.week.dow
				this.fullCalendarLocale = locale
			} catch (e) {
				try {
					locale = locale.split('-')[0]
					const fcLocale = await import('@fullcalendar/core/locales/' + locale)
					this.locales.push(fcLocale)
					// We have to update firstDay manually till https://github.com/fullcalendar/fullcalendar-vue/issues/36 is fixed
					this.firstDay = fcLocale.week.dow
					this.fullCalendarLocale = locale
				} catch (e) {
					console.debug('falling back to english locale')
				}
			}
		},
		loading(isLoading) {
			this.loadingIndicator = isLoading
		},
	},
}
</script>

<style lang='scss' scoped>
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/timeline/main.css';
@import '~@fullcalendar/resource-timeline/main.css';

.modal__content {
	padding: 50px;
}
</style>
