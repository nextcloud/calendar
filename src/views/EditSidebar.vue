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
		:title-editable="!isReadOnly && !isLoading"
		:title-placeholder="$t('calendar', 'Event title')"
		:subtitle="subTitle"
		@close="cancel"
		@update:title="updateTitle">
		<template v-slot:primary-actions style="max-height: none !important">
			<PropertyTitleTimePicker
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
			<PropertyTitleTimePickerLoadingPlaceholder
				v-if="isLoading" />
		</template>

		<template v-slot:header>
			<IllustrationHeader :color="selectedCalendarColor" :illustration-url="backgroundImage" />
		</template>

		<template v-slot:secondary-actions>
			<ActionLink v-if="hasDownloadURL"
				icon="icon-download"
				:href="downloadURL">
				{{ $t('calendar', 'Download') }}
			</ActionLink>
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
			<div v-if="isLoading" class="app-sidebar-tab__loading">
				<div class="app-sidebar-tab-loading-indicator">
					<div class="icon icon-loading app-sidebar-tab-loading-indicator__icon" />
				</div>
			</div>
			<div v-if="!isLoading" class="app-sidebar-tab__content">
				<PropertyCalendarPicker
					v-if="showCalendarPicker"
					:calendars="calendars"
					:calendar="selectedCalendar"
					:is-read-only="isReadOnly"
					@selectCalendar="changeCalendar" />

				<PropertyText
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.location"
					:value="location"
					@update:value="updateLocation" />
				<PropertyText
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.description"
					:value="description"
					@update:value="updateDescription" />

				<PropertySelect
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.status"
					:value="status"
					@update:value="updateStatus" />
				<PropertySelect
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.accessClass"
					:value="accessClass"
					@update:value="updateAccessClass" />
				<PropertySelect
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.timeTransparency"
					:value="timeTransparency"
					@update:value="updateTimeTransparency" />

				<PropertySelectMultiple
					:colored-options="true"
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.categories"
					:value="categories"
					@addSingleValue="addCategory"
					@removeSingleValue="removeCategory" />
			</div>
			<SaveButtons
				v-if="!isLoading && !isReadOnly"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@saveThisOnly="saveAndLeave(false)"
				@saveThisAndAllFuture="saveAndLeave(true)" />
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-group"
			:name="$t('calendar', 'Attendees')"
			:order="1">
			<div v-if="isLoading" class="app-sidebar-tab__loading">
				<div class="app-sidebar-tab-loading-indicator">
					<div class="icon icon-loading app-sidebar-tab-loading-indicator__icon" />
				</div>
			</div>
			<div v-if="!isLoading" class="app-sidebar-tab__content">
				<InviteesList
					v-if="!isLoading"
					:calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />
			</div>
			<SaveButtons
				v-if="!isLoading && !isReadOnly"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@saveThisOnly="saveAndLeave(false)"
				@saveThisAndAllFuture="saveAndLeave(true)" />
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-reminder"
			:name="$t('calendar', 'Reminders')"
			:order="2">
			<div v-if="isLoading" class="app-sidebar-tab__loading">
				<div class="app-sidebar-tab-loading-indicator">
					<div class="icon icon-loading app-sidebar-tab-loading-indicator__icon" />
				</div>
			</div>
			<div v-if="!isLoading" class="app-sidebar-tab__content">
				<AlarmList
					:calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />
			</div>
			<SaveButtons
				v-if="!isLoading && !isReadOnly"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@saveThisOnly="saveAndLeave(false)"
				@saveThisAndAllFuture="saveAndLeave(true)" />
		</AppSidebarTab>
		<AppSidebarTab
			class="app-sidebar-tab"
			icon="icon-repeat"
			:name="$t('calendar', 'Repeat')"
			:order="3">
			<div v-if="isLoading" class="app-sidebar-tab__loading">
				<div class="app-sidebar-tab-loading-indicator">
					<div class="icon icon-loading app-sidebar-tab-loading-indicator__icon" />
				</div>
			</div>
			<div v-if="!isLoading" class="app-sidebar-tab__content">
				<!-- TODO: If not editing the master item, force updating this and all future   -->
				<!-- TODO: You can't edit recurrence-rule of no-range recurrence-exception -->
				<Repeat
					:calendar-object-instance="calendarObjectInstance"
					:recurrence-rule="calendarObjectInstance.recurrenceRule"
					:is-read-only="isReadOnly"
					:is-editing-master-item="isEditingMasterItem"
					:is-recurrence-exception="isRecurrenceException"
					@forceThisAndAllFuture="forceModifyingFuture" />
			</div>
			<SaveButtons
				v-if="!isLoading && !isReadOnly"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@saveThisOnly="saveAndLeave(false)"
				@saveThisAndAllFuture="saveAndLeave(true)" />
		</AppSidebarTab>
		<!--<AppSidebarTab :name="$t('calendar', 'Activity')" icon="icon-history" :order="4">-->
		<!--This is the activity tab-->
		<!--</AppSidebarTab>-->
		<!--<AppSidebarTab :name="$t('calendar', 'Projects')" icon="icon-projects" :order="5">-->
		<!--This is the projects tab-->
		<!--</AppSidebarTab>-->
	</AppSidebar>
</template>
<script>
import {
	AppSidebar,
	AppSidebarTab,
	ActionLink,
	ActionButton,
} from '@nextcloud/vue'

import AlarmList from '../components/Editor/Alarm/AlarmList'

import InviteesList from '../components/Editor/Invitees/InviteesList'
import PropertyCalendarPicker from '../components/Editor/Properties/PropertyCalendarPicker'
import PropertySelect from '../components/Editor/Properties/PropertySelect'
import PropertyText from '../components/Editor/Properties/PropertyText'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker'
import Repeat from '../components/Editor/Repeat/Repeat.vue'

import EditorMixin from '../mixins/EditorMixin'
import IllustrationHeader from '../components/Editor/IllustrationHeader.vue'
import moment from '@nextcloud/moment'
import PropertyTitleTimePickerLoadingPlaceholder
	from '../components/Editor/Properties/PropertyTitleTimePickerLoadingPlaceholder.vue'
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PropertySelectMultiple from '../components/Editor/Properties/PropertySelectMultiple.vue'

export default {
	name: 'EditSidebar',
	components: {
		PropertySelectMultiple,
		SaveButtons,
		PropertyTitleTimePickerLoadingPlaceholder,
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
		EditorMixin,
	],
	computed: {
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
		},
		categories() {
			if (!this.calendarObjectInstance) {
				return []
			}

			return this.calendarObjectInstance.categories
		},
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
				accessClass,
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
				status,
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
				timeTransparency,
			})
		},
		/**
		 * Adds a category to the event
		 *
		 * @param {String} category Category to add
		 */
		addCategory(category) {
			this.$store.commit('addCategory', {
				calendarObjectInstance: this.calendarObjectInstance,
				category,
			})
		},
		/**
		 * Removes a category from the event
		 *
		 * @param {String} category Category to remove
		 */
		removeCategory(category) {
			this.$store.commit('removeCategory', {
				calendarObjectInstance: this.calendarObjectInstance,
				category,
			})
		},
	},
}
</script>
