<template>
	<div id="app-navigation">
		<view-buttons />
		<today-button />
	</div>
</template>

<script>
import ViewButtons from './AppNavigation/ViewButtons.vue'
import TodayButton from './AppNavigation/TodayButton.vue'

export default {
	name: 'AppNavigation',
	components: {
		ViewButtons,
		TodayButton
	}
}
</script>
