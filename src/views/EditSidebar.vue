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
	<AppSidebar title="" :compact="false" @close="cancel">
		<template v-slot:primary-actions style="max-height: none !important">
			<div style="width: 100%">
				<property-title :event-component="eventComponent" :prop-model="rfcProps.summary" :is-read-only="false" />
				<calendar-picker :calendars="calendars" :calendar="selectedCalendar" />
				<!--				<property-timepicker-title :event-component="eventComponent" :is-read-only="false" />-->
				<!--				<title-timepicker :event-component="eventComponent" />-->
				<!--				<timezonepicker :event-component="eventComponent" />-->
			</div>
		</template>

		<template v-slot:secondary-actions>
			<ActionLink v-if="hasDownloadURL" icon="icon-download" title="Download"
				:href="downloadURL"
			/>
			<ActionButton v-if="canDelete && !canCreateRecurrenceException" icon="icon-delete" @click="alert('Delete')">
				Delete
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="alert('Delete')">
				Delete this occurrence
			</ActionButton>
			<ActionButton v-if="canDelete && canCreateRecurrenceException" icon="icon-delete" @click="alert('Delete')">
				Delete this and all future
			</ActionButton>
		</template>

		<AppSidebarTab name="Details" icon="icon-details" :order="0">
			<property-text :event-component="eventComponent" :prop-model="rfcProps.location" :is-read-only="false" />
			<property-text :event-component="eventComponent" :prop-model="rfcProps.description" :is-read-only="false" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.status" :is-read-only="false" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.class" :is-read-only="false" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.timeTransparency" :is-read-only="false" />
		</AppSidebarTab>
		<AppSidebarTab name="Attendees" icon="icon-group" :order="1">
			This is the attendees tab
		</AppSidebarTab>
		<AppSidebarTab name="Reminders" :icon="reminderIcon" :order="2">
			This is the reminders tab
		</AppSidebarTab>
		<AppSidebarTab name="Repeat" icon="icon-repeat" :order="3">
			This is the repeat tab
		</AppSidebarTab>
		<!--		<AppSidebarTab name="Activity" icon="icon-history" :order="4">-->
		<!--			This is the activity tab-->
		<!--		</AppSidebarTab>-->
		<!--		<AppSidebarTab name="Projects" icon="icon-projects" :order="5">-->
		<!--			This is the projects tab-->
		<!--		</AppSidebarTab>-->

		<div class="app-sidebar-button-area-bottom">
			<button v-if="!canCreateRecurrenceException" class="primary one-option">
				{{ updateLabel }}
			</button>
			<button v-if="canCreateRecurrenceException" class="primary two-options">
				Update this occurrence
			</button>
			<button v-if="canCreateRecurrenceException" class="two-options">
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
import CalendarPicker from '../components/Editor/CalendarPicker'
// import TitleTimepicker from '../components/Editor/TitleTimepicker'
// import Timezonepicker from '../components/Editor/Timezonepicker'

import detectTimezone from '../services/timezoneDetectionService'
import PropertyText from '../components/Editor/Properties/PropertyText'
import PropertySelect from '../components/Editor/Properties/PropertySelect'

import rfcProps from '../models/rfcProps'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle'

// import { loadNewEventIntoEditor } from '../services/routerHelper'
// import TitleTimepicker from '../components/Editor/TitleTimepicker'
// import DetailsTab from '../components/Editor/DetailsTab'
// import InviteesTab from '../components/Editor/InviteesTab'
// import AlarmTab from '../components/Editor/AlarmTab'
// import RepeatTab from '../components/Editor/RepeatTab'

export default {
	name: 'EditSidebar',
	components: {
		PropertyTitle,
		PropertySelect,
		PropertyText,
		// TitleTimepicker,
		// Timezonepicker,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
		ActionButton,
		CalendarPicker,
		// TitleTimepicker,
		// DetailsTab,
		// InviteesTab,
		// AlarmTab,
		// RepeatTab,
	},
	data() {
		return {
			calendarObject: null,
			eventComponent: null,
			isLoading: true,
			error: false,
		}
	},
	computed: {
		reminderIcon() {
			// Todo: show different icon based on alarm.
			// If no alarm is set: Show reminder icon without dot
			// If one or more alarm are set: Show reminder icon with dot
			return 'icon-reminder'
		},
		hasDownloadURL() {
			if (!this.calendarObject) {
				return false
			}

			return !!this.calendarObject.dav
		},
		downloadURL() {
			if (!this.calendarObject) {
				return null
			}

			if (!this.calendarObject.dav) {
				return null
			}

			return this.calendarObject.dav.url + '?export'
		},
		displayDetails() {
			console.debug('display details?', (!this.isLoading && !this.error))
			return !this.isLoading && !this.error
		},
		rfcProps() {
			return rfcProps
		},
		canDelete() {
			if (!this.calendarObject) {
				return false
			}

			return !!this.calendarObject.dav
		},
		canCreateRecurrenceException() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.canCreateRecurrenceExceptions()
		},
		updateLabel() {
			if (!this.calendarObject) {
				return ''
			}

			if (!this.calendarObject.dav) {
				return t('calendar', 'Save')
			}

			return t('calendar', 'Update')
		},
		updateOnlyThis() {
			return t('calendar', 'Update this occurrence')
		},
		updateThisAllFuture() {
			return t('calendar', 'Update this and all future')
		},
		isReadOnly() {
			return false
		},
		calendars() {
			if (this.isReadOnly) {
				return [
					this.$store.getters.getCalendarById(this.calendarObject.calendarId)
				]
			}

			return this.$store.getters.sortedCalendars
		},
		selectedCalendar() {
			if (!this.calendarObject) {
				return {}
			}

			return this.$store.getters.getCalendarById(this.calendarObject.calendarId)
		}
	},
	methods: {
		cancel() {
			if (this.calendarObject) {
				this.calendarObject.resetToDav()
			}

			const name = 'CalendarView'
			const params = {
				view: this.$route.params.view,
				firstday: this.$route.params.firstday
			}
			this.$router.push({ name, params })
		},
		async save(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				OCP.Toast.error('No calendar-object found')
				return
			}
			// TODO - check if calendar changed
			if (!this.eventComponent.isDirty()) {
				OCP.Toast.error('Calendar-data did not change, no need to save')
				return
			}

			console.debug('Can create a recurrence exception?', this.eventComponent.canCreateRecurrenceExceptions())
			if (this.eventComponent.canCreateRecurrenceExceptions() && this.calendarObject.id !== 'new') {
				console.debug('Creating a recurrence-exception')
				this.eventComponent.createRecurrenceException(thisAndAllFuture)
			}

			return this.$store.dispatch('updateCalendarObject', {
				calendarObject: this.calendarObject
			})
		},
		async delete(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				return
			}

			const emptyCalendarObject = this.eventComponent.removeThisOccurrence(thisAndAllFuture)
			if (emptyCalendarObject) {
				return this.$store.dispatch('deleteCalendarObject', {
					calendarObject: this.calendarObject
				})
			}

			return this.$store.dispatch('updateCalendarObject', {
				calendarObject: this.calendarObject
			})
		},
		selectCalendar(selectedCalendar) {
			this.event = selectedCalendar
		},
	},
	beforeRouteEnter(to, from, next) {
		if (to.name === 'NewSidebarView') {
			next(vm => {
				vm.isLoading = true

				const isAllDay = (to.params.allDay === '1')
				const start = to.params.dtstart
				const end = to.params.dtend
				const timezoneId = vm.$store.state.settings.settings.timezone === 'automatic'
					? detectTimezone()
					: vm.$store.state.settings.settings.timezone

				vm.$store.dispatch('createNewEvent', { start, end, isAllDay, timezoneId })
					.then((calendarObject) => {
						vm.calendarObject = calendarObject
						vm.eventComponent = calendarObject.getObjectAtRecurrenceId(new Date(start * 1000))
						vm.isLoading = true
					})
			})
		} else {
			next(vm => {
				vm.isLoading = true
				OCP.Toast.info('Loading event ...')

				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId

				vm.$store.dispatch('getEventByObjectId', { objectId })
					.then(() => {
						vm.calendarObject = vm.$store.getters.getCalendarObjectById(objectId)
						vm.eventComponent = vm.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))

						vm.isLoading = false
						OCP.Toast.info('Loaded event ...')
					})
			})
		}
	},
	beforeRouteUpdate(to, from, next) {
		if (to.params.object === from.params.object
			&& to.params.recurrenceId === from.params.recurrenceId) {
			OCP.Toast.info('Object did not change, no need to rerender')
			next()
			return
		}

		this.isLoading = true

		this.save().then(() => {
			OCP.Toast.success('Saved event successfully')

			const objectId = to.params.object
			const recurrenceId = to.params.recurrenceId

			this.$store.dispatch('getEventByObjectId', { objectId })
				.then(() => {
					this.calendarObject = this.$store.getters.getCalendarObjectById(objectId)
					this.eventComponent = this.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))
					// this.getEventComponent = () => eventComponent
					this.isLoading = false
					OCP.Toast.info('Loaded event ...')

					this.isLoading = false
				})
			next()
		}).catch(() => {
			OCP.Toast.error('Didn\'t save event')
			next(false)
		})
	},
	beforeRouteLeave(to, from, next) {
		OCP.Toast.success('Left route')
		this.save().then(() => {
			OCP.Toast.success('Saved event successfully')
			next()
		}).catch(() => {
			OCP.Toast.error('Didn\'t save event')
			next(false)
		})
	}
}
</script>

<style>
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
