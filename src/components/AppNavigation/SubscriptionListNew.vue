<template>
	<li v-click-outside="closeNewCalendarForm" :class="{editing: showForm}" class="new-entity-container">
		<a id="new-subscription-button" href="#" class="icon-add"
			@click="openDialog">{{ label }}</a>

		<div class="app-navigation-entry-edit">
			<form @submit.prevent="addCalendar()">
				<input id="new-subscription-form-input" v-model="link" :placeholder="inputPlaceholder"
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

export default {
	name: 'SubscriptionListNew',
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
			link: '',
			isCreating: false,
			showForm: false
		}
	},
	computed: {
		label() {
			return t('calendar', 'New Subscription')
		},
		inputPlaceholder() {
			return t('calendar', 'Link to ical')
		}
	},
	methods: {
		openDialog() {
			if (this.disabled) {
				return false
			}

			this.showForm = true
			document.getElementById('new-subscription-form-input').focus()
		},
		addCalendar() {
			this.isCreating = true
			this.$store.dispatch('appendSubscription', { calendar: { displayName: '', color: randomColor() }, source: this.link })
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
			this.link = ''
			this.showForm = false
		},
		closeNewCalendarForm() {
			// Close only when input is empty
			if (this.link === '') {
				this.showForm = false
			}
		}
	}
}
</script>

<style scoped>

</style>
