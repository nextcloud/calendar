<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { RoomOption } from '@/utils/roomFilter'

import { n, t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import AccountOutlineIcon from 'vue-material-design-icons/AccountOutline.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import Check from 'vue-material-design-icons/Check.vue'
import { formatRoomFeature, formatRoomType } from '@/models/resourceProps'

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
	const capacity = props.room.principal.roomSeatingCapacity
	if (capacity === null) {
		return null
	}

	return n('calendar', '%n seat', '%n seats', capacity)
})

const metaLabels = computed<string[]>(() => {
	const labels = new Array<string>()
	const roomType = props.room.principal.roomType
	if (roomType) {
		labels.push(formatRoomType(roomType) ?? roomType)
	}

	const roomNumber = props.room.principal.roomBuildingRoomNumber
	if (roomNumber) {
		labels.push(roomNumber)
	}

	for (const feature of props.room.principal.roomFeatures ?? []) {
		labels.push(formatRoomFeature(feature))
	}

	return labels
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
			'room-card--selected': isSelected,
			'room-card--unavailable': isUnavailable,
		}">
		<button
			class="room-card__main"
			type="button"
			:aria-pressed="isSelected"
			:aria-disabled="isUnavailable"
			@click="onToggle">
			<span class="room-card__info">
				<span class="room-card__name">{{ room.principal.displayname }}</span>
				<span class="room-card__meta">
					<span
						v-if="room.principal.roomSeatingCapacity !== null"
						class="room-card__meta__capacity"
						:aria-label="capacityLabel">
						<AccountOutlineIcon :size="16" />
						{{ room.principal.roomSeatingCapacity }}
					</span>
					<template v-for="(metaLabel, idx) in metaLabels" :key="idx">
						<span v-if="idx != 0 || room.principal.roomSeatingCapacity !== null">
							·
						</span>
						<span>
							{{ metaLabel }}
						</span>
					</template>
				</span>
			</span>
			<span v-if="isUnavailable" class="room-card__status">
				{{ t('calendar', 'Unavailable') }}
			</span>
			<Check v-else-if="isSelected" class="room-card__check" :size="20" />

			<div class="room-card__availability">
				<NcButton
					v-if="canCheckAvailability"
					variant="tertiary"
					:ariaLabel="t('calendar', 'Check room availability')"
					:title="t('calendar', 'Check room availability')"
					@click.stop="emit('checkAvailability', room)">
					<template #icon>
						<CalendarClock :size="20" />
					</template>
				</NcButton>
			</div>
		</button>
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

	&__main {
		display: flex;
		align-items: center;
		gap: calc(var(--default-grid-baseline) * 2);
		flex: 1 1 auto;
		min-width: 0;
		padding: calc(var(--default-grid-baseline) * 2);
		margin: 0;
		border: none;
		background-color: transparent;
		text-align: start;
		font-weight: normal;

		&:focus {
			background-color: unset;
		}
	}

	&--unavailable &__main {
		cursor: not-allowed;
	}

	&--unavailable &__main &__availability {
		cursor: pointer;
	}

	&--unavailable &__info {
		opacity: 0.7;
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

		&__capacity {
			display: inline-flex;
			align-items: baseline;
			gap: var(--default-grid-baseline);
		}
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
