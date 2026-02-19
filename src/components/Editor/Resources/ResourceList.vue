<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-picker">
		<span class="app-full-subtitle">
			<MapMarker :size="20" />
			{{ $t('calendar', 'Rooms') }}
		</span>

		<!-- Search and filter -->
		<div
			v-if="!isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
			class="resource-picker__filters">
			<NcTextField
				:value="filterText"
				:placeholder="$t('calendar', 'Search rooms...')"
				:show-trailing-button="filterText.length > 0"
				trailing-button-icon="close"
				@update:value="filterText = $event"
				@trailing-button-click="filterText = ''" />

			<div class="resource-picker__filters__row">
				<NcCheckboxRadioSwitch
					v-model="filterAvailableOnly"
					type="switch">
					{{ $t('calendar', 'Available only') }}
				</NcCheckboxRadioSwitch>
				<div class="resource-picker__capacity">
					<label for="min-capacity">{{ $t('calendar', 'Min.') }}</label>
					<input
						id="min-capacity"
						v-model.number="filterMinCapacity"
						type="number"
						min="0"
						:placeholder="$t('calendar', 'pers.')"
						class="resource-picker__capacity-input" />
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
						:is-added="isRoomAdded(room)"
						:is-read-only="isReadOnly"
						:is-viewed-by-organizer="isViewedByOrganizer"
						:has-room-selected="resources.length > 0"
						@add-room="addResource"
						@remove-room="removeRoomByPrincipal" />
				</div>
			</div>

			<p
				v-if="totalFilteredCount === 0 && allRooms.length > 0"
				class="resource-picker__empty">
				{{ $t('calendar', 'No rooms found') }}
			</p>
			<p
				v-else-if="allRooms.length === 0 && !isLoadingAvailability"
				class="resource-picker__empty">
				{{ $t('calendar', 'No rooms available') }}
			</p>
		</div>
	</div>
</template>

<script>
import { loadState } from '@nextcloud/initial-state'
import { NcCheckboxRadioSwitch, NcLoadingIcon } from '@nextcloud/vue'
import NcTextField from '@nextcloud/vue/components/NcTextField'
import debounce from 'debounce'
import { mapStores } from 'pinia'
import Vue from 'vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import OfficeBuildingOutline from 'vue-material-design-icons/OfficeBuildingOutline.vue'
import Wrench from 'vue-material-design-icons/Wrench.vue'
import ResourceRoomCard from './ResourceRoomCard.vue'
import { formatFacility } from '../../../models/resourceProps.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'ResourceList',
	components: {
		MapMarker,
		ChevronDown,
		ChevronRight,
		OfficeBuildingOutline,
		Wrench,
		NcCheckboxRadioSwitch,
		NcLoadingIcon,
		NcTextField,
		ResourceRoomCard,
	},

	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			allRooms: [],
			isLoadingAvailability: false,
			filterText: '',
			filterAvailableOnly: true,
			filterMinCapacity: 0,
			activeFacilities: [],
			activeBuildings: [],
			expandedGroups: {},
		}
	},

	computed: {
		...mapStores(usePrincipalsStore, useCalendarObjectInstanceStore),

		resources() {
			return this.calendarObjectInstance.attendees.filter((attendee) => {
				return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
			})
		},

		alreadyInvitedEmails() {
			return this.resources.map((attendee) => removeMailtoPrefix(attendee.uri))
		},

		organizerDisplayName() {
			return organizerDisplayName(this.calendarObjectInstance.organizer)
		},

		hasUserEmailAddress() {
			const emailAddress = this.principalsStore.getCurrentUserPrincipal?.emailAddress
			return !!emailAddress
		},

		isViewedByOrganizer() {
			if (!this.calendarObjectInstance.organizer) {
				return true
			}
			const organizerEmail = removeMailtoPrefix(this.calendarObjectInstance.organizer.uri)
			return organizerEmail === this.principalsStore.getCurrentUserPrincipalEmail
		},

		resourceBookingEnabled() {
			return loadState('calendar', 'resource_booking_enabled')
		},

		allBuildings() {
			const buildings = new Set()
			for (const room of this.allRooms) {
				const name = room.roomBuildingName
				if (name) buildings.add(name)
			}
			return [...buildings].sort()
		},

		allFacilities() {
			const facilitySet = new Set()
			for (const room of this.allRooms) {
				const features = room.roomFeatures?.split(',') ?? []
				for (const f of features) {
					const trimmed = f.trim()
					if (trimmed) facilitySet.add(trimmed)
				}
			}
			return [...facilitySet].sort().map((id) => ({
				id,
				label: formatFacility(id),
			}))
		},

		filteredRooms() {
			return this.allRooms.filter((room) => {
				// Always show rooms that are already added to the event
				if (this.isRoomAdded(room)) {
					return true
				}
				// Text filter
				if (this.filterText) {
					const q = this.filterText.toLowerCase()
					if (!room.displayname?.toLowerCase().includes(q)
						&& !room.roomAddress?.toLowerCase().includes(q)
						&& !room.roomBuildingAddress?.toLowerCase().includes(q)
						&& !room.roomBuildingName?.toLowerCase().includes(q)
						&& !room.roomNumber?.toLowerCase().includes(q)) {
						return false
					}
				}
				// Building filter
				if (this.activeBuildings.length > 0) {
					const building = room.roomBuildingName || ''
					if (!this.activeBuildings.includes(building)) {
						return false
					}
				}
				// Available filter
				if (this.filterAvailableOnly && !room.isAvailable) {
					return false
				}
				// Capacity filter
				if (this.filterMinCapacity > 0) {
					const cap = parseInt(room.roomSeatingCapacity) || 0
					if (cap < this.filterMinCapacity) {
						return false
					}
				}
				// Facility filters
				if (this.activeFacilities.length > 0) {
					const features = room.roomFeatures?.split(',').map((f) => f.trim()) ?? []
					for (const required of this.activeFacilities) {
						if (!features.includes(required)) {
							return false
						}
					}
				}
				return true
			})
		},

		sortedRooms() {
			return [...this.filteredRooms].sort((a, b) => {
				// Booked rooms first
				const aAdded = this.isRoomAdded(a) ? 0 : 1
				const bAdded = this.isRoomAdded(b) ? 0 : 1
				if (aAdded !== bAdded) return aAdded - bAdded

				// Available before unavailable
				const aAvail = a.isAvailable ? 0 : 1
				const bAvail = b.isAvailable ? 0 : 1
				if (aAvail !== bAvail) return aAvail - bAvail

				// Alphabetically
				return (a.displayname || '').localeCompare(b.displayname || '')
			})
		},

		groupedRooms() {
			const groups = {}

			for (const room of this.sortedRooms) {
				const groupName = room.roomBuildingName || this.$t('calendar', 'Other')
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
				const aHasAdded = a.rooms.some((r) => this.isRoomAdded(r)) ? 0 : 1
				const bHasAdded = b.rooms.some((r) => this.isRoomAdded(r)) ? 0 : 1
				if (aHasAdded !== bHasAdded) return aHasAdded - bHasAdded
				return a.name.localeCompare(b.name)
			})
		},

		totalFilteredCount() {
			return this.sortedRooms.length
		},
	},

	watch: {
		'calendarObjectInstance.startDate': 'debouncedLoadAvailability',
		'calendarObjectInstance.endDate': 'debouncedLoadAvailability',
	},

	created() {
		this.debouncedLoadAvailability = debounce(this.loadAvailability, 500)
	},

	async mounted() {
		if (this.resourceBookingEnabled) {
			await this.loadAllRooms()
		}
	},

	methods: {
		async loadAllRooms() {
			this.isLoadingAvailability = true

			const roomPrincipals = this.principalsStore.getRoomPrincipals || []
			this.allRooms = roomPrincipals.map((p) => ({
				...p,
				isAvailable: true,
			}))

			await this.loadAvailability()
			this.isLoadingAvailability = false

			// Initialize expanded groups after data is loaded
			this.$nextTick(() => {
				const groups = this.groupedRooms
				const expanded = {}
				if (groups.length <= 3) {
					groups.forEach((g) => { expanded[g.name] = true })
				} else if (groups.length > 0) {
					expanded[groups[0].name] = true
				}
				this.expandedGroups = expanded
			})
		},

		async loadAvailability() {
			if (this.allRooms.length === 0) {
				return
			}

			const options = this.allRooms.map((r) => ({
				email: r.emailAddress,
				isAvailable: true,
			}))

			try {
				await checkResourceAvailability(
					options,
					this.principalsStore.getCurrentUserPrincipalEmail,
					this.calendarObjectInstance.eventComponent.startDate,
					this.calendarObjectInstance.eventComponent.endDate,
				)

				for (let i = 0; i < this.allRooms.length; i++) {
					const opt = options.find((o) => o.email === this.allRooms[i].emailAddress)
					if (opt) {
						Vue.set(this.allRooms, i, {
							...this.allRooms[i],
							isAvailable: opt.isAvailable,
						})
					}
				}
			} catch (error) {
				logger.error('Could not check room availability', { error })
			}
		},

		isRoomAdded(room) {
			return this.alreadyInvitedEmails.includes(room.emailAddress)
		},

		toggleBuilding(building) {
			const idx = this.activeBuildings.indexOf(building)
			if (idx >= 0) {
				this.activeBuildings.splice(idx, 1)
			} else {
				this.activeBuildings.push(building)
			}
		},

		toggleFacility(facilityId) {
			const idx = this.activeFacilities.indexOf(facilityId)
			if (idx >= 0) {
				this.activeFacilities.splice(idx, 1)
			} else {
				this.activeFacilities.push(facilityId)
			}
		},

		toggleGroup(groupName) {
			Vue.set(this.expandedGroups, groupName, !this.expandedGroups[groupName])
		},

		addResource({ commonName, email, calendarUserType, language, timezoneId, roomAddress }) {
			this.calendarObjectInstanceStore.addAttendee({
				calendarObjectInstance: this.calendarObjectInstance,
				commonName,
				uri: email,
				calendarUserType: calendarUserType || 'ROOM',
				participationStatus: 'NEEDS-ACTION',
				role: 'REQ-PARTICIPANT',
				rsvp: true,
				language,
				timezoneId,
				organizer: this.principalsStore.getCurrentUserPrincipal,
			})
			this.updateLocation(roomAddress)
		},

		removeResource(resource) {
			this.calendarObjectInstanceStore.removeAttendee({
				calendarObjectInstance: this.calendarObjectInstance,
				attendee: resource,
			})
		},

		removeRoomByPrincipal(room) {
			const attendee = this.resources.find(
				(a) => removeMailtoPrefix(a.uri) === room.emailAddress,
			)
			if (attendee) {
				this.removeResource(attendee)
			}
		},

		updateLocation(location) {
			if (!location) {
				return
			}
			this.calendarObjectInstanceStore.changeLocation({
				calendarObjectInstance: this.calendarObjectInstance,
				location,
			})
		},
	},
}
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
		margin-right: 2px;
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
			text-align: left;
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
			padding-left: 8px;
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
