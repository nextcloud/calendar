<!--
 - @copyright Copyright (c) 2018 John Molakvoæ <skjnldsv@protonmail.com>
 -
 - @author John Molakvoæ <skjnldsv@protonmail.com>
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
 - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 - GNU Affero General Public License for more details.
 -
 - You should have received a copy of the GNU Affero General Public License
 - along with this program. If not, see <http://www.gnu.org/licenses/>.
 -
 -->

<template>
	<div class="app">
		<app-navigation :loading-calendars="loadingCalendars" />
		<router-view />
	</div>
</template>

<script>
import AppNavigation from './components/AppNavigation.vue'
import client from './services/cdav.js'

export default {
	name: 'App',
	components: {
		AppNavigation,
	},
	data() {
		return {
			loadingCalendars: true
		}
	},
	computed: {
		// store getters
		calendars() {
			return this.$store.getters.getCalendars
		},
	},
	beforeMount() {
		// get calendars then get events
		client.connect({ enableCalDAV: true }).then(() => {
			console.debug('Connected to dav!', client)
			this.$store.dispatch('getCalendars')
				.then((calendars) => {
					this.loadingCalendars = false

					// No calendars? Create a new one!
					if (calendars.length === 0) {
						this.$store.dispatch('appendCalendar', { displayName: t('calendars', 'Calendars') })
							.then(() => {
								this.fetchEvents()
							})
					// else, let's get those events!
					} else {
						this.fetchEvents()
					}
				})
				// check local storage for orderKey
			// if (localStorage.getItem('orderKey')) {
			// 	// run setOrder mutation with local storage key
			// 	this.$store.commit('setOrder', localStorage.getItem('orderKey'))
			// }
		})
	},
	methods: {
		menu() {
			return {
				menu: {
					id: 'navigation',
					items: [

					]
				}
			}
		},
		/**
		 * Fetch the events of each calendar
		 */
		fetchEvents() {
			// wait for all calendars to have fetch their events
			// Promise.all(this.calendars.map(calendar => this.$store.dispatch('getEventsFromCalendar', { calendar })))
			// 	.then(results => {
			// 		this.loading = false
			// 		// eslint-disable-next-line
			// 		console.log(results)
			// 	})
			// no need for a catch, the action does not throw
			// and the error is handled there
		},
	}
}
</script>
