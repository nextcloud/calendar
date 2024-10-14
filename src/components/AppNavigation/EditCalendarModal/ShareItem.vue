<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="share-item">
		<AccountMultiple v-if="sharee.isGroup" :size="20" class="share-item__group-icon" />
		<AccountGroupIcon v-else-if="sharee.isCircle" :size="20" class="share-item__team-icon" />
		<NcAvatar v-else :user="sharee.userId" :display-name="sharee.displayName" />

		<div class="share-item__label">
			{{ sharee.displayName }}
			<p>
				{{ shareeEmail }}
			</p>
		</div>

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
import AccountGroupIcon from 'vue-material-design-icons/AccountGroup.vue'
import Delete from 'vue-material-design-icons/Delete.vue'
import {
	showInfo,
} from '@nextcloud/dialogs'
import { randomId } from '../../../utils/randomId.js'
import { mapStores } from 'pinia'
import useCalendarsStore from '../../../store/calendars.js'
import usePrincipalsStore from '../../../store/principals.js'

export default {
	name: 'ShareItem',
	components: {
		NcActions,
		NcActionButton,
		NcAvatar,
		AccountGroupIcon,
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
			shareeEmail: '',
		}
	},
	computed: {
		...mapStores(useCalendarsStore, usePrincipalsStore),
		uid() {
			return this._uid
		},
		/**
		 * @return {string}
		 */
		displayName() {
			if (this.sharee.isCircle) {
				return t('calendar', '{teamDisplayName} (Team)', {
					teamDisplayName: this.sharee.displayName,
				})
			}

			return this.sharee.displayName
		},
	},
	mounted() {
		this.updateShareeEmail()
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
				await this.calendarsStore.unshareCalendar({
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
				await this.calendarsStore.toggleCalendarShareWritable({
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

		async updateShareeEmail() {
			if (this.sharee.isGroup || this.sharee.isCircle) {
				return
			}

			const shareeUrl = this.sharee.uri.replace('principal:', '/remote.php/dav/') + '/'

			await this.principalsStore.fetchPrincipalByUrl({ url: shareeUrl })

			const principal = this.principalsStore.getPrincipalByUrl(shareeUrl)

			this.shareeEmail = principal.emailAddress
		},
	},
}
</script>

<style lang="scss" scoped>
.share-item {
	display: flex;
	align-items: center;
	gap: 10px;

	&__group-icon,
	&__team-icon {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-text-maxcontrast);
	}

	&__team-icon {
		// Upstream icon is slightly misaligned when centered using flex
		:deep(svg) {
			margin-bottom: 3px;
		}
	}

	&__label {
		flex: 1 auto;
		flex-direction: column;

		p {
			color: var(--color-text-lighter);
			line-height: 1;
		}
	}
}
</style>
