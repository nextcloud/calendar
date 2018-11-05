<template>
	<div id="app-navigation">
		<view-buttons />
		<today-button />
		<div v-click-outside="closeMenu" id="app-settings" :class="{open: opened}">
			<div id="app-settings-header">
				<button class="settings-button"
					data-apps-slide-toggle="#app-settings-content"
					@click="toggleMenu">{{ settingsLabel }}</button>
			</div>
			<div id="app-settings-content">
				<settings />
			</div>
		</div>
	</div>
</template>

<script>
import ViewButtons from './AppNavigation/ViewButtons.vue'
import TodayButton from './AppNavigation/TodayButton.vue'
import Settings from './AppNavigation/Settings.vue'

import ClickOutside from 'vue-click-outside'

export default {
	name: 'AppNavigation',
	components: {
		ViewButtons,
		TodayButton,
		Settings
	},
	directives: {
		ClickOutside
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
