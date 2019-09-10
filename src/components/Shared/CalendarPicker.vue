<template>
	<multiselect
		label="displayName"
		track-by="displayName"
		:disabled="isDisabled"
		:options="calendars"
		:value="calendar"
		@select="change">
		<template slot="singleLabel" slot-scope="props">
			<div class="row">
				<div class="color-indicator" :style="{ backgroundColor: props.option.color }" />
				<span>{{ props.option.displayName }}</span>
			</div>
		</template>
		<template slot="option" slot-scope="props">
			<div class="row">
				<div class="color-indicator" :style="{ backgroundColor: props.option.color }" />
				<span>{{ props.option.displayName }}</span>
			</div>
		</template>
	</multiselect>
</template>
<script>
import {
	Multiselect
} from 'nextcloud-vue'

export default {
	name: 'CalendarPicker',
	components: {
		Multiselect
	},
	props: {
		calendar: {
			type: Object,
			required: true
		},
		calendars: {
			type: Array,
			required: true,
		},
		showCalendarOnSelect: {
			type: Boolean,
			required: true,
			default: false
		}
	},
	computed: {
		isDisabled() {
			return this.calendars.length < 2
		},
	},
	methods: {
		change(newCalendar) {
			if (!newCalendar) {
				return
			}

			if (!newCalendar.enabled) {
				this.$store.dispatch('toggleCalendarEnabled', {
					calendar: newCalendar
				})
			}

			this.$emit('selectCalendar', newCalendar)
		}
	}
}
</script>

<style scoped>
.row {
	display: flex;
	align-items: center;
}

.color-indicator {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: none;
	margin-right: 8px;
}
</style>
