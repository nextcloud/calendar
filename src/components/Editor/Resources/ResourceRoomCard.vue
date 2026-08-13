<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { RoomOption } from '../../../types/models/roomFilter.ts'

import { n, t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import AccountOutline from 'vue-material-design-icons/AccountOutline.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import Check from 'vue-material-design-icons/Check.vue'
import { formatRoomType } from '../../../models/resourceProps.js'
import { deriveBuildingName } from '../../../utils/roomFilter.ts'

const props = withDefaults(defineProps<{
	room: RoomOption
	isSelected?: boolean
	canCheckAvailability?: boolean
}>(), {
	isSelected: false,
	canCheckAvailability: false,
})

const emit = defineEmits<{
	toggle: [room: RoomOption]
	checkAvailability: [room: RoomOption]
}>()

/**
 * An unavailable room cannot be picked, but a room that was picked before it
 * became unavailable must stay selectable so it can be deselected again.
 */
const isUnavailable = computed<boolean>(() => !props.room.isAvailable && !props.isSelected)

const capacityLabel = computed<string | null>(() => {
	const capacity = props.room.roomSeatingCapacity
	if (capacity === null) {
		return null
	}

	return n('calendar', '%n seat', '%n seats', capacity)
})

/**
 * Building, room number and room type, whichever of them are known.
 *
 * @remarks
 * Joined into one string rather than separated with a pseudo element: a
 * generated separator ends up in the accessibility tree as a stray character,
 * including for the cards of a collapsed building.
 */
const metaLabel = computed<string | null>(() => {
	// A meeting room is the default type and carries no information: showing it
	// on every card only pushes the parts that do differ out of view.
	const roomType = props.room.roomType === null || props.room.roomType === 'meeting-room'
		? null
		: formatRoomType(props.room.roomType)

	const parts = [
		deriveBuildingName(props.room),
		props.room.roomBuildingRoomNumber,
		roomType,
	].filter((part): part is string => !!part)

	return parts.length === 0 ? null : parts.join(' · ')
})

/**
 * Toggle the room, unless it cannot be booked anyway
 */
function onToggle(): void {
	if (isUnavailable.value) {
		return
	}

	emit('toggle', props.room)
}
</script>

<template>
	<div
		class="room-card"
		:class="{
			'room-card--selected': props.isSelected,
			'room-card--unavailable': isUnavailable,
		}">
		<button
			class="room-card__main"
			type="button"
			:aria-pressed="props.isSelected"
			:aria-disabled="isUnavailable"
			@click="onToggle">
			<span class="room-card__info">
				<span class="room-card__name">{{ props.room.displayname }}</span>
				<span v-if="metaLabel !== null" class="room-card__meta">{{ metaLabel }}</span>
			</span>

			<span
				v-if="props.room.roomSeatingCapacity !== null"
				class="room-card__capacity"
				:aria-label="capacityLabel">
				<AccountOutline :size="16" />
				{{ props.room.roomSeatingCapacity }}
			</span>

			<span v-if="isUnavailable" class="room-card__status">
				{{ t('calendar', 'Unavailable') }}
			</span>
			<Check v-else-if="props.isSelected" class="room-card__check" :size="20" />
		</button>

		<NcButton
			v-if="props.canCheckAvailability"
			class="room-card__availability"
			variant="tertiary"
			:ariaLabel="t('calendar', 'Check room availability')"
			:title="t('calendar', 'Check room availability')"
			@click="emit('checkAvailability', props.room)">
			<template #icon>
				<CalendarClock :size="20" />
			</template>
		</NcButton>
	</div>
</template>

<style lang="scss" scoped>
.room-card {
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
	border: 2px solid var(--color-border);
	border-radius: var(--border-radius-element, var(--border-radius-large));
	margin-bottom: var(--default-grid-baseline);

	&--selected {
		border-color: var(--color-primary-element);
		background-color: var(--color-primary-element-light);
	}

	&--unavailable {
		opacity: 0.7;
	}

	&__main {
		display: flex;
		align-items: center;
		gap: calc(var(--default-grid-baseline) * 2);
		flex: 1 1 auto;
		min-width: 0;
		padding: calc(var(--default-grid-baseline) * 2);
		border: none;
		border-radius: inherit;
		background-color: transparent;
		text-align: start;
		font-weight: normal;

		&[aria-disabled='true'] {
			cursor: default;
		}

		&:hover:not([aria-disabled='true']) {
			background-color: var(--color-background-hover);
		}
	}

	&__info {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-width: 0;
	}

	&__name {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	&__meta {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--color-text-maxcontrast);
		font-size: var(--font-size-small, 0.875rem);
	}

	&__capacity {
		display: flex;
		align-items: center;
		gap: var(--default-grid-baseline);
		color: var(--color-text-maxcontrast);
		white-space: nowrap;
	}

	&__status {
		color: var(--color-error-text);
		white-space: nowrap;
	}

	&__check {
		color: var(--color-primary-element);
	}

	&__availability {
		flex: 0 0 auto;
		margin-inline-end: var(--default-grid-baseline);
	}
}
</style>
