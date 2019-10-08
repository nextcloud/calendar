<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
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
	<AppSidebar
		:title="title"
		:title-editable="!isReadOnly"
		:title-placeholder="$t('calendar', 'Untitled event')"
		:subtitle="subTitle"
		@close="cancel"
		@update:title="updateTitle">
		<template v-slot:primary-actions style="max-height: none !important">
			<property-title-time-picker
				v-if="!isLoading"
				:start-date="startDate"
				:start-timezone="startTimezone"
				:end-date="endDate"
				:end-timezone="endTimezone"
				:is-all-day="isAllDay"
				:is-read-only="isReadOnly"
				:can-modify-all-day="canModifyAllDay"
				:user-timezone="currentUserTimezone"
				@updateStartDate="updateStartDate"
				@updateStartTimezone="updateStartTimezone"
				@updateEndDate="updateEndDate"
				@updateEndTimezone="updateEndTimezone"
				@toggleAllDay="toggleAllDay" />
		</template>

		<template v-slot:header>
			<IllustrationHeader :color="selectedCalendarColor" :illustration-url="backgroundImage" />
		</template>

		<template v-slot:secondary-actions>
			<ActionLink v-if="hasDownloadURL" icon="icon-download" :title="$t('calendar', 'Download')"
				:href="downloadURL"
			/>
			<ActionButton v-if="canDelete && !canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(false)">
				{{ $t('calendar', 'Delete') }}
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(false)">
				{{ $t('calendar', 'Delete this occurrence') }}
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(true)">
				{{ $t('calendar', 'Delete this and all future') }}
			</ActionButton>
		</template>

		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-details"
			:name="$t('calendar', 'Details')"
			:order="0">
			<div class="app-sidebar-tab__content">
				<property-calendar-picker
					:calendars="calendars"
					:calendar="selectedCalendar"
					:is-read-only="isReadOnly"
					@selectCalendar="changeCalendar" />

				<property-text
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.location"
					:value="location"
					@update:value="updateLocation" />
				<property-text
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.description"
					:value="description"
					@update:value="updateDescription" />

				<property-select
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.status"
					:value="status"
					@update:value="updateStatus" />
				<property-select
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.class"
					:value="accessClass"
					@update:value="updateAccessClass" />
				<property-select
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.timeTransparency"
					:value="timeTransparency"
					@update:value="updateTimeTransparency" />
			</div>
			<div v-if="!isReadOnly" class="app-sidebar-tab__buttons">
				<button v-if="!canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ updateLabel }}
				</button>
				<button v-if="canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ $t('calendar', 'Update this occurrence') }}
				</button>
				<button v-if="canCreateRecurrenceException" @click="saveAndLeave(true)">
					{{ $t('calendar', 'Update this and all future') }}
				</button>
			</div>
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-group"
			:name="$t('calendar', 'Attendees')"
			:order="1">
			<div class="app-sidebar-tab__content">
				<invitees-list
					v-if="!isLoading"
					:calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />
			</div>
			<div v-if="!isReadOnly" class="app-sidebar-tab__buttons">
				<button v-if="!canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ updateLabel }}
				</button>
				<button v-if="canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ $t('calendar', 'Update this occurrence') }}
				</button>
				<button v-if="canCreateRecurrenceException" @click="saveAndLeave(true)">
					{{ $t('calendar', 'Update this and all future') }}
				</button>
			</div>
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-reminder"
			:name="$t('calendar', 'Reminders')"
			:order="2">
			<div class="app-sidebar-tab__content">
				<alarm-list :event-component="eventComponent" :is-read-only="isReadOnly" />
			</div>
			<div v-if="!isReadOnly" class="app-sidebar-tab__buttons">
				<button v-if="!canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ updateLabel }}
				</button>
				<button v-if="canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ $t('calendar', 'Update this occurrence') }}
				</button>
				<button v-if="canCreateRecurrenceException" @click="saveAndLeave(true)">
					{{ $t('calendar', 'Update this and all future') }}
				</button>
			</div>
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-repeat"
			:name="$t('calendar', 'Repeat')"
			:order="3">
			<div class="app-sidebar-tab__content">
				<!-- TODO: If not editing the master item, force updating this and all future   -->
				<!-- TODO: You can't edit recurrence-rule of no-range recurrence-exception -->
				<repeat :event-component="eventComponent" :is-read-only="isReadOnly" :is-editing-master-item="false" />
			</div>
			<div v-if="!isReadOnly" class="app-sidebar-tab__buttons">
				<button v-if="!canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ updateLabel }}
				</button>
				<button v-if="canCreateRecurrenceException" class="primary" @click="saveAndLeave(false)">
					{{ $t('calendar', 'Update this occurrence') }}
				</button>
				<button v-if="canCreateRecurrenceException" @click="saveAndLeave(true)">
					{{ $t('calendar', 'Update this and all future') }}
				</button>
			</div>
		</AppSidebarTab>
		<!--<AppSidebarTab :name="$t('calendar', 'Activity')" icon="icon-history" :order="4">-->
		<!--	This is the activity tab-->
		<!--</AppSidebarTab>-->
		<!--<AppSidebarTab :name="$t('calendar', 'Projects')" icon="icon-projects" :order="5">-->
		<!--	This is the projects tab-->
		<!--</AppSidebarTab>-->

		<!--		<div v-if="!isReadOnly" class="app-sidebar-button-area-bottom">-->
		<!--			<button v-if="!canCreateRecurrenceException" class="primary one-option" @click="saveAndLeave(false)">-->
		<!--				{{ updateLabel }}-->
		<!--			</button>-->
		<!--			<button v-if="canCreateRecurrenceException" class="primary two-options" @click="saveAndLeave(false)">-->
		<!--				{{ $t('calendar', 'Update this occurrence') }}-->
		<!--			</button>-->
		<!--			<button v-if="canCreateRecurrenceException" class="two-options" @click="saveAndLeave(true)">-->
		<!--				{{ $t('calendar', 'Update this and all future') }}-->
		<!--			</button>-->
		<!--		</div>-->
	</AppSidebar>
</template>
<script>
import {
	AppSidebar,
	AppSidebarTab,
	ActionLink,
	ActionButton
} from 'nextcloud-vue'

import AlarmList from '../components/Editor/Alarm/AlarmList'

import InviteesList from '../components/Editor/Invitees/InviteesList'
import PropertyCalendarPicker from '../components/Editor/Properties/PropertyCalendarPicker'
import PropertySelect from '../components/Editor/Properties/PropertySelect'
import PropertyText from '../components/Editor/Properties/PropertyText'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker'
import Repeat from '../components/Editor/Repeat/Repeat.vue'

import EditorMixin from '../mixins/EditorMixin'
import { getIllustrationForTitle } from '../services/illustrationProviderService.js'
import IllustrationHeader from '../components/Editor/IllustrationHeader.vue'
import { getDefaultColor } from '../services/colorService.js'
import moment from 'nextcloud-moment'

export default {
	name: 'EditSidebar',
	components: {
		IllustrationHeader,
		AlarmList,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
		ActionButton,
		InviteesList,
		PropertyCalendarPicker,
		PropertySelect,
		PropertyText,
		PropertyTitleTimePicker,
		Repeat,
	},
	mixins: [
		EditorMixin
	],
	computed: {
		startEndDateHash() {
			if (this.$route.name !== 'NewSidebarView') {
				return undefined
			}

			return [
				this.$route.params.allDay,
				this.$route.params.dtstart,
				this.$route.params.dtend,
			].join('#')
		},
		backgroundImage() {
			return getIllustrationForTitle('foo')
		},
		selectedCalendarColor() {
			if (!this.selectedCalendar) {
				return getDefaultColor()
			}

			return this.selectedCalendar.color || getDefaultColor()
		},
		title() {
			if (!this.eventComponent) {
				return ''
			}

			return this.calendarObjectInstance.title || ''
		},
		subTitle() {
			if (!this.calendarObjectInstance) {
				return ''
			}

			// This is hardcoded for now till https://github.com/ChristophWurst/nextcloud-moment/issues/31 is fixed
			moment.locale('en')
			return moment(this.calendarObjectInstance.startDate).fromNow()
		},
		accessClass() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.accessClass
		},
		status() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.status
		},
		timeTransparency() {
			if (!this.calendarObjectInstance) {
				return null
			}

			return this.calendarObjectInstance.timeTransparency
		}
	},
	methods: {
		/**
		 * Updates the access-class of this event
		 *
		 * @param {String} accessClass The new access class
		 */
		updateAccessClass(accessClass) {
			this.$store.commit('changeAccessClass', {
				calendarObjectInstance: this.calendarObjectInstance,
				accessClass
			})
		},
		/**
		 * Updates the status of the event
		 *
		 * @param {String} status The new status
		 */
		updateStatus(status) {
			this.$store.commit('changeStatus', {
				calendarObjectInstance: this.calendarObjectInstance,
				status
			})
		},
		/**
		 * Updates the time-transparency of the event
		 *
		 * @param {String} timeTransparency The new time-transparency
		 */
		updateTimeTransparency(timeTransparency) {
			this.$store.commit('changeTimeTransparency', {
				calendarObjectInstance: this.calendarObjectInstance,
				timeTransparency
			})
		},
	}
}
</script>

<style>
.app-sidebar-header__figure {
	height: unset !important;
}

.app-sidebar-header__action {
	margin-top: 0 !important;
}

button.one-option {
	width: 100%
}

button.two-options {
	width: 50%
}

.multiselect {
	width: 100%;
}
</style>
