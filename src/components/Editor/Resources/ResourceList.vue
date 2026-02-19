<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-picker">
		<span class="app-full-subtitle">
			<MapMarker :size="20" />
			{{ t('calendar', 'Rooms') }}
		</span>

		<!-- Search and filter -->
		<div
			v-if="!props.isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
			class="resource-picker__filters">
			<NcTextField
				v-model="filterText"
				:placeholder="t('calendar', 'Search rooms\u2026')"
				:showTrailingButton="filterText.length > 0"
				trailingButtonIcon="close"
				@trailingButtonClick="filterText = ''" />

			<div class="resource-picker__filters__row">
				<NcCheckboxRadioSwitch
					v-model="filterAvailableOnly"
					type="switch">
					{{ t('calendar', 'Available only') }}
				</NcCheckboxRadioSwitch>
				<div class="resource-picker__capacity">
					<label for="min-capacity">{{ t('calendar', 'Min.') }}</label>
					<input
						id="min-capacity"
						v-model.number="filterMinCapacity"
						type="number"
						min="0"
						:placeholder="t('calendar', 'pers.')"
						class="resource-picker__capacity-input">
				</div>
			</div>

			<!-- Dynamic building chips -->
			<div v-if="allBuildings.length > 1" class="resource-picker__chips">
				<span class="resource-picker__chips-label">
					<OfficeBuildingOutline :size="14" />
				</span>
				<button
					v-for="building in allBuildings"
					:key="'b-' + building"
					class="resource-picker__chip"
					:class="{ 'resource-picker__chip--active': activeBuildings.includes(building) }"
					@click="toggleBuilding(building)">
					{{ building }}
				</button>
			</div>

			<!-- Dynamic facility chips -->
			<div v-if="allFacilities.length > 0" class="resource-picker__chips">
				<span class="resource-picker__chips-label">
					<Wrench :size="14" />
				</span>
				<button
					v-for="facility in allFacilities"
					:key="facility.id"
					class="resource-picker__chip resource-picker__chip--facility"
					:class="{ 'resource-picker__chip--active': activeFacilities.includes(facility.id) }"
					@click="toggleFacility(facility.id)">
					{{ facility.label }}
				</button>
			</div>
		</div>

		<!-- Loading state -->
		<div v-if="isLoadingAvailability" class="resource-picker__loading">
			<NcLoadingIcon :size="32" />
		</div>

		<!-- Grouped room list -->
		<div v-else class="resource-picker__list">
			<div
				v-for="group in groupedRooms"
				:key="group.name"
				class="resource-picker__group">
				<button
					class="resource-picker__group-header"
					@click="toggleGroup(group.name)">
					<ChevronDown
						v-if="expandedGroups[group.name]"
						:size="18" />
					<ChevronRight
						v-else
						:size="18" />
					<span class="resource-picker__group-name">{{ group.name }}</span>
					<span class="resource-picker__group-count">
						{{ group.availableCount }}/{{ group.rooms.length }}
					</span>
				</button>
				<div v-if="expandedGroups[group.name]" class="resource-picker__group-rooms">
					<ResourceRoomCard
						v-for="room in group.rooms"
						:key="room.id"
						:room="room"
						:isAdded="isRoomAdded(room)"
						:isReadOnly="props.isReadOnly"
						:isViewedByOrganizer="isViewedByOrganizer"
						:hasRoomSelected="resources.length > 0"
						@addRoom="addResource"
						@removeRoom="removeRoomByPrincipal" />
				</div>
			</div>

			<p
				v-if="totalFilteredCount === 0 && allRooms.length > 0"
				class="resource-picker__empty">
				{{ t('calendar', 'No rooms found') }}
			</p>
			<p
				v-else-if="allRooms.length === 0 && !isLoadingAvailability"
				class="resource-picker__empty">
				{{ t('calendar', 'No rooms available') }}
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { loadState } from '@nextcloud/initial-state'
import { t } from '@nextcloud/l10n'
import { NcCheckboxRadioSwitch, NcLoadingIcon } from '@nextcloud/vue'
import debounce from 'debounce'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import OfficeBuildingOutline from 'vue-material-design-icons/OfficeBuildingOutline.vue'
import Wrench from 'vue-material-design-icons/Wrench.vue'
import ResourceRoomCard from './ResourceRoomCard.vue'
import { formatFacility } from '../../../models/resourceProps.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'

interface RoomPrincipal {
	id: string | null
	displayname: string | null
	emailAddress: string | null
	calendarUserType: string
	isAvailable: boolean
	roomSeatingCapacity: string | null
	roomType: string | null
	roomAddress: string | null
	roomFeatures: string | null
	roomNumber: string | null
	roomBuildingName: string | null
	roomBuildingAddress: string | null
}

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

interface AddRoomPayload {
	commonName: string | null
	email: string | null
	calendarUserType: string
	roomAddress: string | null
	language?: string | null
	timezoneId?: string | null
}

const props = defineProps<{
	isReadOnly: boolean
	calendarObjectInstance: CalendarObjectInstanceProp
}>()

const principalsStore = usePrincipalsStore()
const calendarObjectInstanceStore = useCalendarObjectInstanceStore()

const resourceBookingEnabled = loadState<boolean>('calendar', 'resource_booking_enabled', false)

// Reactive state
const allRooms = ref<RoomPrincipal[]>([])
const isLoadingAvailability = ref(false)
const filterText = ref('')
const filterAvailableOnly = ref(true)
const filterMinCapacity = ref(0)
const activeFacilities = ref<string[]>([])
const activeBuildings = ref<string[]>([])
const expandedGroups = reactive<Record<string, boolean>>({})

// Computed
const resources = computed<Attendee[]>(() => {
	return props.calendarObjectInstance.attendees.filter((attendee) => {
		return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
	})
})

const alreadyInvitedEmails = computed<string[]>(() => {
	return resources.value.map((attendee) => removeMailtoPrefix(attendee.uri))
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

const allBuildings = computed<string[]>(() => {
	const buildings = new Set<string>()
	for (const room of allRooms.value) {
		const name = room.roomBuildingName
		if (name) {
			buildings.add(name)
		}
	}
	return [...buildings].sort()
})

const allFacilities = computed(() => {
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
		// Always show rooms that are already added to the event
		if (isRoomAdded(room)) {
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
		if (activeBuildings.value.length > 0) {
			const building = room.roomBuildingName || ''
			if (!activeBuildings.value.includes(building)) {
				return false
			}
		}
		// Available filter
		if (filterAvailableOnly.value && !room.isAvailable) {
			return false
		}
		// Capacity filter
		if (filterMinCapacity.value > 0) {
			const cap = parseInt(room.roomSeatingCapacity as string) || 0
			if (cap < filterMinCapacity.value) {
				return false
			}
		}
		// Facility filters
		if (activeFacilities.value.length > 0) {
			const features = room.roomFeatures?.split(',').map((f) => f.trim()) ?? []
			for (const required of activeFacilities.value) {
				if (!features.includes(required)) {
					return false
				}
			}
		}
		return true
	})
})

const sortedRooms = computed<RoomPrincipal[]>(() => {
	return [...filteredRooms.value].sort((a, b) => {
		// Booked rooms first
		const aAdded = isRoomAdded(a) ? 0 : 1
		const bAdded = isRoomAdded(b) ? 0 : 1
		if (aAdded !== bAdded) {
			return aAdded - bAdded
		}

		// Available before unavailable
		const aAvail = a.isAvailable ? 0 : 1
		const bAvail = b.isAvailable ? 0 : 1
		if (aAvail !== bAvail) {
			return aAvail - bAvail
		}

		// Alphabetically
		return (a.displayname || '').localeCompare(b.displayname || '')
	})
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
		const aHasAdded = a.rooms.some((r) => isRoomAdded(r)) ? 0 : 1
		const bHasAdded = b.rooms.some((r) => isRoomAdded(r)) ? 0 : 1
		if (aHasAdded !== bHasAdded) {
			return aHasAdded - bHasAdded
		}
		return a.name.localeCompare(b.name)
	})
})

const totalFilteredCount = computed<number>(() => {
	return sortedRooms.value.length
})

// Methods
function isRoomAdded(room: RoomPrincipal): boolean {
	return alreadyInvitedEmails.value.includes(room.emailAddress as string)
}

function toggleBuilding(building: string): void {
	const idx = activeBuildings.value.indexOf(building)
	if (idx >= 0) {
		activeBuildings.value.splice(idx, 1)
	} else {
		activeBuildings.value.push(building)
	}
}

function toggleFacility(facilityId: string): void {
	const idx = activeFacilities.value.indexOf(facilityId)
	if (idx >= 0) {
		activeFacilities.value.splice(idx, 1)
	} else {
		activeFacilities.value.push(facilityId)
	}
}

function toggleGroup(groupName: string): void {
	expandedGroups[groupName] = !expandedGroups[groupName]
}

async function loadAvailability(): Promise<void> {
	if (allRooms.value.length === 0) {
		return
	}

	const options = allRooms.value.map((r) => ({
		email: r.emailAddress,
		isAvailable: true,
	}))

	try {
		await checkResourceAvailability(
			options,
			principalsStore.getCurrentUserPrincipalEmail,
			props.calendarObjectInstance.eventComponent.startDate,
			props.calendarObjectInstance.eventComponent.endDate,
		)

		for (let i = 0; i < allRooms.value.length; i++) {
			const opt = options.find((o) => o.email === allRooms.value[i].emailAddress)
			if (opt) {
				allRooms.value[i] = { ...allRooms.value[i], isAvailable: opt.isAvailable }
			}
		}
	} catch (error) {
		logger.error('Could not check room availability', { error })
	}
}

const debouncedLoadAvailability = debounce(loadAvailability, 500)

async function loadAllRooms(): Promise<void> {
	isLoadingAvailability.value = true

	const roomPrincipals = principalsStore.getRoomPrincipals || []
	allRooms.value = roomPrincipals.map((p: Record<string, unknown>) => ({
		...p,
		isAvailable: true,
	} as RoomPrincipal))

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

function addResource({ commonName, email, calendarUserType, language, timezoneId, roomAddress }: AddRoomPayload): void {
	calendarObjectInstanceStore.addAttendee({
		calendarObjectInstance: props.calendarObjectInstance,
		commonName,
		uri: email,
		calendarUserType: calendarUserType || 'ROOM',
		participationStatus: 'NEEDS-ACTION',
		role: 'REQ-PARTICIPANT',
		rsvp: true,
		language,
		timezoneId,
		organizer: principalsStore.getCurrentUserPrincipal,
	})
	updateLocation(roomAddress)
}

function removeResource(resource: Attendee): void {
	calendarObjectInstanceStore.removeAttendee({
		calendarObjectInstance: props.calendarObjectInstance,
		attendee: resource,
	})
}

function removeRoomByPrincipal(room: RoomPrincipal): void {
	const attendee = resources.value.find((a) => removeMailtoPrefix(a.uri) === room.emailAddress)
	if (attendee) {
		removeResource(attendee)
	}
}

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
	if (resourceBookingEnabled) {
		await loadAllRooms()
	}
})
</script>

<style lang="scss" scoped>
.resource-picker {
	display: flex;
	flex-direction: column;
	gap: calc(var(--default-grid-baseline) * 2);

	&__filters {
		display: flex;
		flex-direction: column;
		gap: calc(var(--default-grid-baseline) * 2);

		&__row {
			display: flex;
			align-items: center;
			gap: calc(var(--default-grid-baseline) * 3);
		}
	}

	&__capacity {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: calc(var(--default-font-size) * 0.9);

		label {
			white-space: nowrap;
			color: var(--color-text-maxcontrast);
		}
	}

	&__capacity-input {
		width: 64px;
		padding: 4px 6px;
		border: 2px solid var(--color-border-maxcontrast);
		border-radius: var(--border-radius);
		background: var(--color-main-background);
		color: var(--color-main-text);
		font-size: calc(var(--default-font-size) * 0.9);

		&:focus {
			border-color: var(--color-primary-element);
			outline: none;
		}
	}

	&__chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}

	&__chips-label {
		display: flex;
		align-items: center;
		color: var(--color-text-maxcontrast);
		margin-inline-end: 2px;
	}

	&__chip {
		padding: 2px 10px;
		border-radius: 12px;
		border: 1px solid var(--color-border-maxcontrast);
		background: var(--color-main-background);
		color: var(--color-text-maxcontrast);
		font-size: calc(var(--default-font-size) * 0.85);
		cursor: pointer;
		transition: all 0.15s;

		&:hover {
			border-color: var(--color-primary-element);
			color: var(--color-primary-element);
		}

		&--facility {
			border-style: dashed;
		}

		&--active {
			background: var(--color-primary-element);
			border-color: var(--color-primary-element);
			color: var(--color-primary-element-text);
			border-style: solid;

			&:hover {
				opacity: 0.85;
				color: var(--color-primary-element-text);
			}
		}
	}

	&__loading {
		display: flex;
		justify-content: center;
		padding: calc(var(--default-grid-baseline) * 4);
	}

	&__list {
		display: flex;
		flex-direction: column;
		max-height: 400px;
		overflow-y: auto;
	}

	&__group {
		&-header {
			display: flex;
			align-items: center;
			gap: 4px;
			width: 100%;
			padding: 6px 4px;
			border: none;
			background: none;
			cursor: pointer;
			font-size: calc(var(--default-font-size) * 0.9);
			font-weight: 600;
			color: var(--color-text-maxcontrast);

			&:hover {
				color: var(--color-main-text);
			}
		}

		&-name {
			flex: 1;
			text-align: start;
		}

		&-count {
			font-weight: normal;
			font-size: calc(var(--default-font-size) * 0.8);
			color: var(--color-text-maxcontrast);
		}

		&-rooms {
			display: flex;
			flex-direction: column;
			gap: calc(var(--default-grid-baseline) * 1);
			padding-inline-start: 8px;
			padding-bottom: 4px;
		}
	}

	&__empty {
		text-align: center;
		color: var(--color-text-maxcontrast);
		padding: calc(var(--default-grid-baseline) * 4);
	}
}

.app-full-subtitle {
	font-size: calc(var(--default-font-size) * 1.2);
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}
</style>
