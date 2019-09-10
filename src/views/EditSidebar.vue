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
				<property-title :event-component="eventComponent" :prop-model="rfcProps.summary" :is-read-only="isReadOnly" />
				<calendar-picker :calendars="calendars" :calendar="selectedCalendar" is-read-only="isReadOnly"
					:show-calendar-on-select="true" />
				<property-title-time-picker :event-component="eventComponent" :prop-model="{}" :is-read-only="isReadOnly"
					:user-timezone="currentUserTimezone" :start-end-date-hash="startEndDateHash"
				/>
			</div>
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
			<property-text :event-component="eventComponent" :prop-model="rfcProps.location" :is-read-only="isReadOnly" />
			<property-text :event-component="eventComponent" :prop-model="rfcProps.description" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.status" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.class" :is-read-only="isReadOnly" />
			<property-select :event-component="eventComponent" :prop-model="rfcProps.timeTransparency" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Attendees" icon="icon-group" :order="1">
			<invitees-list :event-component="eventComponent" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Reminders" icon="icon-reminder" :order="2">
			<alarm-list :event-component="eventComponent" :is-read-only="isReadOnly" />
		</AppSidebarTab>
		<AppSidebarTab name="Repeat" icon="icon-repeat" :order="3">
			<property-rrule :event-component="eventComponent" :is-read-only="isReadOnly" />
			This is the repeat tab
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
import PropertyRrule from '../components/Editor/Properties/PropertyRrule'
import PropertySelect from '../components/Editor/Properties/PropertySelect'
import PropertyText from '../components/Editor/Properties/PropertyText'
import PropertyTitle from '../components/Editor/Properties/PropertyTitle'
import PropertyTitleTimePicker from '../components/Editor/Properties/PropertyTitleTimePicker'

import rfcProps from '../models/rfcProps'

export default {
	name: 'EditSidebar',
	components: {
		AlarmList,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
		ActionButton,
		CalendarPicker,
		InviteesList,
		PropertyRrule,
		PropertySelect,
		PropertyText,
		PropertyTitle,
		PropertyTitleTimePicker,
	},
	data() {
		return {
			calendarObject: null,
			eventComponent: null,
			isLoading: true,
			error: false,
			selectedCalendar: {},
			requiresActionOnLeave: true
		}
	},
	computed: {
		// Did the event load without errors?
		displayDetails() {
			return !this.isLoading && !this.error
		},
		// Is the event read-only or read-write
		isReadOnly() {
			if (!this.calendarObject) {
				return true
			}

			const calendar = this.$store.getters.getCalendarById(this.calendarObject.calendarId)
			if (!calendar) {
				return true
			}

			return calendar.readOnly
		},
		// List of all selectable calendars
		calendars() {
			if (this.isReadOnly && this.calendarObject) {
				return [
					this.$store.getters.getCalendarById(this.calendarObject.calendarId)
				]
			}

			return this.$store.getters.sortedCalendars
		},
		// Current timezone of the user
		currentUserTimezone() {
			return this.$store.getters.getResolvedTimezone
		},
		// Can you delete this event?
		canDelete() {
			if (!this.calendarObject) {
				return false
			}

			if (this.isReadOnly) {
				return false
			}

			return !!this.calendarObject.dav
		},
		// Can you create recurrence-exceptions for this event?
		canCreateRecurrenceException() {
			if (!this.eventComponent) {
				return false
			}

			return this.eventComponent.canCreateRecurrenceExceptions()
		},
		// List of all RFC props we can display
		rfcProps() {
			return rfcProps
		},
		// Download related properties
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
		// Label for the update / save label
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
		startEndDateHash() {
			if (this.$route.name !== 'NewSidebarView') {
				return undefined
			}

			return [
				this.$route.params.allDay,
				this.$route.params.dtstart,
				this.$route.params.dtend,
			].join('#')
		}
	},
	methods: {
		cancel() {
			if (this.calendarObject) {
				this.calendarObject.resetToDav()
			}

			this.requiresActionOnLeave = false
			this.close()
		},
		async save(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				OCP.Toast.error('No calendar-object found')
				return
			}
			if (!this.eventComponent.isDirty()) {
				OCP.Toast.error('Calendar-data did not change, no need to save')
				return
			}
			if (this.isReadOnly) {
				OCP.Toast.error('Cannot save read-only alarm')
				return
			}

			let original, fork
			if (this.eventComponent.canCreateRecurrenceExceptions() && this.calendarObject.id !== 'new') {
				[original, fork] = this.eventComponent.createRecurrenceException(thisAndAllFuture)
			}

			await this.$store.dispatch('updateCalendarObject', {
				calendarObject: this.calendarObject
			})

			if (this.selectedCalendar.id !== this.calendarObject.calendarId) {
				await this.$store.dispatch('moveCalendarObject', {
					calendarObject: this.calendarObject,
					newCalendarId: this.selectCalendar.id
				})
			}

			if (thisAndAllFuture && original.root !== fork.root) {
				await this.$store.dispatch('createCalendarObjectFromFork', {
					eventComponent: fork,
					// TODO - replace calendarId with this.selectedCalendar.id
					calendarId: this.calendarObject.calendarId
				})
			}
		},
		async saveAndLeave(thisAndAllFuture = false) {
			await this.save(thisAndAllFuture)
			this.requiresActionOnLeave = false
			this.close()
		},
		async delete(thisAndAllFuture = false) {
			if (!this.calendarObject) {
				OCP.Toast.error('No calendar-object found')
				return
			}
			if (this.isReadOnly) {
				OCP.Toast.error('Cannot delete read-only alarm')
				return
			}

			const isRecurrenceSetEmpty = this.eventComponent.removeThisOccurrence(thisAndAllFuture)
			if (isRecurrenceSetEmpty) {
				return this.$store.dispatch('deleteCalendarObject', {
					calendarObject: this.calendarObject
				})
			} else {
				return this.$store.dispatch('updateCalendarObject', {
					calendarObject: this.calendarObject
				})
			}
		},
		async deleteAndLeave(thisAndAllFuture = false) {
			await this.delete(thisAndAllFuture)
			this.requiresActionOnLeave = false
			this.close()
		},
		selectCalendar(selectedCalendar) {
			this.selectedCalendar = selectedCalendar
		},
		close() {
			const name = 'CalendarView'
			const params = {
				view: this.$route.params.view,
				firstday: this.$route.params.firstday
			}
			this.$router.push({ name, params })
		}
	},
	beforeRouteEnter(to, from, next) {
		if (to.name === 'NewSidebarView') {
			next(vm => {
				vm.isLoading = true

				const isAllDay = (to.params.allDay === '1')
				const start = to.params.dtstart
				const end = to.params.dtend
				const timezoneId = vm.$store.getters.getResolvedTimezone
				const recurrenceIdDate = new Date(start * 1000)

				vm.$store.dispatch('createNewEvent', { start, end, isAllDay, timezoneId })
					.then((calendarObject) => {
						vm.calendarObject = calendarObject
						vm.selectedCalendar = vm.$store.getters.getCalendarById(vm.calendarObject.calendarId)
						vm.eventComponent = calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)

						vm.isLoading = true
					})
			})
		} else {
			next(vm => {
				vm.isLoading = true

				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId
				const recurrenceIdDate = new Date(recurrenceId * 1000)

				vm.$store.dispatch('getEventByObjectId', { objectId })
					.then(() => {
						vm.calendarObject = vm.$store.getters.getCalendarObjectById(objectId)
						vm.selectedCalendar = vm.$store.getters.getCalendarById(vm.calendarObject.calendarId)
						vm.eventComponent = vm.calendarObject.getObjectAtRecurrenceId(recurrenceIdDate)

						vm.isLoading = false
					})
			})
		}
	},
	beforeRouteUpdate(to, from, next) {
		// If we are in the New Event dialog, we want to update the selected time
		if (to.name === 'NewSidebarView') {
			const isAllDay = (to.params.allDay === '1')
			const start = to.params.dtstart
			const end = to.params.dtend
			const timezoneId = this.$store.getters.getResolvedTimezone

			this.$store.dispatch('updateTimeOfNewEvent', {
				calendarObject: this.calendarObject,
				start,
				end,
				isAllDay,
				timezoneId
			})

			next()
		} else {
			if (to.params.object === from.params.object
				&& to.params.recurrenceId === from.params.recurrenceId) {
				next()
				return
			}

			this.isLoading = true

			this.save().then(() => {
				const objectId = to.params.object
				const recurrenceId = to.params.recurrenceId

				this.$store.dispatch('getEventByObjectId', { objectId })
					.then(() => {
						this.calendarObject = this.$store.getters.getCalendarObjectById(objectId)
						this.selectedCalendar = this.$store.getters.getCalendarById(this.calendarObject.calendarId)
						this.eventComponent = this.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))

						this.isLoading = false
					})
				next()
			}).catch(() => {
				next(false)
			})
		}
	},
	beforeRouteLeave(to, from, next) {
		if (!this.requiresActionOnLeave) {
			next()
			return
		}

		this.save().then(() => {
			next()
		}).catch(() => {
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
