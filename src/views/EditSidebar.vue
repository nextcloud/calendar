<template>
	<AppSidebar :title="title" :subtitle="subtitle" :compact="false"
		@close="cancel"
	>
		<template v-slot:primary-actions>
			<calendar-picker />
			<title-timepicker />
		</template>

		<template v-slot:secondary-actions>
			<ActionLink v-if="hasDownloadURL" icon="icon-download" title="Download"
				:href="downloadURL"
			/>
		</template>

		<AppSidebarTab name="Details" icon="icon-details" :order="0">
			This is the details tab
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
	</AppSidebar>
</template>
<script>

import {
	AppSidebar,
	AppSidebarTab,
	ActionLink
} from 'nextcloud-vue'
import CalendarPicker from '../components/Editor/CalendarPicker'
import TitleTimepicker from '../components/Editor/TitleTimepicker'
// import { loadNewEventIntoEditor } from '../services/routerHelper'
// import TitleTimepicker from '../components/Editor/TitleTimepicker'
// import DetailsTab from '../components/Editor/DetailsTab'
// import InviteesTab from '../components/Editor/InviteesTab'
// import AlarmTab from '../components/Editor/AlarmTab'
// import RepeatTab from '../components/Editor/RepeatTab'

export default {
	name: 'EditSidebar',
	components: {
		TitleTimepicker,
		AppSidebar,
		AppSidebarTab,
		ActionLink,
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
			isLoading: false,
			error: false
		}
	},
	computed: {
		title() {
			return this.isLoading ? 'LOADING' : 'LOADED'
		},
		subtitle() {
			return this.isLoading ? 'LOADING' : 'LOADED'
		},
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
			return this.calendarObject.dav.url + '?export'
		}
	},
	watch: {
		// '$route': {
		// 	handler(newRoute, oldRoute) {
		// 		if (!loadNewEventIntoEditor(newRoute, oldRoute)) {
		// 			return
		// 		}
		//
		// 		const objectId = this.$store.state.route.params.object
		// 		const recurrenceId = this.$store.state.route.params.recurrenceId
		//
		// 		this.$store.dispatch('getEventByObjectId', { objectId })
		// 			.then(() => {
		// 				this.calendarObject = this.$store.getters.getCalendarObjectById(objectId)
		// 				this.eventComponent = this.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))
		// 			})
		// 	},
		// 	immediate: true,
		// }
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

			if (this.eventComponent.canCreateRecurrenceExceptions()) {
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
		}
	},
	beforeRouteEnter(to, from, next) {
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
