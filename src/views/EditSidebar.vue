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
	<AppSidebar title="Foo bar" subtitle="in 5 days" @close="cancel">
		<template v-slot:primary-actions style="max-height: none !important">
			<div style="width: 100%">
				<property-title-time-picker :event-component="eventComponent" :prop-model="{}" :is-read-only="isReadOnly"
					:user-timezone="currentUserTimezone" :start-end-date-hash="startEndDateHash"
				/>
			</div>
		</template>

		<template v-slot:header>
			<IllustrationHeader :color="selectedCalendarColor" :illustration-url="backgroundImage" />
		</template>

		<template v-slot:secondary-actions>
			<ActionLink v-if="hasDownloadURL" icon="icon-download" title="Download"
				:href="downloadURL"
			/>
			<ActionButton v-if="canDelete && !canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(false)">
				Delete
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(false)">
				Delete this occurrence
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="deleteAndLeave(true)">
				Delete this and all future
			</ActionButton>
		</template>

		<AppSidebarTab name="Details" icon="icon-details" :order="0">
			<calendar-picker :calendars="calendars" :calendar="selectedCalendar" is-read-only="isReadOnly"
				:show-calendar-on-select="true" @selectCalendar="changeCalendar" />
			<property-text :event-component="eventComponent" :prop-model="rfcProps.location" :is-read-only="isReadOnly" />
			<property-text :event-component="eventComponent" :prop-model="rfcProps.description" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.status" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.class" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.timeTransparency" :is-read-only="isReadOnly" />
			<property-title :event-component="eventComponent" :prop-model="rfcProps.summary" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Attendees" icon="icon-group" :order="1">
			<invitees-list :event-component="eventComponent" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Reminders" icon="icon-reminder" :order="2">
			<alarm-list :event-component="eventComponent" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Repeat" icon="icon-repeat" :order="3">
			<!-- TODO: If not editing the master item, force updating this and all future   -->
			<!-- TODO: You can't edit recurrence-rule of no-range recurrence-exception -->
			<repeat :event-component="eventComponent" :is-read-only="isReadOnly" :is-editing-master-item="false" />
		</AppSidebarTab>
		<!--		<AppSidebarTab name="Activity" icon="icon-history" :order="4">-->
		<!--			This is the activity tab-->
		<!--		</AppSidebarTab>-->
		<!--		<AppSidebarTab name="Projects" icon="icon-projects" :order="5">-->
		<!--			This is the projects tab-->
		<!--		</AppSidebarTab>-->

		<div v-if="!isReadOnly" class="app-sidebar-button-area-bottom">
			<button v-if="!canCreateRecurrenceException" class="primary one-option" @click="saveAndLeave(false)">
				{{ updateLabel }}
			</button>
			<button v-if="canCreateRecurrenceException" class="primary two-options" @click="saveAndLeave(false)">
				Update this occurrence
			</button>
			<button v-if="canCreateRecurrenceException" class="two-options" @click="saveAndLeave(true)">
				Update this and all future
			</button>
		</div>
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
import CalendarPicker from '../components/Shared/CalendarPicker'
import InviteesList from '../components/Editor/Invitees/InviteesList'
import PropertySelect from '../components/Editor/Properties/PropertySelect'
import PropertyText from '../components/Editor/Properties/PropertyText'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker'
import Repeat from '../components/Editor/Repeat/Repeat.vue'

import EditorMixin from '../mixins/EditorMixin'
import { getIllustrationForTitle } from '../services/illustrationProviderService.js'
import IllustrationHeader from '../components/Editor/IllustrationHeader.vue'
import defaultColor from '../services/defaultColor.js'

export default {
	name: 'EditSidebar',
	components: {
		IllustrationHeader,
		AlarmList,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
		ActionButton,
		CalendarPicker,
		InviteesList,
		PropertySelect,
		PropertyText,
		PropertyTitle,
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
				return defaultColor()
			}

			return this.selectedCalendar.color || defaultColor()
		}
	}
}
</script>

<style>
.app-sidebar-header__figure {
	height: unset !important;
}

.app-sidebar-button-area-bottom {
	position: absolute;
	margin-top: -60px;
	display: flex !important;
	width: 100%;
	padding: 10px;
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
