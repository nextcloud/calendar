<template>
	<multiselect
		label="displayName"
		track-by="displayName"
		:disabled="isDisabled"
		:options="avatarEnabledCalendars"
		:value="avatarEnabledCalendar"
		@select="change">
		<template slot="singleLabel" slot-scope="props">
			<div class="row">
				<div class="color-indicator" :style="{ backgroundColor: props.option.color }" />
				<span>{{ props.option.displayName }}</span>
				<Avatar v-if="props.option.isSharedWithMe" :disable-menu="true" :disable-tooltip="true"
					:user="props.option.userId" :display-name="props.option.userDisplayName" :size="18" />
			</div>
		</template>
		<template slot="option" slot-scope="props">
			<div class="row">
				<div class="color-indicator" :style="{ backgroundColor: props.option.color }" />
				<span>{{ props.option.displayName }}</span>
				<Avatar v-if="props.option.isSharedWithMe" :disable-menu="true" :disable-tooltip="true"
					:user="props.option.userId" :display-name="props.option.userDisplayName" :size="18" />
			</div>
		</template>
	</multiselect>
</template>
<script>
import {
	Avatar,
	Multiselect
} from '@nextcloud/vue'

export default {
	name: 'CalendarPicker',
	components: {
		Avatar,
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
			default: false
		},
	},
	computed: {
		avatarEnabledCalendar() {
			const principal = this.$store.getters.getPrincipalByUrl(this.calendar.owner)

			if (!principal) {
				return this.calendar
			}

			return Object.assign({}, this.calendar, {
				userId: principal.userId,
				userDisplayName: principal.displayname
			})
		},
		avatarEnabledCalendars() {
			return this.calendars.map((calendar) => {
				const principal = this.$store.getters.getPrincipalByUrl(calendar.owner)

				if (!principal) {
					return calendar
				}

				return Object.assign({}, calendar, {
					userId: principal.userId,
					userDisplayName: principal.displayname
				})
			})
		},
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
	width: 100%;
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

.row .avatardiv {
	margin-left: auto;
}
</style>
