<template>
	<AppSidebar title="TITLE" subtitle="SUBTITLE" :compact="false"
		@close="cancel">
		<template v-slot:primary-actions>
			<calendar-picker />
			<title-timepicker />
		</template>

		<template v-slot:secondary-actions>
			<ActionLink icon="icon-download" title="Download" href="https://nextcloud.com" />
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
		reminderIcon() {
			// Todo: show different icon based on alarm.
			// If no alarm is set: Show reminder icon without dot
			// If one or more alarm are set: Show reminder icon with dot
			return 'icon-reminder'
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

			const objectId = to.params.object
			const recurrenceId = to.params.recurrenceId

			vm.$store.dispatch('getEventByObjectId', { objectId })
				.then(() => {
					vm.calendarObject = vm.$store.getters.getCalendarObjectById(objectId)
					vm.eventComponent = vm.calendarObject.getObjectAtRecurrenceId(new Date(recurrenceId * 1000))
				})
		})
	},
	beforeRouteUpdate(to, from, next) {
		if (to.params.object !== from.params.object) {
			console.debug('OBJECT ID CHANGED - we have to rerender')
		}

		console.debug(JSON.stringify(to.params))
		console.debug(JSON.stringify(from.params))
		// called when the route that renders this component has changed,
		// but this component is reused in the new route.
		// For example, for a route with dynamic params `/foo/:id`, when we
		// navigate between `/foo/1` and `/foo/2`, the same `Foo` component instance
		// will be reused, and this hook will be called when that happens.
		// has access to `this` component instance.

		next()
	},
	beforeRouteLeave(to, from, next) {
		console.debug(JSON.stringify(to.params))
		console.debug(JSON.stringify(from.params))
		// called when the route that renders this component is about to
		// be navigated away from.
		// has access to `this` component instance.

		next()
	}
}
</script>
