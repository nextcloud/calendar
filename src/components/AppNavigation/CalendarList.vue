<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<transition-group id="calendars-list" name="list" tag="ul">
		<calendar-list-new :key="newCalendarKey" :disabled="loadingCalendars" />
		<calendar-list-item-loading-placeholder v-if="loadingCalendars" :key="loadingKeyCalendars" />
		<calendar-list-item
			v-for="calendar in calendars"
			:key="calendar.id"
			:calendar="calendar" />

		<AppNavigationSpacer
			:key="spacerKey" />

		<subscription-list-new :key="newSubscriptionKey" :disabled="loadingCalendars" />
		<calendar-list-item-loading-placeholder v-if="loadingCalendars" :key="loadingKeySubscriptions" />
		<calendar-list-item
			v-for="calendar in subscriptions"
			:key="calendar.id"
			:calendar="calendar" />
	</transition-group>
</template>

<script>
import {
	AppNavigationSpacer
} from '@nextcloud/vue'
import {
	mapGetters
} from 'vuex'
import CalendarListItem from './CalendarList/CalendarListItem.vue'
import CalendarListItemLoadingPlaceholder from './CalendarList/CalendarListItemLoadingPlaceholder.vue'
import CalendarListNew from './CalendarList/CalendarListNew.vue'
import SubscriptionListNew from './CalendarList/SubscriptionListNew.vue'

export default {
	name: 'CalendarList',
	components: {
		AppNavigationSpacer,
		CalendarListItem,
		CalendarListItemLoadingPlaceholder,
		CalendarListNew,
		SubscriptionListNew
	},
	props: {
		loadingCalendars: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		...mapGetters({
			calendars: 'sortedCalendars',
			subscriptions: 'sortedSubscriptions'
		}),
		newCalendarKey() {
			return this._uid + '-new-calendar'
		},
		loadingKeyCalendars() {
			return this._uid + '-loading-placeholder-calendars'
		},
		loadingKeySubscriptions() {
			return this._uid + '-loading-placeholder-subscriptions'
		},
		newSubscriptionKey() {
			return this._uid + '-new-subscription'
		},
		spacerKey() {
			return this._uid + '-spacer'
		}
	}
}
</script>
