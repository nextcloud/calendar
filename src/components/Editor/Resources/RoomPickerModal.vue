<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { RoomFilterOption, RoomOption } from '../../../types/models/roomFilter.ts'

import { n, t } from '@nextcloud/l10n'
import { NcButton, NcDialog, NcLoadingIcon, NcSelect, NcTextField } from '@nextcloud/vue'
import debounce from 'debounce'
import { computed, onMounted, onUnmounted, reactive, ref, useId, watch } from 'vue'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import RoomAvailabilityModal from '../FreeBusy/RoomAvailabilityModal.vue'
import ResourceRoomCard from './ResourceRoomCard.vue'
import { useRoomFilter } from '../../../composables/useRoomFilter.ts'
import { mapPrincipalObjectToAttendeeObject } from '../../../models/attendee.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { getRoomAttendees, removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'
import { buildRoomLocation } from '../../../utils/roomFilter.ts'

const props = defineProps<{
	calendarObjectInstance: {
		attendees: { uri: string, attendeeProperty: { userType: string } }[]
		location: string | null
		eventComponent: { startDate: object, endDate: object, location: string | null }
		startDate: Date
		endDate: Date
	}
}>()

const emit = defineEmits<{
	close: []
}>()

const principalsStore = usePrincipalsStore()
const calendarObjectInstanceStore = useCalendarObjectInstanceStore()

const searchInputId = useId()
const allRooms = ref<RoomOption[]>([])
const isLoadingAvailability = ref(false)
const expandedGroups = reactive<Record<string, boolean>>({})
const roomToCheck = ref<RoomOption | null>(null)

/**
 * Rooms booked when the modal was opened.
 *
 * Ordering and filter pinning key off this snapshot rather than off the staged
 * selection, so cards never move around under the pointer while clicking.
 */
const initiallyBookedEmails = ref<string[]>([])

/**
 * The room the user picked, not yet written to the event.
 *
 * Nothing is applied until "Done" is pressed; closing the dialog any other way
 * discards the choice.
 */
const stagedRoomEmail = ref<string | null>(null)

const {
	searchText,
	selectedBuilding,
	selectedStory,
	minimumSeatingCapacity,
	selectedFeatures,
	buildingOptions,
	storyOptions,
	featureOptions,
	hasActiveFilters,
	roomsFiltered,
	groupedRooms,
	resetFilters,
} = useRoomFilter(allRooms, initiallyBookedEmails)

const organizerAsAttendee = computed(() => {
	return mapPrincipalObjectToAttendeeObject(principalsStore.getCurrentUserPrincipal, true)
})

/**
 * The feature filter as options, so the dropdown can show localized labels
 * while the filter itself keeps working on the raw feature values.
 */
const selectedFeatureOptions = computed<RoomFilterOption[]>({
	get: () => featureOptions.value.filter((option) => selectedFeatures.value.includes(option.id)),
	set: (options) => {
		selectedFeatures.value = options.map((option) => option.id)
	},
})

const dialogButtons = computed(() => [{
	label: t('calendar', 'Done'),
	variant: 'primary' as const,
	callback: () => applySelection(),
}])

/**
 * Check whether a room is the staged one
 *
 * @param room Room to check
 * @return True if the room is currently picked
 */
function isStaged(room: RoomOption): boolean {
	return room.emailAddress !== null && room.emailAddress === stagedRoomEmail.value
}

/**
 * Pick a room, or unpick it when it was already picked
 *
 * @param room Room that was clicked
 */
function toggleRoom(room: RoomOption): void {
	stagedRoomEmail.value = isStaged(room) ? null : room.emailAddress
}

/**
 * Expand or collapse a building
 *
 * @param name Name of the building group
 */
function toggleGroup(name: string): void {
	expandedGroups[name] = !expandedGroups[name]
}

/**
 * Label telling how many rooms of a building are free
 *
 * @param available Number of rooms that are free
 * @param total Number of rooms in the building
 * @return Human readable and localized label
 */
function availabilityLabel(available: number, total: number): string {
	// Translators: %n is the total number of rooms in the building, {available} how many of them are free
	return n('calendar', '{available} of %n room available', '{available} of %n rooms available', total, { available })
}

/**
 * Attach the outcome of a free/busy request to the rooms
 *
 * @param results Availability results keyed by email address
 */
function applyAvailability(results: Map<string, boolean>): void {
	allRooms.value = allRooms.value.map((room) => ({
		...room,
		isAvailable: room.emailAddress === null ? true : results.get(room.emailAddress) ?? true,
	}))
}

/**
 * Predict which rooms are free for the time range of the event
 */
async function loadAvailability(): Promise<void> {
	const options = allRooms.value
		.filter((room) => room.emailAddress !== null)
		.map((room) => ({ email: room.emailAddress as string, isAvailable: true }))
	if (options.length === 0) {
		return
	}

	isLoadingAvailability.value = true
	try {
		await checkResourceAvailability(
			options,
			principalsStore.getCurrentUserPrincipalEmail,
			props.calendarObjectInstance.eventComponent.startDate,
			props.calendarObjectInstance.eventComponent.endDate,
		)

		applyAvailability(new Map(options.map(({ email, isAvailable }) => [email, isAvailable])))
	} catch (error) {
		logger.error('Could not check room availability', { error })
	} finally {
		isLoadingAvailability.value = false
	}
}

const debouncedLoadAvailability = debounce(loadAvailability, 500)

/**
 * Write the staged selection to the event and close
 */
function applySelection(): void {
	const bookedAttendees = getRoomAttendees(props.calendarObjectInstance.attendees)

	for (const attendee of bookedAttendees) {
		if (removeMailtoPrefix(attendee.uri) !== stagedRoomEmail.value) {
			calendarObjectInstanceStore.removeAttendee({
				calendarObjectInstance: props.calendarObjectInstance,
				attendee,
			})
		}
	}

	const staged = allRooms.value.find((room) => isStaged(room))
	if (staged !== undefined && !initiallyBookedEmails.value.includes(stagedRoomEmail.value as string)) {
		calendarObjectInstanceStore.addAttendee({
			calendarObjectInstance: props.calendarObjectInstance,
			commonName: staged.displayname,
			uri: staged.emailAddress,
			calendarUserType: staged.calendarUserType || 'ROOM',
			participationStatus: 'NEEDS-ACTION',
			role: 'REQ-PARTICIPANT',
			rsvp: true,
			organizer: principalsStore.getCurrentUserPrincipal,
		})
		updateLocation(staged)
	}

	emit('close')
}

/**
 * Apply the location of the picked room to the event.
 * Has no effect if the event already has a location.
 *
 * @param room Room that was picked
 */
function updateLocation(room: RoomOption): void {
	if (props.calendarObjectInstance.location || props.calendarObjectInstance.eventComponent.location) {
		return
	}

	const location = buildRoomLocation(room)
	if (location === null) {
		return
	}

	calendarObjectInstanceStore.changeLocation({
		calendarObjectInstance: props.calendarObjectInstance,
		location,
	})
}

onMounted(async () => {
	const bookedRoomEmails = getRoomAttendees(props.calendarObjectInstance.attendees)
		.map((attendee) => removeMailtoPrefix(attendee.uri))
	initiallyBookedEmails.value = bookedRoomEmails
	stagedRoomEmail.value = bookedRoomEmails[0] ?? null

	allRooms.value = principalsStore.getRoomPrincipals
		.map((principal: RoomOption) => ({ ...principal, isAvailable: true }))

	// A handful of buildings fits on screen; more than that is easier to scan collapsed.
	const groups = groupedRooms.value
	for (const [index, group] of groups.entries()) {
		expandedGroups[group.name] = groups.length <= 3 || index === 0
	}

	await loadAvailability()
})

onUnmounted(() => {
	debouncedLoadAvailability.clear()
})

watch(
	() => [props.calendarObjectInstance.startDate, props.calendarObjectInstance.endDate],
	() => debouncedLoadAvailability(),
)
</script>

<template>
	<NcDialog
		:open="true"
		:name="t('calendar', 'Rooms')"
		size="large"
		contentClasses="room-picker"
		:buttons="dialogButtons"
		@update:open="emit('close')">
		<div class="room-picker__filters">
			<NcTextField
				:id="searchInputId"
				v-model="searchText"
				class="room-picker__filters__search"
				:label="t('calendar', 'Search rooms')"
				:placeholder="t('calendar', 'Search rooms')">
				<template #icon>
					<Magnify :size="16" />
				</template>
			</NcTextField>

			<NcSelect
				v-if="buildingOptions.length > 0"
				v-model="selectedBuilding"
				class="room-picker__filters__select"
				:options="buildingOptions.map((option) => option.id)"
				:inputLabel="t('calendar', 'Building')"
				:placeholder="t('calendar', 'All buildings')" />

			<NcSelect
				v-if="storyOptions.length > 0"
				v-model="selectedStory"
				class="room-picker__filters__select"
				:options="storyOptions.map((option) => option.id)"
				:inputLabel="t('calendar', 'Floor')"
				:placeholder="t('calendar', 'All floors')" />

			<NcTextField
				v-model.number="minimumSeatingCapacity"
				class="room-picker__filters__capacity"
				type="number"
				min="0"
				:label="t('calendar', 'Minimum capacity')" />

			<NcSelect
				v-if="featureOptions.length > 0"
				v-model="selectedFeatureOptions"
				class="room-picker__filters__select"
				:options="featureOptions"
				:multiple="true"
				:keepOpen="true"
				label="label"
				:inputLabel="t('calendar', 'Features')"
				:placeholder="t('calendar', 'Any feature')" />
		</div>

		<div v-if="isLoadingAvailability" class="room-picker__loading">
			<NcLoadingIcon :size="20" />
			{{ t('calendar', 'Checking availability…') }}
		</div>

		<div v-if="roomsFiltered.length === 0" class="room-picker__empty">
			<p>{{ hasActiveFilters ? t('calendar', 'No rooms match the filters') : t('calendar', 'No rooms found') }}</p>
			<NcButton v-if="hasActiveFilters" variant="tertiary" @click="resetFilters">
				{{ t('calendar', 'Clear filters') }}
			</NcButton>
		</div>

		<div
			v-for="group in groupedRooms"
			:key="group.name"
			class="room-picker__group">
			<button
				class="room-picker__group__header"
				type="button"
				:aria-expanded="!!expandedGroups[group.name]"
				:aria-controls="`room-picker-group-${group.name}`"
				@click="toggleGroup(group.name)">
				<ChevronDown v-if="expandedGroups[group.name]" :size="20" />
				<ChevronRight v-else :size="20" />
				<span class="room-picker__group__header__name">{{ group.name }}</span>
				<span class="room-picker__group__header__count">
					{{ availabilityLabel(group.availableCount, group.rooms.length) }}
				</span>
			</button>

			<div
				v-show="expandedGroups[group.name]"
				:id="`room-picker-group-${group.name}`">
				<ResourceRoomCard
					v-for="room in group.rooms"
					:key="room.id"
					:room="room"
					:isSelected="isStaged(room)"
					:canCheckAvailability="true"
					@toggle="toggleRoom"
					@checkAvailability="roomToCheck = $event" />
			</div>
		</div>

		<RoomAvailabilityModal
			v-if="roomToCheck !== null"
			:show="true"
			:startDate="props.calendarObjectInstance.startDate"
			:endDate="props.calendarObjectInstance.endDate"
			:rooms="[roomToCheck]"
			:organizer="organizerAsAttendee"
			@update:show="roomToCheck = null" />
	</NcDialog>
</template>

<style lang="scss" scoped>
.room-picker {
	&__filters {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: calc(var(--default-grid-baseline) * 2);
		margin-bottom: calc(var(--default-grid-baseline) * 3);

		&__search {
			flex: 1 1 250px;
		}

		&__select {
			flex: 1 1 180px;
			min-width: 180px;
		}

		&__capacity {
			flex: 0 1 150px;
		}
	}

	&__loading {
		display: flex;
		align-items: center;
		gap: var(--default-grid-baseline);
		color: var(--color-text-maxcontrast);
		margin-bottom: calc(var(--default-grid-baseline) * 2);
	}

	&__empty {
		color: var(--color-text-maxcontrast);
		text-align: center;
		padding: calc(var(--default-grid-baseline) * 4) 0;
	}

	&__group {
		margin-bottom: calc(var(--default-grid-baseline) * 2);

		&__header {
			display: flex;
			align-items: center;
			gap: var(--default-grid-baseline);
			width: 100%;
			padding: var(--default-grid-baseline) 0;
			border: none;
			background-color: transparent;
			text-align: start;

			&__name {
				font-weight: bold;
			}

			&__count {
				color: var(--color-text-maxcontrast);
				margin-inline-start: auto;
			}
		}
	}
}
</style>
