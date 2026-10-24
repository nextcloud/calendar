<!--
  - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<NcDialog
		:open="showDialog"
		:name="$t('calendar', 'Search room')"
		size="large"
		@update:open="(e) => $emit('update:show-dialog', e)">
		<div class="modal__content__header">
			<RoomAvailabilityFilters
				v-model:filters="filters"
				:roomTypes="roomFilterOptions.roomType"
				:buildings="roomFilterOptions.building"
				:stories="roomFilterOptions.story"
				:roomNumbers="roomFilterOptions.roomNumber" />
			<table>
				<thead>
					<tr>
						<th class="name">
							{{ $t('calendar', 'Room name') }}
						</th>
						<th class="availability">
							{{ $t('calendar', 'Availability') }}
						</th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="room in filteredRooms" :key="room.id">
						<td>
							<div class="item">
								<div>
									<div class="item-name">
										{{ room.displayname }}
									</div>
								</div>
							</div>
						</td>
						<td class="availability">
							<AvailabilityIndicator
								:available="availabilityFor(room)" />
						</td>
						<td>
							<div class="item-actions">
								<NcButton
									variant="secondary"
									class="rooms__availability"
									@click="openRoomAvailability(room)">
									{{ $t('calendar', 'Check room availability') }}
								</NcButton>
								<NcButton
									variant="primary"
									class="rooms__reserve"
									:disabled="!canReserve(room)"
									@click="reserve(room)">
									{{ isReserved(room) ? $t('calendar', 'Reserved') : $t('calendar', 'Reserve') }}
								</NcButton>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<div>
				<RoomAvailabilityModal
					v-if="showRoomAvailabilityModal"
					:show="showRoomAvailabilityModal"
					:startDate="calendarObjectInstance.startDate"
					:endDate="calendarObjectInstance.endDate"
					:rooms="selectedRooms"
					:calendarObjectInstance="calendarObjectInstance"
					:organizer="currentUserPrincipalAsAttendee"
					@update:show="setShowRoomAvailabilityModal" />
			</div>
		</div>
	</NcDialog>
</template>

<script>
import { NcButton, NcDialog } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import AvailabilityIndicator from './AvailabilityIndicator.vue'
import RoomAvailabilityFilters from './RoomAvailabilityFilters.vue'
import RoomAvailabilityModal from './RoomAvailabilityModal.vue'
import principalAvailabilityMixin from '../../../mixins/principalAvailabilityMixin.js'
import principalReservationMixin from '../../../mixins/principalReservationMixin.js'
import { mapPrincipalObjectToAttendeeObject } from '../../../models/attendee.js'
import usePrincipalsStore from '../../../store/principals.js'

export default {
	name: 'RoomAvailabilityList',
	components: {
		AvailabilityIndicator,
		NcButton,
		NcDialog,
		RoomAvailabilityFilters,
		RoomAvailabilityModal,
	},

	mixins: [principalAvailabilityMixin, principalReservationMixin],

	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},

		startDate: {
			type: Date,
			required: true,
		},

		endDate: {
			type: Date,
			required: true,
		},

		showDialog: {
			type: Boolean,
			default: true,
		},
	},

	emits: ['update:show-dialog', 'addResource'],

	data() {
		return {
			filters: {},
			showRoomAvailabilityModal: false,
			selectedRooms: [],
		}
	},

	computed: {
		...mapStores(usePrincipalsStore),
		rooms() {
			return this.principalsStore.getRoomPrincipals
		},

		/**
		 * The distinct values each select filter offers across the rooms.
		 *
		 * @return {object} Map of filter key -> distinct non-empty values, sorted
		 */
		roomFilterOptions() {
			const options = {
				roomType: new Set(),
				building: new Set(),
				story: new Set(),
				roomNumber: new Set(),
			}
			for (const room of this.rooms) {
				const attributes = this.roomAttributes(room)
				for (const [key, values] of Object.entries(options)) {
					if (attributes[key] !== null && attributes[key] !== '') {
						values.add(attributes[key])
					}
				}
			}

			for (const key in options) {
				options[key] = [...options[key]].sort()
			}

			return options
		},

		filteredRooms() {
			const {
				searchTerm = '',
				roomType = null,
				building = null,
				story = null,
				roomNumber = null,
				minSeatingCapacity = null,
				features = [],
			} = this.filters
			const term = searchTerm.trim().toLowerCase()

			return this.rooms.filter((room) => {
				const attributes = this.roomAttributes(room)

				return (term === '' || attributes.displayName.toLowerCase().includes(term))
					&& (roomType === null || attributes.roomType === roomType)
					&& (building === null || attributes.building === building)
					&& (story === null || attributes.story === story)
					&& (roomNumber === null || attributes.roomNumber === roomNumber)
					&& (minSeatingCapacity === null || (attributes.seatingCapacity !== null && attributes.seatingCapacity >= minSeatingCapacity))
					&& features.every((feature) => attributes.features.includes(feature))
			})
		},

		/**
		 * Return the current user principal as a ORGANIZER attendee object.
		 *
		 * @return {object}
		 */
		currentUserPrincipalAsAttendee() {
			return mapPrincipalObjectToAttendeeObject(
				this.principalsStore.getCurrentUserPrincipal,
				true,
			)
		},
	},

	mounted() {
		this.loadAvailability(this.rooms)
	},

	methods: {
		/**
		 * The filterable attributes of a room, from the room metadata the server
		 * puts on its DAV principal. The DAV metadata has no building name, so the
		 * building address stands in for it. The seating capacity is null when the
		 * room has none; `dav.roomFeatures` is a comma-separated list.
		 *
		 * @param {object} room The room principal
		 * @return {object} The attributes by filter key
		 */
		roomAttributes(room) {
			return {
				roomType: room.dav?.roomType ?? null,
				building: room.dav?.roomBuildingAddress ?? null,
				story: room.dav?.roomBuildingStory ?? null,
				roomNumber: room.dav?.roomBuildingRoomNumber ?? null,
				displayName: room.displayname ?? '',
				seatingCapacity: Number.isFinite(room.dav?.roomSeatingCapacity) ? room.dav.roomSeatingCapacity : null,
				features: (room.dav?.roomFeatures ?? '').split(',').map((feature) => feature.trim()),
			}
		},

		openRoomAvailability(room) {
			this.selectedRooms = [room]
			this.showRoomAvailabilityModal = true
		},

		setShowRoomAvailabilityModal(value) {
			this.showRoomAvailabilityModal = value
		},
	},
}
</script>

<style scoped lang="scss">
.icon-close {
	display: block;
	height: 100%;
}

.modal__content {
	padding: 50px;
	//when the calendar is open, it's cut at the bottom, adding a margin fixes it
	margin-bottom: 95px;
	&__actions{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		&__select{
			width: 260px;
		}
		&__date{
			display: flex;
			justify-content: space-between;
			align-items: center;
			& > *{
				margin-inline-start: 5px;
			}
		}
	}
	&__header {
		padding: 20px;
		margin-bottom: 20px;
		h3{
			font-weight: 500;
		}
		&__attendees{
			&__user-bubble{
				margin-inline-end: 5px;
			}
		}
	}
	&__footer{
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 20px;
		&__title{
			h3{
				font-weight: 500;
			}
			&__timezone{
				color: var(--color-text-lighter);
			}
		}
	}
}

:deep(.vs__search ) {
	text-overflow: ellipsis;
}

:deep(.mx-input) {
	height: 38px !important;
}

.availability {
	padding: 16px;
}
</style>

<style lang="scss">
.blocking-event-free-busy {
	// Show the blocking event above any other blocks, especially the *blocked for all* one
	z-index: 3 !important;
}

.free-busy-block {
	opacity: 0.7 !important;
}

.rooms {
	&__availability {
		margin: 10px 0;
	}

	&__reserve {
		margin: 10px 0;
		margin-inline-start: 8px;
	}
}

h6 {
	margin-top: 10px;
}

.item-name {
	font-weight: bold;
}

.item-actions {
	display: flex;
	justify-content: center;
}

.name {
	opacity: .8;
}
</style>
