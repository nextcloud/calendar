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
			<table>
				<thead>
					<tr>
						<th class="name">
							{{ $t('calendar', 'Room name') }}
						</th>
						<th>&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="room in rooms" :key="room.id">
						<td>
							<div class="item">
								<div>
									<div class="item-name">
										{{ room.displayname }}
									</div>
								</div>
							</div>
						</td>
						<td>
							<div class="item-actions">
								<NcButton
									variant="secondary"
									class="rooms__availability"
									@click="openRoomAvailability(room)">
									{{ $t('calendar', 'Check room availability') }}
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
					:organizer="currentUserPrincipalAsAttendee"
					@update:show="setShowRoomAvailabilityModal" />
			</div>
		</div>
	</NcDialog>
</template>

<script>
import { NcButton, NcDialog } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import RoomAvailabilityModal from '@/components/Editor/FreeBusy/RoomAvailabilityModal.vue'
import { mapPrincipalObjectToAttendeeObject } from '@/models/attendee.js'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import usePrincipalsStore from '@/store/principals.js'

export default {
	name: 'RoomAvailabilityList',
	components: {
		NcButton,
		NcDialog,
		RoomAvailabilityModal,
	},

	props: {
		showDialog: {
			type: Boolean,
			default: true,
		},
	},

	emits: ['update:show-dialog'],

	data() {
		return {
			showRoomAvailabilityModal: false,
			selectedRooms: [],
		}
	},

	computed: {
		...mapStores(usePrincipalsStore),
		...mapState(useCalendarObjectInstanceStore, ['calendarObjectInstance']),

		rooms() {
			return this.principalsStore.getRoomPrincipals
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

	methods: {
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
.modal__content__header {
	padding: 20px;
	margin-bottom: 20px;
}

:deep(.vs__search ) {
	text-overflow: ellipsis;
}

:deep(.mx-input) {
	height: 38px !important;
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
}

h6 {
	margin-top: 10px;
}

.item-name {
	font-weight: bold;
}

.item-actions {
	text-align: center;
}

.name {
	opacity: .8;
}
</style>
