<template>
	<div id="app-navigation">
		<header class="app-navigation-header">
			<date-picker />
			<view-buttons />
			<today-button />
		</header>

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
				<settings :loading-calendars="loadingCalendars" />
			</div>
		</div>
	</div>
</template>

<script>
import DatePicker from './Header/DatePicker.vue'
import ViewButtons from './Header/ViewButtons.vue'
import TodayButton from './Header/TodayButton.vue'
import CalendarList from './List/CalendarList.vue'
import Settings from './Settings/Settings.vue'

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
