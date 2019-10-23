<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
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
	<button class="button primary new-event" @click="newEvent">
		{{ $t('calendar', '+ New event') }}
	</button>
</template>

<script>
import { dateFactory } from '../../../utils/date'

export default {
	name: 'AppNavigationHeaderNewEvent',
	methods: {
		newEvent() {
			let name = this.$store.state.settings.skipPopover
				? 'NewSidebarView'
				: 'NewPopoverView'

			if (window.innerWidth <= 768 && name === 'NewPopoverView') {
				name = 'NewSidebarView'
			}

			const start = dateFactory()
			// Setting a value greater than 23 is actually supported with the expected behavior:
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setHours
			start.setHours(start.getHours() + Math.ceil(start.getMinutes() / 60))
			start.setMinutes(0)
			const end = new Date(start.getTime())
			end.setHours(start.getHours() + 1)

			const params = Object.assign({}, this.$store.state.route.params, {
				allDay: '0',
				dtstart: String(Math.floor(start.getTime() / 1000)),
				dtend: String(Math.floor(end.getTime() / 1000))
			})

			// Don't push new route when day didn't change
			if (name === this.$store.state.route.name
				&& params.allDay === this.$store.state.route.params.allDay
				&& params.dtstart === this.$store.state.route.params.dtstart
				&& params.dtend === this.$store.state.route.params.dtend) {
				return
			}

			this.$router.push({ name, params })
		}
	}
}
</script>
