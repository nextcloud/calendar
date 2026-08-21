<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { RoomPrincipal } from '@/types/models/principal.js'
import type { RoomFilterOption, RoomOption } from '@/utils/roomFilter.ts'

import { n, t } from '@nextcloud/l10n'
import { NcButton, NcDialog, NcLoadingIcon, NcSelect, NcTextField } from '@nextcloud/vue'
import debounce from 'debounce'
import { computed, onMounted, onUnmounted, reactive, ref, useId, watch } from 'vue'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import Magnify from 'vue-material-design-icons/Magnify.vue'
import RoomAvailabilityModal from '@/components/Editor/FreeBusy/RoomAvailabilityModal.vue'
import ResourceRoomCard from '@/components/Editor/Resources/ResourceRoomCard.vue'
import { useRoomFilter } from '@/composables/useRoomFilter'
import { mapPrincipalObjectToAttendeeObject } from '@/models/attendee.js'
import { checkResourceAvailability } from '@/services/freeBusyService.js'
import useCalendarObjectInstanceStore from '@/store/calendarObjectInstance.js'
import usePrincipalsStore from '@/store/principals.js'
import { getRoomAttendees, removeMailtoPrefix } from '@/utils/attendee.js'
import logger from '@/utils/logger.js'

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
const buildingInputId = useId()
const storyInputId = useId()
const capacityInputId = useId()
const featureInputId = useId()
const allRooms = ref<RoomOption[]>([])
const isLoadingAvailability = ref(false)
const expandedGroups = reactive<Record<string, boolean>>({})
const roomToCheck = ref<RoomPrincipal | null>(null)

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
	return room.principal.emailAddress !== null && room.principal.emailAddress === stagedRoomEmail.value
}

/**
 * Pick a room, or unpick it when it was already picked
 *
 * @param room Room that was clicked
 */
function toggleRoom(room: RoomOption): void {
	stagedRoomEmail.value = isStaged(room) ? null : room.principal.emailAddress
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
		isAvailable: room.principal.emailAddress === null ? true : results.get(room.principal.emailAddress) ?? true,
	}))
}

/**
 * Predict which rooms are free for the time range of the event
 */
async function loadAvailability(): Promise<void> {
	const options = allRooms.value
		.filter((room) => room.principal.emailAddress !== null)
		.map((room) => ({ email: room.principal.emailAddress as string, isAvailable: true }))
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
			commonName: staged.principal.displayname,
			uri: staged.principal.emailAddress,
			calendarUserType: staged.principal.calendarUserType || 'ROOM',
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
	if (props.calendarObjectInstance.location) {
		return
	}

	const roomAddress = room.principal.roomAddress
	if (roomAddress === null || roomAddress.trim().length === 0) {
		return
	}

	calendarObjectInstanceStore.changeLocation({
		calendarObjectInstance: props.calendarObjectInstance,
		location: roomAddress,
	})
}

onMounted(async () => {
	const bookedRoomEmails = getRoomAttendees(props.calendarObjectInstance.attendees)
		.map((attendee) => removeMailtoPrefix(attendee.uri))
	initiallyBookedEmails.value = bookedRoomEmails
	stagedRoomEmail.value = bookedRoomEmails[0] ?? null

	allRooms.value = principalsStore.getRoomPrincipals
		.map((principal: RoomOption) => ({ principal, isAvailable: true }))

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
		size="normal"
		contentClasses="room-picker"
		:buttons="dialogButtons"
		@update:open="emit('close')">
		<div class="room-picker__filters">
			<!-- The placeholder carries the design, the label carries the accessible name -->
			<label :for="searchInputId" class="hidden-visually">{{ t('calendar', 'Search rooms') }}</label>
			<NcTextField
				:id="searchInputId"
				v-model="searchText"
				:labelOutside="true"
				:placeholder="t('calendar', 'Name, building or room number')"
				:showTrailingButton="searchText.length > 0"
				trailingButtonIcon="close"
				@trailingButtonClick="searchText = ''">
				<template #icon>
					<Magnify :size="16" />
				</template>
			</NcTextField>

			<div class="room-picker__filters__row">
				<div v-if="buildingOptions.length > 0" class="room-picker__field">
					<label class="room-picker__field__label" :for="buildingInputId">
						{{ t('calendar', 'Building') }}
					</label>
					<NcSelect
						v-model="selectedBuilding"
						:inputId="buildingInputId"
						:labelOutside="true"
						:options="buildingOptions.map((option) => option.id)"
						:placeholder="t('calendar', 'Any')" />
				</div>

				<div v-if="storyOptions.length > 0" class="room-picker__field">
					<label class="room-picker__field__label" :for="storyInputId">
						{{ t('calendar', 'Floor') }}
					</label>
					<NcSelect
						v-model="selectedStory"
						:inputId="storyInputId"
						:labelOutside="true"
						:options="storyOptions.map((option) => option.id)"
						:placeholder="t('calendar', 'Any')" />
				</div>
			</div>

			<div class="room-picker__filters__row">
				<div class="room-picker__field">
					<label class="room-picker__field__label" :for="capacityInputId">
						{{ t('calendar', 'Minimum capacity') }}
					</label>
					<NcTextField
						:id="capacityInputId"
						v-model.number="minimumSeatingCapacity"
						:labelOutside="true"
						type="number"
						min="0" />
				</div>

				<div v-if="featureOptions.length > 0" class="room-picker__field">
					<label class="room-picker__field__label" :for="featureInputId">
						{{ t('calendar', 'Features') }}
					</label>
					<NcSelect
						v-model="selectedFeatureOptions"
						:inputId="featureInputId"
						:labelOutside="true"
						:options="featureOptions"
						:multiple="true"
						:keepOpen="true"
						label="label"
						:placeholder="t('calendar', 'Any')" />
				</div>
			</div>
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
					:key="room.principal.id"
					:room="room"
					:isSelected="isStaged(room)"
					:canCheckAvailability="true"
					@toggle="toggleRoom"
					@checkAvailability="roomToCheck = $event.principal" />
			</div>
		</div>

		<RoomAvailabilityModal
			v-if="roomToCheck !== null"
			:show="true"
			:startDate="calendarObjectInstance.startDate"
			:endDate="calendarObjectInstance.endDate"
			:rooms="[roomToCheck]"
			:organizer="organizerAsAttendee"
			@update:show="roomToCheck = null" />
	</NcDialog>
</template>

<style lang="scss" scoped>
.room-picker {
	&__filters {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 2);
		margin-bottom: calc(var(--default-grid-baseline) * 3);

		// Two controls per row at most: a select keeps a min-width of 260px,
		// so a third one would push the row past the width of the dialog.
		&__row {
			display: flex;
			flex-wrap: wrap;
			align-items: start;
			gap: calc(var(--default-grid-baseline) * 3);

			> * {
				flex: 1 1 220px;
			}
		}
	}

	// A label above its control, so that a text field and a select line up
	// on the same baseline within a row
	&__field {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) / 2);
		min-width: 0;

		&__label {
			color: var(--color-text-maxcontrast);
			font-size: calc(var(--default-font-size) * 0.9);
		}

		// Give every control the same height and let the row decide the width
		:deep(.input-field__input),
		:deep(.v-select.select) {
			min-height: var(--default-clickable-area);
			min-width: 0;
			width: 100%;
			margin: 0;
		}

		:deep(.v-select.select .vs__dropdown-toggle) {
			min-height: var(--default-clickable-area);
		}

		// While the dropdown is closed there is nothing to type into, so the
		// search input only leaves a stray caret next to the selected value.
		// It regains its width as soon as the dropdown opens.
		:deep(.v-select.select:not(.vs--open) .vs__search) {
			width: 0;
			padding: 0;
			margin: 0;
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
			padding: var(--default-grid-baseline);
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
