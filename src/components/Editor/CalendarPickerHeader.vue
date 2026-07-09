<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div
		class="calendar-picker-header"
		:class="{
			'calendar-picker-header--readonly': isReadOnly,
			'calendar-picker-header--has-warning': isViewedByAttendee,
		}">
		<NcActions
			variant="tertiary"
			class="calendar-picker-header__picker"
			:class="{
				'calendar-picker-header__picker--has-menu': !isReadOnly && calendars.length > 1,
			}"
			:menuName="getOptionLabel(value)"
			:forceName="true"
			:disabled="isDisabled">
			<template #icon>
				<div class="calendar-picker-header__icon">
					<div
						class="calendar-picker-header__icon__dot"
						:style="{ 'background-color': value.color }" />
				</div>
			</template>
			<template #default>
				<NcActionButton
					v-for="calendar in calendars"
					:key="calendar.id"
					class="calendar-picker-header__picker__option"
					:closeAfterClick="true"
					@click="$emit('update:value', calendar)">
					<template #icon>
						<div class="calendar-picker-header__picker__option__row">
							<div
								class="calendar-picker-header__icon__dot"
								:style="{ 'background-color': calendar.color }" />
							<span class="calendar-picker-header__picker__option__label">{{ getOptionLabel(calendar) }}</span>
							<NcAvatar
								v-if="calendar.isDelegated"
								class="calendar-picker-header__picker__option__avatar"
								:title="getDelegatorDisplayName(calendar)"
								:disableMenu="true"
								:disableTooltip="true"
								:hideStatus="true"
								:user="getDelegatorUserId(calendar)"
								:displayName="getDelegatorDisplayName(calendar)"
								:size="20" />
							<NcAvatar
								v-else-if="calendar.isSharedWithMe"
								class="calendar-picker-header__picker__option__avatar"
								:title="getOwnerDisplayName(calendar)"
								:disableMenu="true"
								:disableTooltip="true"
								:hideStatus="true"
								:user="getOwnerUserId(calendar)"
								:displayName="getOwnerDisplayName(calendar)"
								:size="20" />
						</div>
					</template>
				</NcActionButton>
			</template>
		</NcActions>
		<NcAvatar
			v-if="value.isDelegated"
			class="calendar-picker-header__avatar"
			:disableMenu="true"
			:title="delegatorDisplayName"
			:disableTooltip="true"
			:user="delegatorUserId"
			:displayName="delegatorDisplayName"
			:size="24" />
		<NcAvatar
			v-else-if="value.isSharedWithMe"
			class="calendar-picker-header__avatar"
			:disableMenu="true"
			:title="ownerDisplayName"
			:disableTooltip="true"
			:user="ownerUserId"
			:displayName="ownerDisplayName"
			:size="24" />
	</div>
</template>

<script>
import { NcActionButton, NcActions, NcAvatar } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import usePrincipalsStore from '../../store/principals.js'

export default {
	name: 'CalendarPickerHeader',
	components: {
		NcActions,
		NcActionButton,
		NcAvatar,
	},

	props: {
		value: {
			type: Object,
			required: true,
		},

		calendars: {
			type: Array,
			required: true,
		},

		isReadOnly: {
			type: Boolean,
			required: true,
		},

		isViewedByAttendee: {
			type: Boolean,
			required: true,
		},
	},

	computed: {
		...mapStores(usePrincipalsStore),
		/**
		 * @return {boolean}
		 */
		isDisabled() {
			return this.isReadOnly || this.calendars.length < 2
		},

		/**
		 * Get the principal object of the calendar's owner
		 *
		 * @return {null | object}
		 */
		ownerPrincipal() {
			return this.principalsStore.getPrincipalByUrl(this.value.owner)
		},

		/**
		 * Gets the user-id of the calendar's owner
		 *
		 * @return {null | string}
		 */
		ownerUserId() {
			return this.ownerPrincipal?.userId ?? null
		},

		/**
		 * Gets the display name of the calendar's owner
		 *
		 * @return {null | string}
		 */
		ownerDisplayName() {
			return this.ownerPrincipal?.displayname ?? null
		},

		delegatorPrincipal() {
			if (!this.value.delegatorUrl) {
				return null
			}
			return this.principalsStore.getPrincipalByUrl(this.value.delegatorUrl) ?? null
		},

		delegatorUserId() {
			return this.delegatorPrincipal?.userId ?? null
		},

		delegatorDisplayName() {
			return this.delegatorPrincipal?.displayname ?? this.delegatorPrincipal?.userId ?? null
		},
	},

	mounted() {
		// Taken from https://pictogrammers.com/library/mdi/icon/menu-down/
		// Material Design icons by Google are available under the Apache 2.0 license
		const menuDownIconUrl = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTcsMTBMMTIsMTVMMTcsMTBIN1oiIC8+PC9zdmc+)'
		this.$el.style.setProperty('--mdi-menu-down', menuDownIconUrl)
	},

	methods: {
		/**
		 * Gets the user-id of the given calendar's owner
		 *
		 * @param {object} calendar The calendar object
		 * @return {null | string}
		 */
		getOwnerUserId(calendar) {
			return this.principalsStore.getPrincipalByUrl(calendar.owner)?.userId ?? null
		},

		/**
		 * Gets the display name of the given calendar's owner
		 *
		 * @param {object} calendar The calendar object
		 * @return {null | string}
		 */
		getOwnerDisplayName(calendar) {
			return this.principalsStore.getPrincipalByUrl(calendar.owner)?.displayname ?? null
		},

		/**
		 * Gets the user-id of the given delegated calendar's delegator
		 *
		 * @param {object} calendar The calendar object
		 * @return {null | string}
		 */
		getDelegatorUserId(calendar) {
			if (!calendar.delegatorUrl) {
				return null
			}
			return this.principalsStore.getPrincipalByUrl(calendar.delegatorUrl)?.userId ?? null
		},

		/**
		 * Gets the display name of the given delegated calendar's delegator
		 *
		 * @param {object} calendar The calendar object
		 * @return {null | string}
		 */
		getDelegatorDisplayName(calendar) {
			if (!calendar.delegatorUrl) {
				return null
			}
			const principal = this.principalsStore.getPrincipalByUrl(calendar.delegatorUrl)
			return principal?.displayname ?? principal?.userId ?? null
		},

		/**
		 * Builds the option label including the "(delegated by X)" suffix
		 * when applicable.
		 *
		 * @param {object} calendar The calendar object
		 * @return {string}
		 */
		getOptionLabel(calendar) {
			if (calendar.isDelegated) {
				const delegator = this.getDelegatorDisplayName(calendar)
				if (delegator) {
					return this.$t('calendar', '{name} (delegated by {delegator})', {
						name: calendar.displayName,
						delegator,
					})
				}
			}
			return calendar.displayName
		},
	},
}
</script>

<style lang="scss">
.event-popover {
	.calendar-picker-header {
		button {
			margin-inline-start: -9px;

			.button-vue__text {
				margin-inline-start: 0;
			}
		}
	}

	.calendar-picker-header--readonly button .button-vue__text {
		margin-inline-start: 2px;
	}
}
</style>

<style lang="scss" scoped>
.calendar-picker-header {
	display: flex;
	margin-inline-start: -10px; // Needed to align the color circle image

	&__picker {
		display: flex;
		min-width: 0;

		&--has-menu {
			// Inject menu down icon via CSS because only text can be specified in the template
			:deep(.button-vue__text::after) {
				content: "";
				display: inline-block;
				width: 20px;
				height: 20px;
				margin-inline-start: 5px;
				margin-bottom: 1px;
				vertical-align: middle;
				background-image: var(--mdi-menu-down);
				filter: var(--background-invert-if-dark);
			}
		}

		&__option {
			:deep(button) {
				align-items: center !important;
			}

			&__row {
				display: flex;
				align-items: center;
				gap: calc(var(--default-grid-baseline) * 2);
				min-width: 0;
				padding-inline-start: var(--default-grid-baseline);
			}

			&__label {
				flex: 0 1 auto;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				text-align: start;
				white-space: nowrap;
			}

			&__avatar {
				flex-shrink: 0;
			}
		}

		// Fix long calendar name ellipsis
		:deep(.v-popper) {
			display: flex;
			min-width: 0;
		}

		:deep(.button-vue__text) {
			display: flex;
			align-items: center;
		}

		// Keep full opacity for disabled buttons
		&:disabled, :deep(:disabled) {
			opacity: 1 !important;
			filter: unset !important;
		}
	}

	&__avatar {
		flex-shrink: 0;
		align-self: center;
		margin-inline-start: var(--default-grid-baseline);
	}

	&__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;

		&__dot {
			$dot-size: 16px;
			width: $dot-size;
			height: $dot-size;
			border-radius: $dot-size;
			flex-shrink: 0;
		}
	}
}
</style>
