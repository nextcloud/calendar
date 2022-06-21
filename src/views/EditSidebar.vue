<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<AppSidebar :title="title"
		:title-editable="!isReadOnly && !isLoading"
		:title-placeholder="$t('calendar', 'Event title')"
		:subtitle="subTitle"
		:empty="isLoading || isError"
		:force-menu="true"
		@close="cancel"
		@update:title="updateTitle">
		<template v-if="isLoading">
			<div class="app-sidebar__loading-indicator">
				<div class="icon icon-loading app-sidebar-tab-loading-indicator__icon" />
			</div>
		</template>

		<template v-else-if="isError">
			<EmptyContent>
				{{ $t('calendar', 'Event does not exist') }}
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
				<template #desc>
					{{ error }}
				</template>
			</EmptyContent>
		</template>

		<template #header>
			<IllustrationHeader :color="illustrationColor" :illustration-url="backgroundImage" />
		</template>

		<template v-if="!isLoading && !isError && !isNew"
			#secondary-actions>
			<ActionLink v-if="!hideEventExport && hasDownloadURL"
				:href="downloadURL">
				<template #icon>
					<Download :size="20" decorative />
				</template>
				{{ $t('calendar', 'Export') }}
			</ActionLink>
			<ActionButton v-if="!canCreateRecurrenceException && !isReadOnly" @click="duplicateEvent()">
				<template #icon>
					<ContentDuplicate :size="20" decorative />
				</template>
				{{ $t('calendar', 'Duplicate') }}
			</ActionButton>
			<ActionButton v-if="canDelete && !canCreateRecurrenceException" @click="deleteAndLeave(false)">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ $t('calendar', 'Delete') }}
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(false)">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ $t('calendar', 'Delete this occurrence') }}
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" @click="deleteAndLeave(true)">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ $t('calendar', 'Delete this and all future') }}
			</ActionButton>
		</template>

		<template v-if="!isLoading && !isError"
			#description>
			<PropertyCalendarPicker v-if="showCalendarPicker"
				:calendars="calendars"
				:calendar="selectedCalendar"
				:is-read-only="isReadOnly || !canModifyCalendar"
				@select-calendar="changeCalendar" />

			<PropertyTitleTimePicker :start-date="startDate"
				:start-timezone="startTimezone"
				:end-date="endDate"
				:end-timezone="endTimezone"
				:is-all-day="isAllDay"
				:is-read-only="isReadOnly"
				:can-modify-all-day="canModifyAllDay"
				:user-timezone="currentUserTimezone"
				:append-to-body="true"
				@update-start-date="updateStartDate"
				@update-start-timezone="updateStartTimezone"
				@update-end-date="updateEndDate"
				@update-end-timezone="updateEndTimezone"
				@toggle-all-day="toggleAllDay" />

			<InvitationResponseButtons v-if="isViewedByAttendee && userAsAttendee && !isReadOnly"
				:attendee="userAsAttendee"
				:calendar-id="calendarId"
				:narrow="true"
				@close="closeEditorAndSkipAction" />
		</template>

		<AppSidebarTab v-if="!isLoading && !isError"
			id="app-sidebar-tab-details"
			class="app-sidebar-tab"
			:name="$t('calendar', 'Details')"
			:order="0">
			<template #icon>
				<InformationOutline :size="20" decorative />
			</template>
			<div class="app-sidebar-tab__content">
				<PropertyText :is-read-only="isReadOnly"
					:prop-model="rfcProps.location"
					:value="location"
					@update:value="updateLocation" />
				<PropertyText :is-read-only="isReadOnly"
					:prop-model="rfcProps.description"
					:value="description"
					@update:value="updateDescription" />

				<PropertySelect :is-read-only="isReadOnly"
					:prop-model="rfcProps.status"
					:value="status"
					@update:value="updateStatus" />
				<PropertySelect :is-read-only="isReadOnly"
					:prop-model="rfcProps.accessClass"
					:value="accessClass"
					@update:value="updateAccessClass" />
				<PropertySelect :is-read-only="isReadOnly"
					:prop-model="rfcProps.timeTransparency"
					:value="timeTransparency"
					@update:value="updateTimeTransparency" />

				<PropertySelectMultiple :colored-options="true"
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.categories"
					:value="categories"
					@add-single-value="addCategory"
					@remove-single-value="removeCategory" />

				<PropertyColor :calendar-color="selectedCalendarColor"
					:is-read-only="isReadOnly"
					:prop-model="rfcProps.color"
					:value="color"
					@update:value="updateColor" />

				<AlarmList :calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />

				<!-- TODO: If not editing the master item, force updating this and all future   -->
				<!-- TODO: You can't edit recurrence-rule of no-range recurrence-exception -->
				<Repeat :calendar-object-instance="calendarObjectInstance"
					:recurrence-rule="calendarObjectInstance.recurrenceRule"
					:is-read-only="isReadOnly"
					:is-editing-master-item="isEditingMasterItem"
					:is-recurrence-exception="isRecurrenceException"
					@force-this-and-all-future="forceModifyingFuture" />
			</div>
			<SaveButtons v-if="showSaveButtons"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@save-this-only="saveAndLeave(false)"
				@save-this-and-all-future="saveAndLeave(true)" />
		</AppSidebarTab>
		<AppSidebarTab v-if="!isLoading && !isError"
			id="app-sidebar-tab-attendees"
			class="app-sidebar-tab"
			:name="$t('calendar', 'Attendees')"
			:order="1">
			<template #icon>
				<AccountMultiple :size="20" decorative />
			</template>
			<div class="app-sidebar-tab__content">
				<InviteesList v-if="!isLoading"
					:calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />
			</div>
			<SaveButtons v-if="showSaveButtons"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@save-this-only="saveAndLeave(false)"
				@save-this-and-all-future="saveAndLeave(true)" />
		</AppSidebarTab>
		<AppSidebarTab v-if="!isLoading && !isError"
			id="app-sidebar-tab-resources"
			class="app-sidebar-tab"
			:name="$t('calendar', 'Resources')"
			:order="2">
			<template #icon>
				<MapMarker :size="20" decorative />
			</template>
			<div class="app-sidebar-tab__content">
				<ResourceList v-if="!isLoading"
					:calendar-object-instance="calendarObjectInstance"
					:is-read-only="isReadOnly" />
			</div>
			<SaveButtons v-if="showSaveButtons"
				class="app-sidebar-tab__buttons"
				:can-create-recurrence-exception="canCreateRecurrenceException"
				:is-new="isNew"
				:force-this-and-all-future="forceThisAndAllFuture"
				@save-this-only="saveAndLeave(false)"
				@save-this-and-all-future="saveAndLeave(true)" />
		</AppSidebarTab>
	</AppSidebar>
</template>
<script>
import AppSidebar from '@nextcloud/vue/dist/Components/AppSidebar'
import AppSidebarTab from '@nextcloud/vue/dist/Components/AppSidebarTab'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'

import { mapState } from 'vuex'

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
import SaveButtons from '../components/Editor/SaveButtons.vue'
import PropertySelectMultiple from '../components/Editor/Properties/PropertySelectMultiple.vue'
import PropertyColor from '../components/Editor/Properties/PropertyColor.vue'
import ResourceList from '../components/Editor/Resources/ResourceList'
import InvitationResponseButtons from '../components/Editor/InvitationResponseButtons'

import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import Download from 'vue-material-design-icons/Download.vue'
import ContentDuplicate from 'vue-material-design-icons/ContentDuplicate.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'

export default {
	name: 'EditSidebar',
	components: {
		ResourceList,
		PropertyColor,
		PropertySelectMultiple,
		SaveButtons,
		IllustrationHeader,
		AlarmList,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
		ActionButton,
		EmptyContent,
		InviteesList,
		PropertyCalendarPicker,
		PropertySelect,
		PropertyText,
		PropertyTitleTimePicker,
		Repeat,
		AccountMultiple,
		CalendarBlank,
		Delete,
		Download,
		ContentDuplicate,
		InformationOutline,
		MapMarker,
		InvitationResponseButtons,
	},
	mixins: [
		EditorMixin,
	],
	computed: {
		...mapState({
			locale: (state) => state.settings.momentLocale,
			hideEventExport: (state) => state.settings.hideEventExport,
		}),
		accessClass() {
			return this.calendarObjectInstance?.accessClass || null
		},
		categories() {
			return this.calendarObjectInstance?.categories || null
		},
		status() {
			return this.calendarObjectInstance?.status || null
		},
		timeTransparency() {
			return this.calendarObjectInstance?.timeTransparency || null
		},
		subTitle() {
			if (!this.calendarObjectInstance) {
				return ''
			}

			return moment(this.calendarObjectInstance.startDate).locale(this.locale).fromNow()
		},
		/**
		 * @return {boolean}
		 */
		canModifyCalendar() {
			const eventComponent = this.calendarObjectInstance.eventComponent
			if (!eventComponent) {
				return true
			}

			return !eventComponent.isPartOfRecurrenceSet() || eventComponent.isExactForkOfPrimary
		},
	},
	mounted() {
		window.addEventListener('keydown', this.keyboardCloseEditor)
		window.addEventListener('keydown', this.keyboardSaveEvent)
		window.addEventListener('keydown', this.keyboardDeleteEvent)
		window.addEventListener('keydown', this.keyboardDuplicateEvent)
	},
	beforeDestroy() {
		window.removeEventListener('keydown', this.keyboardCloseEditor)
		window.removeEventListener('keydown', this.keyboardSaveEvent)
		window.removeEventListener('keydown', this.keyboardDeleteEvent)
		window.removeEventListener('keydown', this.keyboardDuplicateEvent)
	},
	methods: {
		/**
		 * Updates the access-class of this event
		 *
		 * @param {string} accessClass The new access class
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
		 * @param {string} status The new status
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
		 * @param {string} timeTransparency The new time-transparency
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
		 * @param {string} category Category to add
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
		 * @param {string} category Category to remove
		 */
		removeCategory(category) {
			this.$store.commit('removeCategory', {
				calendarObjectInstance: this.calendarObjectInstance,
				category,
			})
		},
		/**
		 * Updates the color of the event
		 *
		 * @param {string} customColor The new color
		 */
		updateColor(customColor) {
			this.$store.commit('changeCustomColor', {
				calendarObjectInstance: this.calendarObjectInstance,
				customColor,
			})
		},
	},
}
</script>

<style lang="scss" scoped>
::v-deep .app-sidebar-header__description {
	flex-direction: column;
}
</style>
