<template>
	<div id="app-sidebar-details">
		<textarea v-model="event.location" />
		<textarea v-model="event.description" />
		<!-- Status -->
		<!-- Class -->
	</div>
</template>

<script>
export default {
	name: 'DetailsTab',
	props: {
		event: {
			type: Object
		}
	}
}
</script>

<style scoped>

</style>
