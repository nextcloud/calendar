<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcModal
		size="normal"
		labelId="resource-picker-heading"
		@close="$emit('close')">
		<div class="resource-picker">
			<h2 id="resource-picker-heading" class="resource-picker__heading">
				{{ t('calendar', 'Rooms and resources') }}
			</h2>

			<div class="resource-picker__tabs" role="tablist">
				<NcButton
					v-for="tab in tabs"
					:id="`resource-picker-tab-${tab.id}`"
					:key="tab.id"
					class="resource-picker__tab"
					role="tab"
					:variant="activeTab === tab.id ? 'secondary' : 'tertiary'"
					:aria-selected="activeTab === tab.id"
					ariaControls="resource-picker-panel"
					wide
					@click="activeTab = tab.id">
					{{ tab.label }}
				</NcButton>
			</div>

			<div
				id="resource-picker-panel"
				class="resource-picker__panel"
				role="tabpanel"
				:aria-labelledby="`resource-picker-tab-${activeTab}`">
				<!-- Search and filter -->
				<div
					v-if="!props.isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
					class="resource-picker__filters">
					<NcTextField
						v-model="filterText"
						:placeholder="searchPlaceholder"
						:showTrailingButton="filterText.length > 0"
						trailingButtonIcon="close"
						@trailingButtonClick="filterText = ''" />

					<template v-if="activeTab === 'rooms'">
						<div class="resource-picker__filters__row">
							<!-- Building dropdown -->
							<div v-if="buildingOptions.length > 0" class="resource-picker__field">
								<label class="resource-picker__field-label" for="resource-picker-building">
									{{ t('calendar', 'Building') }}
								</label>
								<NcSelect
									v-model="selectedBuilding"
									inputId="resource-picker-building"
									:options="buildingOptions"
									:placeholder="t('calendar', 'Any')"
									:clearable="true"
									label="label"
									:reduce="(opt: { id: string }) => opt.id" />
							</div>

							<!-- Minimum capacity -->
							<div class="resource-picker__field">
								<label class="resource-picker__field-label" for="resource-picker-capacity">
									{{ t('calendar', 'Minimum capacity') }}
								</label>
								<NcTextField
									id="resource-picker-capacity"
									v-model.number="filterMinCapacity"
									type="number"
									min="0"
									:labelOutside="true"
									:placeholder="t('calendar', 'pers.')" />
							</div>
						</div>

						<!-- Floor dropdown -->
						<div v-if="floorOptions.length > 0" class="resource-picker__field">
							<label class="resource-picker__field-label" for="resource-picker-floor">
								{{ t('calendar', 'Floor') }}
							</label>
							<NcSelect
								v-model="selectedFloor"
								inputId="resource-picker-floor"
								:options="floorOptions"
								:placeholder="t('calendar', 'Any')"
								:clearable="true"
								label="label"
								:reduce="(opt: { id: string }) => opt.id" />
						</div>

						<!-- Features multi-select -->
						<div v-if="featureOptions.length > 0" class="resource-picker__field">
							<label class="resource-picker__field-label" for="resource-picker-features">
								{{ t('calendar', 'Features') }}
							</label>
							<NcSelect
								v-model="selectedFeatures"
								inputId="resource-picker-features"
								:options="featureOptions"
								:placeholder="t('calendar', 'Any')"
								:multiple="true"
								:keepOpen="true"
								label="label"
								:reduce="(opt: { id: string }) => opt.id" />
						</div>
					</template>
				</div>

				<!-- Loading state -->
				<div v-if="isLoadingAvailability" class="resource-picker__loading">
					<NcLoadingIcon :size="32" />
				</div>

				<!-- Grouped room list -->
				<div v-else-if="activeTab === 'rooms'" class="resource-picker__list">
					<div
						v-for="group in groupedRooms"
						:key="group.name"
						class="resource-picker__group">
						<button
							class="resource-picker__group-header"
							type="button"
							@click="toggleGroup(group.name)">
							<ChevronDown
								v-if="expandedGroups[group.name]"
								:size="20" />
							<ChevronRight
								v-else
								:size="20" />
							<span class="resource-picker__group-name">{{ group.name }}</span>
							<span class="resource-picker__group-count">
								{{ availabilityLabel(group) }}
							</span>
						</button>
						<div v-if="expandedGroups[group.name]" class="resource-picker__group-rooms">
							<ResourceRoomCard
								v-for="room in group.rooms"
								:key="String(room.id)"
								:room="room"
								:isSelected="isRoomStaged(room)"
								:isReadOnly="props.isReadOnly"
								:isViewedByOrganizer="isViewedByOrganizer"
								@toggle="toggleRoom" />
						</div>
					</div>

					<p
						v-if="sortedRooms.length === 0 && allRooms.length > 0"
						class="resource-picker__empty">
						{{ t('calendar', 'No rooms found') }}
					</p>
					<p
						v-else-if="allRooms.length === 0"
						class="resource-picker__empty">
						{{ t('calendar', 'No rooms available') }}
					</p>
				</div>

				<!-- Flat resource list -->
				<div v-else class="resource-picker__list">
					<div class="resource-picker__group-rooms">
						<ResourceRoomCard
							v-for="resource in sortedResources"
							:key="String(resource.id)"
							:room="resource"
							:isSelected="isResourceStaged(resource)"
							:isReadOnly="props.isReadOnly"
							:isViewedByOrganizer="isViewedByOrganizer"
							@toggle="toggleResource" />
					</div>

					<p
						v-if="sortedResources.length === 0 && allResources.length > 0"
						class="resource-picker__empty">
						{{ t('calendar', 'No resources found') }}
					</p>
					<p
						v-else-if="allResources.length === 0"
						class="resource-picker__empty">
						{{ t('calendar', 'No resources available') }}
					</p>
				</div>
			</div>

			<div class="resource-picker__footer">
				<NcButton variant="primary" @click="applyAndClose">
					{{ t('calendar', 'Done') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script setup lang="ts">
import type { RoomPrincipal } from '../../../models/principal.ts'

import { loadState } from '@nextcloud/initial-state'
import { n, t } from '@nextcloud/l10n'
import { NcButton, NcLoadingIcon, NcModal, NcSelect } from '@nextcloud/vue'
import debounce from 'debounce'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import ResourceRoomCard from './ResourceRoomCard.vue'
import { formatFacility } from '../../../models/resourceProps.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { getResourceAttendees, getRoomAttendees, removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'

type TabId = 'rooms' | 'resources'

interface RoomGroup {
	name: string
	rooms: RoomPrincipal[]
	availableCount: number
}

interface Attendee {
	uri: string
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

const emit = defineEmits<{
	close: []
}>()

const principalsStore = usePrincipalsStore()
const calendarObjectInstanceStore = useCalendarObjectInstanceStore()

const resourceBookingEnabled = loadState<boolean>('calendar', 'resource_booking_enabled', false)

// Reactive state
const tabs: { id: TabId, label: string }[] = [
	{ id: 'rooms', label: t('calendar', 'Rooms') },
	{ id: 'resources', label: t('calendar', 'Resources') },
]
const activeTab = ref<TabId>('rooms')
const allRooms = ref<RoomPrincipal[]>([])
const allResources = ref<RoomPrincipal[]>([])
const isLoadingAvailability = ref(false)
const filterText = ref('')
const filterMinCapacity = ref(0)
const selectedBuilding = ref<string | null>(null)
const selectedFloor = ref<string | null>(null)
const selectedFeatures = ref<string[]>([])
const expandedGroups = reactive<Record<string, boolean>>({})

// Staged selection. Nothing is written to the event until "Done" is pressed;
// closing the modal any other way discards it.
const stagedRoomEmail = ref<string | null>(null)
const stagedResourceEmails = ref<string[]>([])

// Emails booked when the modal opened. Ordering and filter pinning key off this
// snapshot rather than the staged selection, so cards never jump while clicking.
const initiallyBookedEmails = ref<string[]>([])

// Computed
const searchPlaceholder = computed<string>(() => {
	return activeTab.value === 'rooms'
		? t('calendar', 'Search rooms…')
		: t('calendar', 'Search resources…')
})

const bookedAttendees = computed<Attendee[]>(() => {
	return [
		...getRoomAttendees(props.calendarObjectInstance.attendees),
		...getResourceAttendees(props.calendarObjectInstance.attendees),
	]
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

const buildingOptions = computed<{ id: string, label: string }[]>(() => {
	const buildings = new Set<string>()
	for (const room of allRooms.value) {
		const name = room.roomBuildingName
		if (name) {
			buildings.add(name)
		}
	}
	return [...buildings].sort().map((id) => ({ id, label: id }))
})

const floorOptions = computed<{ id: string, label: string }[]>(() => {
	const floors = new Set<string>()
	for (const room of allRooms.value) {
		const floor = room.roomFloor
		if (floor) {
			floors.add(floor)
		}
	}
	return [...floors].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((id) => ({ id, label: id }))
})

const featureOptions = computed<{ id: string, label: string }[]>(() => {
	const facilitySet = new Set<string>()
	for (const room of allRooms.value) {
		const features = room.roomFeatures?.split(',') ?? []
		for (const f of features) {
			const trimmed = f.trim()
			if (trimmed) {
				facilitySet.add(trimmed)
			}
		}
	}
	return [...facilitySet].sort().map((id) => ({
		id,
		label: formatFacility(id),
	}))
})

const filteredRooms = computed<RoomPrincipal[]>(() => {
	return allRooms.value.filter((room) => {
		// Always show rooms that are booked or staged, whatever the filters say
		if (isPinned(room) || isRoomStaged(room)) {
			return true
		}
		// Text filter
		if (filterText.value) {
			const q = filterText.value.toLowerCase()
			if (!room.displayname?.toLowerCase().includes(q)
				&& !room.roomAddress?.toLowerCase().includes(q)
				&& !room.roomBuildingAddress?.toLowerCase().includes(q)
				&& !room.roomBuildingName?.toLowerCase().includes(q)
				&& !room.roomNumber?.toLowerCase().includes(q)) {
				return false
			}
		}
		// Building filter
		if (selectedBuilding.value) {
			if ((room.roomBuildingName || '') !== selectedBuilding.value) {
				return false
			}
		}
		// Floor filter
		if (selectedFloor.value) {
			const floor = room.roomFloor
			if ((floor || '') !== selectedFloor.value) {
				return false
			}
		}
		// Capacity filter
		if (filterMinCapacity.value > 0) {
			const cap = parseInt(room.roomSeatingCapacity as string) || 0
			if (cap < filterMinCapacity.value) {
				return false
			}
		}
		// Facility filters (multi-select: all selected features must be present)
		if (selectedFeatures.value.length > 0) {
			const features = room.roomFeatures?.split(',').map((f) => f.trim()) ?? []
			for (const required of selectedFeatures.value) {
				if (!features.includes(required)) {
					return false
				}
			}
		}
		return true
	})
})

/**
 * Booked first, then available, then alphabetically.
 *
 * Deliberately keyed off the initial snapshot rather than the staged selection,
 * so clicking a card never reorders the list under the pointer.
 *
 * @param a First principal to compare
 * @param b Second principal to compare
 * @return Sort order of the two principals
 */
function compareByBookingState(a: RoomPrincipal, b: RoomPrincipal): number {
	const aAdded = isPinned(a) ? 0 : 1
	const bAdded = isPinned(b) ? 0 : 1
	if (aAdded !== bAdded) {
		return aAdded - bAdded
	}

	const aAvail = a.isAvailable ? 0 : 1
	const bAvail = b.isAvailable ? 0 : 1
	if (aAvail !== bAvail) {
		return aAvail - bAvail
	}

	return (a.displayname || '').localeCompare(b.displayname || '')
}

const sortedRooms = computed<RoomPrincipal[]>(() => {
	return [...filteredRooms.value].sort(compareByBookingState)
})

const sortedResources = computed<RoomPrincipal[]>(() => {
	const q = filterText.value.toLowerCase()
	return allResources.value
		.filter((resource) => {
			if (isPinned(resource) || isResourceStaged(resource)) {
				return true
			}
			return !q || !!resource.displayname?.toLowerCase().includes(q)
		})
		.sort(compareByBookingState)
})

const groupedRooms = computed<RoomGroup[]>(() => {
	const groups: Record<string, RoomGroup> = {}

	for (const room of sortedRooms.value) {
		const groupName = room.roomBuildingName || t('calendar', 'Other')
		if (!groups[groupName]) {
			groups[groupName] = { name: groupName, rooms: [], availableCount: 0 }
		}
		groups[groupName].rooms.push(room)
		if (room.isAvailable) {
			groups[groupName].availableCount++
		}
	}

	// Sort groups: groups with added rooms first, then alphabetically
	return Object.values(groups).sort((a, b) => {
		const aHasAdded = a.rooms.some((r) => isPinned(r)) ? 0 : 1
		const bHasAdded = b.rooms.some((r) => isPinned(r)) ? 0 : 1
		if (aHasAdded !== bHasAdded) {
			return aHasAdded - bHasAdded
		}
		return a.name.localeCompare(b.name)
	})
})

// Methods
/**
 * Check whether a principal was already booked when the modal opened
 *
 * @param principal Room or resource principal
 * @return True if the principal was an attendee at open time
 */
function isPinned(principal: RoomPrincipal): boolean {
	return initiallyBookedEmails.value.includes(principal.emailAddress as string)
}

/**
 * Check whether a room is in the staged selection
 *
 * @param room Room principal
 * @return True if the room is staged
 */
function isRoomStaged(room: RoomPrincipal): boolean {
	return !!room.emailAddress && stagedRoomEmail.value === room.emailAddress
}

/**
 * Check whether a resource is in the staged selection
 *
 * @param resource Resource principal
 * @return True if the resource is staged
 */
function isResourceStaged(resource: RoomPrincipal): boolean {
	return stagedResourceEmails.value.includes(resource.emailAddress as string)
}

/**
 * Stage or unstage a room. Only one room can be booked, so picking a different
 * one replaces the current selection.
 *
 * @param room Room principal that was clicked
 */
function toggleRoom(room: RoomPrincipal): void {
	stagedRoomEmail.value = isRoomStaged(room) ? null : room.emailAddress
}

/**
 * Stage or unstage a resource. Any number of resources can be booked.
 *
 * @param resource Resource principal that was clicked
 */
function toggleResource(resource: RoomPrincipal): void {
	const email = resource.emailAddress as string
	if (isResourceStaged(resource)) {
		stagedResourceEmails.value = stagedResourceEmails.value.filter((e) => e !== email)
	} else {
		stagedResourceEmails.value = [...stagedResourceEmails.value, email]
	}
}

/**
 * Describe how many rooms of a group are free for the event's time range
 *
 * @param group Building group to describe
 * @return Label such as "3 out of 5 rooms available"
 */
function availabilityLabel(group: RoomGroup): string {
	return n(
		'calendar',
		'{available} out of %n room available',
		'{available} out of %n rooms available',
		group.rooms.length,
		{ available: group.availableCount },
	)
}

/**
 * Expand or collapse a building group
 *
 * @param groupName Name of the group to toggle
 */
function toggleGroup(groupName: string): void {
	expandedGroups[groupName] = !expandedGroups[groupName]
}

/**
 * Query free/busy for every room and resource and update their availability
 */
async function loadAvailability(): Promise<void> {
	const principals = [...allRooms.value, ...allResources.value]
	if (principals.length === 0) {
		return
	}

	const options = principals.map((p) => ({
		email: p.emailAddress,
		isAvailable: true,
	}))

	try {
		await checkResourceAvailability(
			options,
			principalsStore.getCurrentUserPrincipalEmail,
			props.calendarObjectInstance.eventComponent.startDate,
			props.calendarObjectInstance.eventComponent.endDate,
		)

		const applyAvailability = (list: RoomPrincipal[]) => list.map((principal) => {
			const opt = options.find((o) => o.email === principal.emailAddress)
			return opt ? { ...principal, isAvailable: opt.isAvailable } : principal
		})

		allRooms.value = applyAvailability(allRooms.value)
		allResources.value = applyAvailability(allResources.value)
	} catch (error) {
		logger.error('Could not check room availability', { error })
	}
}

const debouncedLoadAvailability = debounce(loadAvailability, 500)

/**
 * Load all room and resource principals and their availability
 */
async function loadAllPrincipals(): Promise<void> {
	isLoadingAvailability.value = true

	const toPrincipal = (p: Record<string, unknown>) => ({
		...p,
		isAvailable: true,
	} as RoomPrincipal)

	allRooms.value = (principalsStore.getRoomPrincipals || []).map(toPrincipal)
	allResources.value = (principalsStore.getResourcePrincipals || []).map(toPrincipal)

	await loadAvailability()
	isLoadingAvailability.value = false

	// Initialize expanded groups after data is loaded
	nextTick(() => {
		const groups = groupedRooms.value
		if (groups.length <= 3) {
			for (const g of groups) {
				expandedGroups[g.name] = true
			}
		} else if (groups.length > 0) {
			expandedGroups[groups[0].name] = true
		}
	})
}

/**
 * Book a room or resource for this event
 *
 * @param principal Principal to add as an attendee
 */
function addPrincipal(principal: RoomPrincipal): void {
	calendarObjectInstanceStore.addAttendee({
		calendarObjectInstance: props.calendarObjectInstance,
		commonName: principal.displayname,
		uri: principal.emailAddress,
		calendarUserType: principal.calendarUserType || 'ROOM',
		participationStatus: 'NEEDS-ACTION',
		role: 'REQ-PARTICIPANT',
		rsvp: true,
		organizer: principalsStore.getCurrentUserPrincipal,
	})
	updateLocation(principal.roomAddress)
}

/**
 * Write the staged selection to the event and close the modal.
 *
 * Removes attendees that were dropped, adds the ones that are new, and leaves
 * untouched anything that was already booked and still is.
 */
function applyAndClose(): void {
	const stagedEmails = [
		...(stagedRoomEmail.value ? [stagedRoomEmail.value] : []),
		...stagedResourceEmails.value,
	]

	for (const attendee of bookedAttendees.value) {
		if (!stagedEmails.includes(removeMailtoPrefix(attendee.uri))) {
			calendarObjectInstanceStore.removeAttendee({
				calendarObjectInstance: props.calendarObjectInstance,
				attendee,
			})
		}
	}

	const alreadyBooked = initiallyBookedEmails.value
	const principals = [...allRooms.value, ...allResources.value]
	for (const email of stagedEmails) {
		if (alreadyBooked.includes(email)) {
			continue
		}
		const principal = principals.find((p) => p.emailAddress === email)
		if (principal) {
			addPrincipal(principal)
		}
	}

	emit('close')
}

/**
 * Set the event location, if the principal provides an address
 *
 * @param location Address to set as the event location
 */
function updateLocation(location: string | null): void {
	if (!location) {
		return
	}
	calendarObjectInstanceStore.changeLocation({
		calendarObjectInstance: props.calendarObjectInstance,
		location,
	})
}

// Watchers
watch(() => props.calendarObjectInstance.startDate, debouncedLoadAvailability)
watch(() => props.calendarObjectInstance.endDate, debouncedLoadAvailability)

// Lifecycle
onMounted(async () => {
	// Seeded unconditionally: "Done" diffs against this, so an empty staged
	// selection must mean "the user deselected everything", never "not loaded yet"
	const attendees = props.calendarObjectInstance.attendees
	const bookedRoom = getRoomAttendees(attendees)[0]
	stagedRoomEmail.value = bookedRoom ? removeMailtoPrefix(bookedRoom.uri) : null
	stagedResourceEmails.value = getResourceAttendees(attendees)
		.map((attendee: Attendee) => removeMailtoPrefix(attendee.uri))
	initiallyBookedEmails.value = bookedAttendees.value
		.map((attendee) => removeMailtoPrefix(attendee.uri))

	if (resourceBookingEnabled && isViewedByOrganizer.value) {
		await loadAllPrincipals()
	}
})
</script>

<style lang="scss" scoped>
.resource-picker {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);
	padding: calc(var(--default-grid-baseline) * 4);

	&__heading {
		margin: 0;
		text-align: center;
		font-size: calc(var(--default-font-size) * 1.4);
		font-weight: 600;
	}

	&__tabs {
		display: flex;
		align-items: center;
		gap: calc(var(--default-grid-baseline) * 2);
	}

	&__tab {
		flex: 1;
		min-width: 0;
	}

	&__panel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 2);
	}

	&__filters {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 2);

		&__row {
			display: flex;
			flex-wrap: wrap;
			align-items: start;
			gap: calc(var(--default-grid-baseline) * 3);

			> * {
				flex: 1;
			}
		}
	}

	&__field {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) / 2);
	}

	&__field-label {
		font-size: calc(var(--default-font-size) * 0.9);
		color: var(--color-text-maxcontrast);
	}

	&__loading {
		display: flex;
		justify-content: center;
		padding: calc(var(--default-grid-baseline) * 4);
	}

	&__list {
		display: flex;
		flex-direction: column;
		max-height: calc(var(--default-grid-baseline) * 100);
		overflow-y: auto;
	}

	&__group {
		margin-block-start: calc(var(--default-grid-baseline) * 3);

		&-header {
			display: flex;
			align-items: center;
			gap: var(--default-grid-baseline);
			width: 100%;
			padding: calc(var(--default-grid-baseline) * 1.5) var(--default-grid-baseline);
			padding-inline-end: calc(var(--default-grid-baseline) * 3);
			border: none;
			background: none;
			cursor: pointer;
			font-size: var(--default-font-size);
			font-weight: 600;
			color: var(--color-text-maxcontrast);

			&:hover {
				background-color: var(--color-background-dark);
				color: var(--color-main-text);
			}
		}

		&-name {
			flex: 1;
			text-align: start;
		}

		&-count {
			flex-shrink: 0;
			white-space: nowrap;
			font-weight: normal;
			font-size: var(--font-size-small);
			color: var(--color-text-maxcontrast);
		}

		&-rooms {
			display: flex;
			flex-direction: column;
			gap: var(--default-grid-baseline);
			padding-bottom: var(--default-grid-baseline);
		}
	}

	&__empty {
		text-align: center;
		color: var(--color-text-maxcontrast);
		padding: calc(var(--default-grid-baseline) * 4);
	}

	&__footer {
		position: sticky;
		bottom: 0;
		display: flex;
		justify-content: end;
		padding-top: calc(var(--default-grid-baseline) * 2);
		border-top: 1px solid var(--color-border);
		background: var(--color-main-background);
	}
}
</style>
