<template>
	<div>
		{{eventComponent.startDate}}
		{{eventComponent.endDate}} 
		Start Date/Time
		End Date/Time
		All-day checkbox
		Timezone-toggle
		Start Date/Time-zone
		End Date/Time-zone
	</div>
</template>

<script>
export default {
	name: 'TitleTimepicker',
	props: {
		eventComponent: {
			type: Object,
			default: false
		}
	},
}
</script>

<style scoped>

</style>
