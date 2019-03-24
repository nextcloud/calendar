<template>
	<div class="editor">
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

		<button @click="showMore" />
	</div>
</template>
<script>
export default {
	name: 'EditSimple',
	methods: {
		showMore() {
			this.$router.push({ name: 'NewSidebarView' })
		}
	}
}
</script>
