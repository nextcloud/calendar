<template>
	<transition-group id="calendars-list" name="list" tag="ul">
		<calendar-list-new :key="'calendar-list-new'" :disabled="loadingCalendars" />
		<li v-if="loadingCalendars" key="'calendar-list-loading'" class="app-navigation-list-item icon icon-loading" />
		<calendar-list-item v-for="calendar in calendars" :key="calendar.id" :calendar="calendar" />
		<li key="'calendar-list-separator" class="app-navigation-list-item separator" />
		<subscription-list-new :key="'subscription-list-new'" />
		<li v-if="loadingCalendars" key="'subscription-list-loading'" class="app-navigation-list-item icon icon-loading" />
		<calendar-list-item v-for="subscription in subscriptions" :key="subscription.id" :calendar="subscription" />
	</transition-group>
</template>

<script>
import CalendarListNew from './CalendarListNew.vue'
import SubscriptionListNew from './SubscriptionListNew.vue'
import CalendarListItem from './CalendarListItem.vue'

export default {
	name: 'CalendarList',
	components: {
		CalendarListNew,
		SubscriptionListNew,
		CalendarListItem,
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false
		}
	},
	data: function() {
		return {
			loading: false
		}
	},
	computed: {
		calendars() {
			return this.$store.getters.sortedCalendars
		},
		subscriptions() {
			return this.$store.getters.sortedSubscriptions
		}
	},
	methods: {

	}
}
</script>

<style scoped>

</style>
