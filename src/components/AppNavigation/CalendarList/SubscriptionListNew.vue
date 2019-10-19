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
		:title="$t('calendar', 'New subscription')"
		@click.prevent.stop="openDialog"
	/>

	<ActionInput
		v-else
		v-click-outside="closeNewCalendarForm"
		:icon="inputIcon"
		:value="link"
		:disabled="isCreating"
		@submit.prevent.stop="addCalendar"
	>
		{{ $t('calendar', 'Link to iCal') }}
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
	name: 'SubscriptionListNew',
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
			link: '',
			isCreating: false,
			showForm: false
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
			const link = event.target.querySelector('input[type=text]').value

			// Keep link visible while saving
			this.link = link
			this.isCreating = true

			let url
			let hostname
			try {
				url = new URL(link)
				hostname = url.hostname
			} catch (error) {
				console.error(error)
				this.$toast.error(this.$t('calendar', 'Please enter a valid link (starting with http://, https://, webcal://, or webcals://)'))
				this.link = ''
				this.isCreating = false
				return
			}

			this.$store.dispatch('appendSubscription', { displayName: hostname, color: getRandomColor(), source: link }) // TODO - use uid2color
				.then(() => {
					this.displayName = ''
					this.showForm = false
					this.isCreating = false
				})
				.catch((error) => {
					console.error(error)
					this.$toast.error(this.$t('calendar', 'An error occurred, unable to create the calendar.'))
					this.isCreating = false
				})
		},
		closeNewCalendarForm() {
			this.showForm = false
			this.link = ''
		}
	}
}
</script>
