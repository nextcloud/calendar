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
	<AppNavigationItem
		v-if="!showForm"
		icon="icon-add"
		:class="{disabled: disabled}"
		:title="$t('calendar', 'New calendar')"
		@click.prevent.stop="openDialog"
	/>

	<ActionInput
		v-else
		v-click-outside="closeNewCalendarForm"
		:icon="inputIcon"
		:value="name"
		:disabled="isCreating"
		@submit.prevent.stop="addCalendar"
	>
		{{ $t('calendar', 'Name of calendar') }}
	</ActionInput>
</template>

<script>
import {
	AppNavigationItem,
	ActionInput
} from '@nextcloud/vue'
import ClickOutside from 'vue-click-outside'
import { getRandomColor } from '../../../utils/color.js'

export default {
	name: 'CalendarListNew',
	components: {
		AppNavigationItem,
		ActionInput
	},
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
			isCreating: false,
			showForm: false,
			name: '',
		}
	},
	computed: {
		inputIcon() {
			if (this.isCreating) {
				return 'icon-loading-small'
			}

			return 'icon-add'
		}
	},
	methods: {
		openDialog() {
			if (this.disabled) {
				return false
			}

			this.showForm = true
			this.$nextTick(() => {
				this.$el.querySelector('input[type=text]').focus()
			})
		},
		addCalendar(event) {
			const displayName = event.target.querySelector('input[type=text]').value

			// Keep displayname visible while saving
			this.name = displayName
			this.isCreating = true

			this.$store.dispatch('appendCalendar', { displayName, color: getRandomColor() }) // TODO - use uid2color
				.then(() => {
					this.showForm = false
					this.isCreating = false
					this.name = ''
				})
				.catch((error) => {
					console.error(error)
					this.$toast.error(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
					this.isCreating = false
				})
		},
		closeNewCalendarForm() {
			this.showForm = false
			this.name = ''
		}
	}
}
</script>
