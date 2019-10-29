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
		:title="sharee.displayName">
		<template slot="icon">
			<div v-if="sharee.isGroup" class="avatar icon-group" />
			<div v-else-if="sharee.isCircle" class="avatar icon-circle" />
			<Avatar v-else :user="sharee.id" :display-name="sharee.displayName" />
		</template>

		<template slot="counter">
			<ActionCheckbox
				:disabled="updatingSharee"
				:checked="sharee.writeable"
				@update:checked="updatePermission">
				{{ $t('calendar', 'can edit') }}
			</ActionCheckbox>
		</template>

		<template slot="actions">
			<ActionButton
				icon="icon-delete"
				:disabled="updatingSharee"
				@click.prevent.stop="unshare">
				{{ $t('calendar', 'Unshare with {displayName}', { displayName: sharee.displayName }) }}
			</ActionButton>
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	ActionButton,
	ActionCheckbox,
	AppNavigationItem,
	Avatar,
} from '@nextcloud/vue'

export default {
	name: 'CalendarListItemSharingShareItem',
	components: {
		ActionButton,
		ActionCheckbox,
		AppNavigationItem,
		Avatar,
	},
	props: {
		calendar: {
			type: Object,
			required: true,
		},
		sharee: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			updatingSharee: false,
		}
	},
	computed: {
		uid() {
			return this._uid
		},
	},
	methods: {
		/**
		 * Unshares the calendar from the given sharee
		 *
		 * @returns {Promise<void>}
		 */
		async unshare() {
			this.updatingSharee = true
			this.$store.dispatch('unshareCalendar', { calendar: this.calendar, uri: this.sharee.uri })
				.then(() => {
					this.updatingSharee = false
				})
				.catch((error) => {
					console.error(error)
					this.$toast(this.$t('calendar', 'An error occurred, unable to change the unshare the calendar.'))

					this.updatingSharee = false
				})
		},
		/**
		 * Toggles the write-permission of the share
		 *
		 * @returns {Promise<void>}
		 */
		async updatePermission() {
			this.updatingSharee = true
			this.$store.dispatch('toggleCalendarShareWritable', { calendar: this.calendar, uri: this.sharee.uri })
				.then(() => {
					this.updatingSharee = false
				})
				.catch((error) => {
					console.error(error)
					this.$toast(this.$t('calendar', 'An error occurred, unable to change the permission of the share.'))

					this.updatingSharee = false
				})
		},
	},
}
</script>
