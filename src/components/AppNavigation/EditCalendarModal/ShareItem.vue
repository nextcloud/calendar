<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
	<div class="share-item">
		<AccountMultiple v-if="sharee.isGroup" :size="20" class="share-item__group-icon" />
		<IconCircle v-else-if="sharee.isCircle" />
		<NcAvatar v-else :user="sharee.userId" :display-name="sharee.displayName" />

		<p class="share-item__label">
			{{ sharee.displayName }}
		</p>

		<input :id="`${id}-can-edit`"
			:disabled="updatingSharee"
			:checked="sharee.writeable"
			type="checkbox"
			class="checkbox"
			@change="updatePermission">
		<label :for="`${id}-can-edit`">{{ $t('calendar', 'can edit') }}</label>

		<NcActions>
			<NcActionButton :disabled="updatingSharee"
				@click.prevent.stop="unshare">
				<template #icon>
					<Delete :size="20" decorative />
				</template>
				{{ $t('calendar', 'Unshare with {displayName}', { displayName: sharee.displayName }) }}
			</NcActionButton>
		</NcActions>
	</div>
</template>

<script>
import { NcActions, NcActionButton, NcAvatar } from '@nextcloud/vue'
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import IconCircle from '../../Icons/IconCircles.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import {
	showInfo,
} from '@nextcloud/dialogs'
import { randomId } from '../../../utils/randomId.js'

export default {
	name: 'ShareItem',
	components: {
		NcActions,
		NcActionButton,
		NcAvatar,
	  IconCircle,
		AccountMultiple,
		Delete,
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
			id: randomId(),
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
		 * @return {Promise<void>}
		 */
		async unshare() {
			this.updatingSharee = true
			try {
				await this.$store.dispatch('unshareCalendar', {
					calendar: this.calendar,
					uri: this.sharee.uri,
				})
				this.updatingSharee = false
			} catch (error) {
				console.error(error)
				showInfo(this.$t('calendar', 'An error occurred while unsharing the calendar.'))

				this.updatingSharee = false
			}
		},
		/**
		 * Toggles the write-permission of the share
		 *
		 * @return {Promise<void>}
		 */
		async updatePermission() {
			this.updatingSharee = true
			try {
				await this.$store.dispatch('toggleCalendarShareWritable', {
					calendar: this.calendar,
					uri: this.sharee.uri,
				})
				this.updatingSharee = false
			} catch (error) {
				console.error(error)
				showInfo(this.$t('calendar', 'An error occurred, unable to change the permission of the share.'))

				this.updatingSharee = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.share-item {
	display: flex;
	align-items: center;
	gap: 10px;

	&__group-icon {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-text-maxcontrast);
	}

	&__label {
		flex: 1 auto;
	}
}
</style>
