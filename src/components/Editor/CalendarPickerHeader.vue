<!--
  - @copyright Copyright (c) 2024 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with this program.  If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div class="calendar-picker-header"
		:class="{ 'calendar-picker-header--readonly': isReadOnly }">
		<NcActions type="tertiary"
			class="calendar-picker-header__picker"
			:class="{ 'calendar-picker-header__picker--fix-width': isReadOnly && value && value.isSharedWithMe }"
			:menu-name="value.displayName"
			:force-name="true"
			:disabled="isDisabled">
			<template #icon>
				<div class="calendar-picker-header__icon">
					<div class="calendar-picker-header__icon__dot"
						:style="{ 'background-color': value.color }" />
				</div>
			</template>
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
	},
	computed: {
		/**
		 * @return {boolean}
		 */
		isDisabled() {
			return this.isReadOnly || this.calendars.length < 2
		},
	},
}
</script>

<style lang="scss">
.event-popover {
	.calendar-picker-header {
		width: calc(100% - 79px);

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
		width: calc(100% - 30px);

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
	align-self: flex-start;
	margin-bottom: 5px;

	&__picker {
		// For some reason the NcActions component behaves weirdly when a calendar is shared
		// read-only with the user. This is an ugly workaround to fix the width of the button.
		&--fix-width {
			width: unset;
			max-width: 100%;
		}

		:deep(button.button-vue) {
			max-width: 100%;
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
