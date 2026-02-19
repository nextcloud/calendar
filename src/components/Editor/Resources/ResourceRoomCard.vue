<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		class="room-card"
		:class="{
			'room-card--added': isAdded,
			'room-card--unavailable': !room.isAvailable && !isAdded,
		}"
		:title="room.roomBuildingAddress || ''">
		<div class="room-card__row">
			<div class="room-card__info">
				<span class="room-card__name">{{ room.displayname }}</span>
				<span class="room-card__meta">
					<span
						class="room-card__status"
						:class="statusClass">
						{{ statusLabel }}
					</span>
					<template v-if="room.roomSeatingCapacity">
						&middot; {{ room.roomSeatingCapacity }}p
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
				v-if="isViewedByOrganizer && !isReadOnly && (isAdded || (room.isAvailable && !hasRoomSelected))"
				:variant="isAdded ? 'tertiary' : 'secondary'"
				class="room-card__action"
				@click="toggleRoom">
				<template #icon>
					<Minus v-if="isAdded" :size="20" />
					<Plus v-else :size="20" />
				</template>
			</NcButton>
		</div>
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
import Minus from 'vue-material-design-icons/Minus.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import { formatRoomType } from '../../../models/resourceProps.js'

export default {
	name: 'ResourceRoomCard',
	components: {
		Minus,
		NcButton,
		Plus,
	},

	props: {
		room: {
			type: Object,
			required: true,
		},

		isAdded: {
			type: Boolean,
			default: false,
		},

		isReadOnly: {
			type: Boolean,
			default: false,
		},

		isViewedByOrganizer: {
			type: Boolean,
			default: false,
		},

		hasRoomSelected: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['removeRoom', 'addRoom'],

	computed: {
		statusLabel() {
			if (this.isAdded) {
				return this.$t('calendar', 'Reserved')
			}
			return this.room.isAvailable
				? this.$t('calendar', 'Available')
				: this.$t('calendar', 'Unavailable')
		},

		statusClass() {
			if (this.isAdded) {
				return 'room-card__status--reserved'
			}
			return this.room.isAvailable
				? 'room-card__status--free'
				: 'room-card__status--busy'
		},

		subLocation() {
			return this.room.roomNumber || ''
		},

		roomTypeLabel() {
			const type = this.room.roomType
			if (!type || type === 'meeting-room') {
				return ''
			}
			return formatRoomType(type) ?? type
		},
	},

	methods: {
		toggleRoom() {
			if (this.isAdded) {
				this.$emit('removeRoom', this.room)
			} else {
				this.$emit('addRoom', {
					commonName: this.room.displayname,
					email: this.room.emailAddress,
					calendarUserType: this.room.calendarUserType,
					roomAddress: this.room.roomAddress,
				})
			}
		},
	},
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
