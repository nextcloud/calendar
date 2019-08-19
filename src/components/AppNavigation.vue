<template>
	<div id="app-navigation">
		<date-picker />
		<view-buttons />
		<today-button />

		<calendar-list :loading-calendars="loadingCalendars" />

		<div id="app-settings" v-click-outside="closeMenu" :class="{open: opened}">
			<div id="app-settings-header">
				<button class="settings-button"
					data-apps-slide-toggle="#app-settings-content"
					@click="toggleMenu"
				>
					{{ settingsLabel }}
				</button>
			</div>
			<div id="app-settings-content">
				<settings />
			</div>
		</div>
	</div>
</template>

<script>
import DatePicker from './AppNavigation/DatePicker.vue'
import ViewButtons from './AppNavigation/ViewButtons.vue'
import TodayButton from './AppNavigation/TodayButton.vue'
import CalendarList from './AppNavigation/CalendarList.vue'
import Settings from './AppNavigation/Settings.vue'

import ClickOutside from 'vue-click-outside'

export default {
	name: 'AppNavigation',
	components: {
		DatePicker,
		ViewButtons,
		TodayButton,
		CalendarList,
		Settings
	},
	directives: {
		ClickOutside
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			opened: false
		}
	},
	computed: {
		settingsLabel() {
			return t('calendar', 'Settings & import')
		}
	},
	methods: {
		toggleMenu() {
			this.opened = !this.opened
		},
		closeMenu() {
			this.opened = false
		}
	}
}
</script>
