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
				<tr>
					<th class="name">
						{{ $t('calendar', 'Room name') }}
					</th>
					<th>&nbsp;</th>
				</tr>
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
			</table>
			<div>
				<RoomAvailabilityModal
					v-if="showRoomAvailabilityModal"
					:show.sync="showRoomAvailabilityModal"
					:start-date="calendarObjectInstance.startDate"
					:end-date="calendarObjectInstance.endDate"
					:rooms="selectedRooms"
					:calendar-object-instance="calendarObjectInstance"
					:organizer="currentUserPrincipalAsAttendee" />
			</div>
		</div>
	</NcDialog>
</template>

<script>
import { NcButton, NcDialog } from '@nextcloud/vue'
import { mapStores } from 'pinia'
import RoomAvailabilityModal from './RoomAvailabilityModal.vue'
import { mapPrincipalObjectToAttendeeObject } from '../../../models/attendee.js'
import usePrincipalsStore from '../../../store/principals.js'

export default {
	name: 'RoomAvailabilityList',
	components: {
		NcButton,
		NcDialog,
		RoomAvailabilityModal,
	},

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

	data() {
		return {
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
