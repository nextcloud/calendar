<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div class="calendar-picker-header"
		:class="{
			'calendar-picker-header--readonly': isReadOnly,
			'calendar-picker-header--has-warning': isViewedByAttendee,
		}">
		<NcActions type="tertiary"
			class="calendar-picker-header__picker"
			:class="{
				'calendar-picker-header__picker--has-menu': !isReadOnly && calendars.length > 1,
			}"
			:menu-name="value.displayName"
			:force-name="true"
			:disabled="isDisabled">
			<template #icon>
				<div class="calendar-picker-header__icon">
					<div class="calendar-picker-header__icon__dot"
						:style="{ 'background-color': value.color }" />
				</div>
			</template>
			<template>
				<NcActionButton v-for="calendar in calendars"
					:key="calendar.id"
					:close-after-click="true"
					@click="$emit('update:value', calendar)">
					<template #icon>
						<div class="calendar-picker-header__icon">
							<div class="calendar-picker-header__icon__dot"
								:style="{ 'background-color': calendar.color }" />
						</div>
					</template>
					{{ calendar.displayName }}
				</NcActionButton>
			</template>
		</NcActions>
	</div>
</template>

<script>
import { NcActions, NcActionButton } from '@nextcloud/vue'

export default {
	name: 'CalendarPickerHeader',
	components: {
		NcActions,
		NcActionButton,
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
		/**
		 * @return {boolean}
		 */
		isDisabled() {
			return this.isReadOnly || this.calendars.length < 2
		},
	},
	mounted() {
		// Taken from https://pictogrammers.com/library/mdi/icon/menu-down/
		// Material Design icons by Google are available under the Apache 2.0 license
		const menuDownIconUrl = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTcsMTBMMTIsMTVMMTcsMTBIN1oiIC8+PC9zdmc+)'
		this.$el.style.setProperty('--mdi-menu-down', menuDownIconUrl)
	},
}
</script>

<style lang="scss">
.event-popover {
	.calendar-picker-header {
		button {
			margin-left: -9px;

			.button-vue__text {
				margin-left: 0;
			}
		}
	}

	.calendar-picker-header--readonly button .button-vue__text {
		margin-left: 2px;
	}
}

.app-sidebar {
	.calendar-picker-header {
		button {
			margin-left: -14px;

			.button-vue__text {
				margin-left: 0;
			}
		}
	}

	.calendar-picker-header--readonly button .button-vue__text {
		margin-left: 6px;
	}
}
</style>

<style lang="scss" scoped>
.calendar-picker-header {
	display: flex;
	align-self: flex-start;
	margin-bottom: 5px;

	// Leave room for the three dot and close buttons
	max-width: calc(100% - 79px);

	&--has-warning {
		// Leave room for the immutable warning, three dot menu and close button
		max-width: calc(100% - 79px - 34px);
	}

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
				margin-left: 5px;
				margin-bottom: 1px;
				vertical-align: middle;
				background-image: var(--mdi-menu-down);
				filter: var(--background-invert-if-dark);
			}
		}

		// Fix long calendar name ellipsis
		:deep(.v-popper) {
			display: flex;
			min-width: 0;
		}

		// Keep full opacity for disabled buttons
		&:disabled, :deep(:disabled) {
			opacity: 1 !important;
			filter: unset !important;
		}
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
		}
	}
}
</style>
