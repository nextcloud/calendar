<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<component
		:is="isInteractive ? 'button' : 'div'"
		class="room-card"
		:class="{
			'room-card--selected': props.isSelected,
			'room-card--unavailable': isUnavailable,
		}"
		:type="isInteractive ? 'button' : undefined"
		:disabled="isInteractive ? isDisabled : undefined"
		:aria-pressed="isInteractive ? props.isSelected : undefined"
		:title="props.room.roomBuildingAddress || ''"
		@click="onClick">
		<MapMarker
			v-if="props.compact && isRoom"
			:size="20"
			class="room-card__icon" />

		<span class="room-card__info">
			<span class="room-card__name">{{ props.room.displayname }}</span>
			<span class="room-card__meta">
				<span
					v-if="!props.compact && props.room.roomSeatingCapacity"
					class="room-card__capacity"
					:aria-label="capacityLabel">
					<AccountOutline :size="16" />
					{{ props.room.roomSeatingCapacity }}
				</span>
				<span v-for="part in metaParts" :key="part">{{ part }}</span>
			</span>
		</span>

		<span class="room-card__trailing">
			<Check
				v-if="props.isSelected && !props.removable"
				:size="20"
				class="room-card__check" />
			<span
				v-else-if="isUnavailable"
				class="room-card__status room-card__status--busy">
				{{ t('calendar', 'Unavailable') }}
			</span>
		</span>

		<NcButton
			v-if="props.removable"
			variant="tertiary"
			class="room-card__remove"
			:aria-label="t('calendar', 'Remove')"
			:title="t('calendar', 'Remove')"
			@click="emit('remove', props.room)">
			<template #icon>
				<Close :size="20" />
			</template>
		</NcButton>
	</component>
</template>

<script setup lang="ts">
import type { RoomPrincipal } from '../../../models/principal.ts'

import { n, t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue'
import Check from 'vue-material-design-icons/Check.vue'
import Close from 'vue-material-design-icons/Close.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import { formatRoomType } from '../../../models/resourceProps.js'

const props = withDefaults(defineProps<{
	room: RoomPrincipal
	isSelected?: boolean
	isReadOnly?: boolean
	isViewedByOrganizer?: boolean
	/** Whether the card is display-only, i.e. clicking it does not toggle the selection */
	isStatic?: boolean
	/** Whether to show a trailing remove button instead of the selected checkmark */
	removable?: boolean
	/** Condensed variant used to list what is booked, outside the picker */
	compact?: boolean
}>(), {
	isSelected: false,
	isReadOnly: false,
	isViewedByOrganizer: false,
	isStatic: false,
	removable: false,
	compact: false,
})

const emit = defineEmits<{
	toggle: [room: RoomPrincipal]
	remove: [room: RoomPrincipal]
}>()

const isInteractive = computed<boolean>(() => {
	return !props.isStatic && !props.isReadOnly && props.isViewedByOrganizer
})

// An unavailable room can still be deselected once it is picked
const isUnavailable = computed<boolean>(() => {
	return !props.room.isAvailable && !props.isSelected
})

const isDisabled = computed<boolean>(() => {
	return isUnavailable.value
})

const capacityLabel = computed<string>(() => {
	const capacity = parseInt(props.room.roomSeatingCapacity as string) || 0
	return n('calendar', '%n seat', '%n seats', capacity)
})

const roomTypeLabel = computed<string>(() => {
	const type = props.room.roomType
	if (!type || type === 'meeting-room') {
		return ''
	}
	return formatRoomType(type) ?? type
})

const isRoom = computed<boolean>(() => {
	return props.room.calendarUserType === 'ROOM'
})

const metaParts = computed<string[]>(() => {
	// The compact variant trades the seating capacity for the building name
	const leading = props.compact ? [props.room.roomBuildingName] : []
	return [...leading, props.room.roomNumber, roomTypeLabel.value].filter(Boolean) as string[]
})

/**
 * Toggle the selection, unless the card is not interactive
 */
function onClick(): void {
	if (!isInteractive.value || isDisabled.value) {
		return
	}
	emit('toggle', props.room)
}
</script>

<style lang="scss" scoped>
.room-card {
	--room-card-border-color: var(--color-border);
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
	width: 100%;
	// !important beats the server's global button margin rule
	margin: 0 !important;
	padding: calc(var(--default-grid-baseline) * 2) calc(var(--default-grid-baseline) * 3);
	border: 1px solid var(--room-card-border-color);
	border-radius: var(--border-radius-large);
	background: var(--color-main-background);
	color: inherit;
	font: inherit;
	text-align: start;

	&:is(button) {
		cursor: pointer;

		// The server's global button:hover rule (core/css/inputs.scss) would
		// otherwise swap the border to --color-main-text, so re-assert ours
		&:hover:not(:disabled) {
			border-color: var(--room-card-border-color) !important;
		}

		&:disabled {
			cursor: default;
		}
	}

	&--selected {
		--room-card-border-color: var(--color-primary-element-light-hover);
		background: var(--color-primary-element-light);
	}

	// Declared after --selected so the condensed variant wins when both apply
	&--compact {
		--room-card-border-color: var(--color-border-dark);
		padding: var(--default-grid-baseline);
		background: var(--color-main-background);
	}

	&__icon {
		flex-shrink: 0;
		color: var(--color-text-maxcontrast);
	}

	&__info {
		flex: 1;
		min-width: 0;
	}

	&__name {
		display: block;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__meta {
		display: flex;
		align-items: center;
		gap: var(--default-grid-baseline);
		font-size: var(--font-size-small);
		color: var(--color-text-maxcontrast);

		> :not(:first-child)::before {
			content: '·';
			margin-inline-end: var(--default-grid-baseline);
		}
	}

	&__capacity {
		display: flex;
		align-items: center;
		gap: calc(var(--default-grid-baseline) / 2);
	}

	&__trailing {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	&__check {
		color: var(--color-primary-element);
	}

	&__status {
		font-size: var(--font-size-small);

		&--busy {
			color: var(--color-error-text);
			font-weight: 600;
		}
	}

	&__remove {
		flex-shrink: 0;
	}
}
</style>
