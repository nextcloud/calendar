<template>
	<li v-click-outside="closeNewCalendarForm" :class="{editing: showForm}" class="new-entity-container">
		<a id="new-calendar-button" href="#" class="icon-add"
			@click="openDialog">{{ label }}</a>

		<div class="app-navigation-entry-edit">
			<form @submit.prevent="addCalendar()">
				<input id="new-calendar-form-input" v-model="displayName" :placeholder="inputPlaceholder"
					:disabled="isCreating" class="app-navigation-input" type="text"
					required>
				<span :class="{'hidden': !isCreating}" class="icon-loading-small" />
				<input :disabled="isCreating" class="icon-close" type="button"
					value="" @click="dismiss">
				<input :disabled="isCreating" class="icon-checkmark accept-button new-accept-button" type="submit"
					value="">
			</form>
		</div>
	</li>
</template>

<script>
import ClickOutside from 'vue-click-outside'
import { randomColor } from '../../services/colorService'

console.debug(randomColor)

export default {
	name: 'CalendarListNew',
	directives: {
		ClickOutside
	},
	props: {
		disabled: {
			type: Boolean,
			default: false
		}
	},
	data: function() {
		return {
			displayName: '',
			isCreating: false,
			showForm: false
		}
	},
	computed: {
		label() {
			return t('calendar', 'New Calendar')
		},
		inputPlaceholder() {
			return t('calendar', 'Name of calendar')
		}
	},
	methods: {
		openDialog() {
			if (this.disabled) {
				return false
			}

			this.showForm = true
			document.getElementById('new-calendar-form-input').focus()
		},
		addCalendar() {
			this.isCreating = true
			this.$store.dispatch('appendCalendar', { calendar: { displayName: this.displayName, color: randomColor() } })
				.then(() => {
					this.displayName = ''
					this.showForm = false
					this.isCreating = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to create the calendar.'))
					this.isCreating = false
				})
		},
		dismiss() {
			this.name = ''
			this.showForm = false
		},
		closeNewCalendarForm() {
			// Close only when input is empty
			if (this.name === '') {
				this.showForm = false
			}
		}
	}
}
</script>
