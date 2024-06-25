<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="calendar-picker-option">
		<div class="calendar-picker-option__color-indicator"
			:style="{ backgroundColor: color }" />

		<span class="calendar-picker-option__label">
			{{ displayName }}
		</span>

		<Avatar v-if="isSharedWithMe"
			class="calendar-picker-option__avatar"
			:disable-menu="true"
			:disable-tooltip="true"
			:user="userId"
			:display-name="userDisplayName"
			:size="18" />
	</div>
</template>

<script>
import { NcAvatar as Avatar } from '@nextcloud/vue'
import usePrincipalsStore from '../../store/principals.js'
import { mapStores } from 'pinia'

export default {
	name: 'CalendarPickerOption',
	components: {
		Avatar,
	},
	props: {
		color: {
			type: String,
			required: true,
		},
		displayName: {
			type: String,
			required: true,
		},
		owner: {
			type: String,
			required: true,
		},
		isSharedWithMe: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		...mapStores(usePrincipalsStore),
		/**
		 * Get the principal object of the calendar's owner
		 *
		 * @return {null | object}
		 */
		principal() {
			return this.principalsStore.getPrincipalByUrl(this.owner)
		},
		/**
		 * Gets the user-id of the calendar's owner
		 *
		 * @return {null | string}
		 */
		userId() {
			if (this.principal) {
				return this.principal.userId
			}

			return null
		},
		/**
		 * Gets the displayname of the calendar's owner
		 *
		 * @return {null | string}
		 */
		userDisplayName() {
			if (this.principal) {
				return this.principal.displayname
			}

			return null
		},
	},
}
</script>
