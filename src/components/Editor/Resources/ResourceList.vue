<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-picker">
		<span class="app-full-subtitle">
			<MapMarker :size="20" />
			{{ t('calendar', 'Rooms') }}
		</span>

		<NcButton
			v-if="!props.isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
			class="resource-picker__browse"
			wide
			@click="showModal = true">
			<template #icon>
				<Plus :size="20" />
			</template>
			{{ t('calendar', 'Add') }}
		</NcButton>

		<!-- Rooms and resources already booked for this event -->
		<div v-if="selectedRooms.length > 0" class="resource-picker__selected">
			<ResourceRoomCard
				v-for="room in selectedRooms"
				:key="String(room.emailAddress)"
				:room="room"
				:isStatic="true"
				:compact="true"
				:removable="!props.isReadOnly && isViewedByOrganizer"
				:isReadOnly="props.isReadOnly"
				:isViewedByOrganizer="isViewedByOrganizer"
				@remove="removeRoomByPrincipal" />
		</div>

		<RoomPickerModal
			v-if="showModal"
			:isReadOnly="props.isReadOnly"
			:calendarObjectInstance="props.calendarObjectInstance"
			@close="showModal = false" />
	</div>
</template>

<script setup lang="ts">
import type { RoomPrincipal } from '../../../models/principal.ts'

import { loadState } from '@nextcloud/initial-state'
import { t } from '@nextcloud/l10n'
import { NcButton } from '@nextcloud/vue'
import { computed, ref } from 'vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import ResourceRoomCard from './ResourceRoomCard.vue'
import RoomPickerModal from './RoomPickerModal.vue'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { getResourceAttendees, getRoomAttendees, removeMailtoPrefix } from '../../../utils/attendee.js'

interface Attendee {
	uri: string
	commonName: string | null
	calendarUserType: string
	attendeeProperty: { userType: string }
}

interface CalendarObjectInstanceProp {
	startDate: Date
	endDate: Date
	attendees: Attendee[]
	organizer: { uri: string } | null
	eventComponent: { startDate: object, endDate: object }
}

const props = defineProps<{
	isReadOnly: boolean
	calendarObjectInstance: CalendarObjectInstanceProp
}>()

const principalsStore = usePrincipalsStore()
const calendarObjectInstanceStore = useCalendarObjectInstanceStore()

const resourceBookingEnabled = loadState<boolean>('calendar', 'resource_booking_enabled', false)

const showModal = ref(false)

// Computed
const bookedAttendees = computed<Attendee[]>(() => {
	return [
		...getRoomAttendees(props.calendarObjectInstance.attendees),
		...getResourceAttendees(props.calendarObjectInstance.attendees),
	]
})

/**
 * The principals matching the rooms and resources booked for this event.
 *
 * Rooms and resources are filtered out of the attendee list, so this is the only
 * place in the editor showing what is currently reserved. No availability request
 * is needed here: anything booked is rendered as reserved either way.
 */
const selectedRooms = computed<RoomPrincipal[]>(() => {
	const principals = [
		...(principalsStore.getRoomPrincipals || []),
		...(principalsStore.getResourcePrincipals || []),
	]

	return bookedAttendees.value.map((attendee) => {
		const email = removeMailtoPrefix(attendee.uri)
		const principal = principals.find((p: RoomPrincipal) => p.emailAddress === email)
		if (principal) {
			return { ...principal, isAvailable: true } as RoomPrincipal
		}

		// The principal is unknown (removed room, or not readable by this user)
		return {
			id: email,
			displayname: attendee.commonName || email,
			emailAddress: email,
			calendarUserType: attendee.calendarUserType || 'ROOM',
			isAvailable: true,
			roomSeatingCapacity: null,
			roomType: null,
			roomAddress: null,
			roomFeatures: null,
			roomNumber: null,
			roomFloor: null,
			roomBuildingName: null,
			roomBuildingAddress: null,
		} as RoomPrincipal
	})
})

const hasUserEmailAddress = computed<boolean>(() => {
	const emailAddress = principalsStore.getCurrentUserPrincipal?.emailAddress
	return !!emailAddress
})

const isViewedByOrganizer = computed<boolean>(() => {
	if (!props.calendarObjectInstance.organizer) {
		return true
	}
	const organizerEmail = removeMailtoPrefix(props.calendarObjectInstance.organizer.uri)
	return organizerEmail === principalsStore.getCurrentUserPrincipalEmail
})

// Methods
/**
 * Remove the attendee matching a booked room or resource
 *
 * @param room Principal to remove from the event
 */
function removeRoomByPrincipal(room: RoomPrincipal): void {
	const attendee = bookedAttendees.value.find((a) => removeMailtoPrefix(a.uri) === room.emailAddress)
	if (!attendee) {
		return
	}

	calendarObjectInstanceStore.removeAttendee({
		calendarObjectInstance: props.calendarObjectInstance,
		attendee,
	})
}
</script>

<style lang="scss" scoped>
.resource-picker {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);

	&__selected {
		display: flex;
		flex-direction: column;
		gap: var(--default-grid-baseline);
		width: 100%;
	}
}

.app-full-subtitle {
	font-size: calc(var(--default-font-size) * 1.2);
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}
</style>
