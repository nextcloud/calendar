<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="calendar-picker-option">
		<div
			class="calendar-picker-option__color-indicator"
			:style="{ backgroundColor: color }" />

		<span class="calendar-picker-option__label">
			{{ displayName }}
			<span v-if="isDelegated && delegatorDisplayName" class="calendar-picker-option__delegation">
				{{ $t('calendar', '(delegated by {name})', { name: delegatorDisplayName }) }}
			</span>
		</span>

		<Avatar
			v-if="isDelegated"
			class="calendar-picker-option__avatar"
			:disableMenu="true"
			:disableTooltip="true"
			:user="delegatorUserId"
			:displayName="delegatorDisplayName"
			:size="18" />
		<Avatar
			v-else-if="isSharedWithMe"
			class="calendar-picker-option__avatar"
			:disableMenu="true"
			:disableTooltip="true"
			:user="userId"
			:displayName="userDisplayName"
			:size="18" />
	</div>
</template>

<script>
import { NcAvatar as Avatar } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import usePrincipalsStore from '../../store/principals.js'

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

		isDelegated: {
			type: Boolean,
			default: false,
		},

		delegatorUrl: {
			type: String,
			default: '',
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

		delegatorPrincipal() {
			if (!this.delegatorUrl) {
				return null
			}
			return this.principalsStore.getPrincipalByUrl(this.delegatorUrl) || null
		},

		delegatorUserId() {
			return this.delegatorPrincipal?.userId || null
		},

		delegatorDisplayName() {
			return this.delegatorPrincipal?.displayname || this.delegatorPrincipal?.userId || ''
		},
	},
}
</script>

<style lang="scss" scoped>
.calendar-picker-option__delegation {
	color: var(--color-text-maxcontrast);
	margin-inline-start: 4px;
}
</style>
