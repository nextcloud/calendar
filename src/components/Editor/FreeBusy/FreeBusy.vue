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
				:options="options" />
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
// Import FullCalendar itself
import FullCalendar from '@fullcalendar/vue'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'

// Import event sources
import freeBusyEventSource from '../../../fullcalendar/eventSources/freeBusyEventSource.js'
import freeBusyFakeBlockingEventSource from '../../../fullcalendar/eventSources/freeBusyFakeBlockingEventSource.js'

// Import localization plugins
import { getDateFormattingConfig } from '../../../fullcalendar/localization/dateFormattingConfig.js'
import { getFullCalendarLocale } from '../../../fullcalendar/localization/localeProvider.js'
import MomentPlugin from '../../../fullcalendar/localization/momentPlugin.js'

// Import timezone plugins
import VTimezoneNamedTimezone from '../../../fullcalendar/timezones/vtimezoneNamedTimezoneImpl.js'

import {
	mapGetters,
	mapState,
} from 'vuex'
import Modal from '@nextcloud/vue/dist/Components/Modal'
import { getColorForFBType } from '../../../utils/freebusy.js'
import { getLocale } from '@nextcloud/l10n'
import { getFirstDayOfWeekFromMomentLocale } from '../../../utils/moment.js'

export default {
	name: 'FreeBusy',
	components: {
		FullCalendar,
		Modal,
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
	},
	data() {
		return {
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
		/**
		 * FullCalendar Plugins
		 *
		 * @returns {(PluginDef)[]}
		 */
		plugins() {
			return [
				resourceTimelinePlugin,
				MomentPlugin,
				VTimezoneNamedTimezone,
			]
		},
		eventSources() {
			return [
				freeBusyEventSource(
					this._uid,
					this.organizer.attendeeProperty,
					this.attendees.map((a) => a.attendeeProperty),
					this.resources.map((resource) => resource.id)
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
		/**
		 * List of possible Free-Busy values.
		 * This is used as legend.
		 *
		 * @returns {({color: string, label: string})[]}
		 */
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
		/**
		 * Configuration options for FullCalendar
		 * Please see https://fullcalendar.io/docs#toc for details
		 *
		 * @returns {Object}
		 */
		options() {
			return {
				// Initialization:
				initialView: 'resourceTimelineDay',
				initialDate: this.startDate,
				schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
				// Data
				eventSources: this.eventSources,
				resources: this.resources,
				// Plugins
				plugins: this.plugins,
				// Interaction:
				editable: false,
				selectable: false,
				// Localization:
				...getDateFormattingConfig(),
				locale: getFullCalendarLocale(getLocale(), this.locale),
				firstDay: getFirstDayOfWeekFromMomentLocale(this.locale),
				// Rendering
				height: 'auto',
				loading: this.loading,
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
			}
		},
	},
	methods: {
		loading(isLoading) {
			this.loadingIndicator = isLoading
		},
	},
}
</script>

<style lang='scss' scoped>
.modal__content {
	padding: 50px;
}
</style>
