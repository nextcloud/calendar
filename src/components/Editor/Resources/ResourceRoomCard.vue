<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		class="room-card"
		:class="{
			'room-card--added': props.isAdded,
			'room-card--unavailable': !props.room.isAvailable && !props.isAdded,
		}"
		:title="props.room.roomBuildingAddress || ''">
		<div class="room-card__row">
			<div class="room-card__info">
				<span class="room-card__name">{{ props.room.displayname }}</span>
				<span class="room-card__meta">
					<span
						class="room-card__status"
						:class="statusClass">
						{{ statusLabel }}
					</span>
					<template v-if="props.room.roomSeatingCapacity">
						&middot; {{ props.room.roomSeatingCapacity }}p
					</template>
					<template v-if="subLocation">
						&middot; {{ subLocation }}
					</template>
					<template v-if="roomTypeLabel">
						&middot; {{ roomTypeLabel }}
					</template>
				</span>
			</div>
			<NcButton
				v-if="props.isViewedByOrganizer && !props.isReadOnly && (props.isAdded || (props.room.isAvailable && !props.hasRoomSelected))"
				:variant="props.isAdded ? 'tertiary' : 'secondary'"
				class="room-card__action"
				@click="toggleRoom">
				<template #icon>
					<Minus v-if="props.isAdded" :size="20" />
					<Plus v-else :size="20" />
				</template>
			</NcButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { computed } from 'vue'
import Minus from 'vue-material-design-icons/Minus.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import { formatRoomType } from '../../../models/resourceProps.js'

interface RoomPrincipal {
	id: string | null
	displayname: string | null
	emailAddress: string | null
	calendarUserType: string
	isAvailable: boolean
	roomSeatingCapacity: string | null
	roomType: string | null
	roomAddress: string | null
	roomNumber: string | null
	roomBuildingName: string | null
	roomBuildingAddress: string | null
}

interface AddRoomPayload {
	commonName: string | null
	email: string | null
	calendarUserType: string
	roomAddress: string | null
}

const props = withDefaults(defineProps<{
	room: RoomPrincipal
	isAdded?: boolean
	isReadOnly?: boolean
	isViewedByOrganizer?: boolean
	hasRoomSelected?: boolean
}>(), {
	isAdded: false,
	isReadOnly: false,
	isViewedByOrganizer: false,
	hasRoomSelected: false,
})

const emit = defineEmits<{
	removeRoom: [room: RoomPrincipal]
	addRoom: [payload: AddRoomPayload]
}>()

const statusLabel = computed<string>(() => {
	if (props.isAdded) {
		return t('calendar', 'Reserved')
	}
	return props.room.isAvailable
		? t('calendar', 'Available')
		: t('calendar', 'Unavailable')
})

const statusClass = computed<string>(() => {
	if (props.isAdded) {
		return 'room-card__status--reserved'
	}
	return props.room.isAvailable
		? 'room-card__status--free'
		: 'room-card__status--busy'
})

const subLocation = computed<string>(() => {
	return props.room.roomNumber || ''
})

const roomTypeLabel = computed<string>(() => {
	const type = props.room.roomType
	if (!type || type === 'meeting-room') {
		return ''
	}
	return formatRoomType(type) ?? type
})

function toggleRoom(): void {
	if (props.isAdded) {
		emit('removeRoom', props.room)
	} else {
		emit('addRoom', {
			commonName: props.room.displayname,
			email: props.room.emailAddress,
			calendarUserType: props.room.calendarUserType,
			roomAddress: props.room.roomAddress,
		})
	}
}
</script>

<style lang="scss" scoped>
.room-card {
	padding: 6px 10px;
	border-radius: var(--border-radius-large);
	border: 1px solid var(--color-border);
	background: var(--color-main-background);

	&--added {
		border-inline-start: 3px solid var(--color-primary);
		background: var(--color-primary-element-light);
	}

	&--unavailable:not(.room-card--added) {
		opacity: 0.55;
	}

	&__row {
		display: flex;
		align-items: center;
		gap: 8px;
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
		line-height: 1.3;
	}

	&__meta {
		display: block;
		font-size: calc(var(--default-font-size) * 0.85);
		color: var(--color-text-maxcontrast);
		line-height: 1.3;
	}

	&__status {
		&--free {
			color: var(--color-success-text, #2d7a3a);
			font-weight: 600;
		}

		&--busy {
			color: var(--color-error-text, #c9302c);
			font-weight: 600;
		}

		&--reserved {
			color: var(--color-primary-element);
			font-weight: 600;
		}
	}

	&__action {
		flex-shrink: 0;
	}
}
</style>
