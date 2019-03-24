<template>
	<div id="app-sidebar">
		<h2>
			<input
				v-model="event.summary"
				:readonly="false"
				:placeholder="t('contacts', 'Summary')"
				type="text"
				autocomplete="off"
				autocorrect="off" />
		</h2>
		<calendar-picker :selectCalendar="selectCalendar" />
		<title-timepicker />

		<!-- tabs -->
		<details-tab />
		<invitees-tab />
		<alarm-tab />
		<repeat-tab />
		<!-- eventual other apps modules -->
	</div>
</template>
<script>

import CalendarPicker from '../components/Editor/CalendarPicker'
import TitleTimepicker from '../components/Editor/TitleTimepicker'
import DetailsTab from '../components/Editor/DetailsTab'
import InviteesTab from '../components/Editor/InviteesTab'
import AlarmTab from '../components/Editor/AlarmTab'
import RepeatTab from '../components/Editor/RepeatTab'

export default {
	name: 'EditSidebar',
	components: {
		CalendarPicker,
		TitleTimepicker,
		DetailsTab,
		InviteesTab,
		AlarmTab,
		RepeatTab,
	},
	data() {
		return {
			event: {
				summary: '',
				calendar: null,
			}
		}
	},
	methods: {
		selectCalendar(selectedCalendar) {
			this.event = selectedCalendar
		}
	}
}
</script>
