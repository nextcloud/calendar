<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<span v-if="!(!resources.length && !suggestedRooms.length)" class="app-full-subtitle"> <MapMarker :size="20" /> {{ t('calendar', 'Resources') }}</span>

		<ResourceListSearch
			v-if="!isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
			:already-invited-emails="alreadyInvitedEmails"
			:calendar-object-instance="calendarObjectInstance"
			@add-resource="addResource" />

		<div class="resource-list">
			<ResourceListItem
				v-for="resource in resources"
				:key="resource.email"
				:resource="resource"
				:is-read-only="isReadOnly"
				:organizer-display-name="organizerDisplayName"
				:is-viewed-by-organizer="isViewedByOrganizer"
				@remove-resource="removeResource" />

			<ResourceListItem
				v-for="room in suggestedRooms"
				:key="room.email + '-suggested'"
				:resource="room"
				:is-read-only="false"
				:organizer-display-name="organizerDisplayName"
				:is-suggestion="true"
				:is-viewed-by-organizer="isViewedByOrganizer"
				@add-suggestion="addResource" />
		</div>
	</div>
</template>

<script>
import { loadState } from '@nextcloud/initial-state'
import { mapStores } from 'pinia'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import ResourceListItem from './ResourceListItem.vue'
import ResourceListSearch from './ResourceListSearch.vue'
import { advancedPrincipalPropertySearch } from '../../../services/caldavService.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'ResourceList',
	components: {
		ResourceListItem,
		ResourceListSearch,
		MapMarker,
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
			suggestedRooms: [],
		}
	},

	computed: {
		...mapStores(usePrincipalsStore, useCalendarObjectInstanceStore),
		resources() {
			return this.calendarObjectInstance.attendees.filter((attendee) => {
				return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
			})
		},

		attendees() {
			return this.calendarObjectInstance.attendees.filter((attendee) => {
				return !['RESOURCE', 'ROOM'].includes(attendee.attendeeProperty.userType)
			})
		},

		noResourcesMessage() {
			return this.$t('calendar', 'No rooms or resources yet')
		},

		isListEmpty() {
			return this.resources.length === 0 && this.suggestedRooms.length === 0
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
	},

	watch: {
		resources() {
			if (this.isViewedByOrganizer) {
				this.loadRoomSuggestions()
			}
		},
	},

	async mounted() {
		if (this.isViewedByOrganizer) {
			await this.loadRoomSuggestions()
		}
	},

	methods: {
		addResource({ commonName, email, calendarUserType, language, timezoneId, roomAddress }) {
			this.calendarObjectInstanceStore.addAttendee({
				calendarObjectInstance: this.calendarObjectInstance,
				commonName,
				uri: email,
				calendarUserType,
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

		async loadRoomSuggestions() {
			if (!this.resourceBookingEnabled) {
				return
			}

			if (this.resources.length > 0) {
				this.suggestedRooms = []
				return
			}

			try {
				logger.info('fetching suggestions for ' + this.attendees.length + ' attendees')
				const query = {
					capacity: this.attendees.length,
				}
				const results = (await advancedPrincipalPropertySearch(query)).map((principal) => {
					return {
						commonName: principal.displayname,
						email: principal.email,
						calendarUserType: principal.calendarUserType,
						displayName: principal.displayname ?? principal.email,
						isAvailable: true,
						roomAddress: principal.roomAddress,
						uri: principal.email,
						organizer: this.principalsStore.getCurrentUserPrincipal,
					}
				})

				await checkResourceAvailability(
					results,
					this.principalsStore.getCurrentUserPrincipalEmail,
					this.calendarObjectInstance.eventComponent.startDate,
					this.calendarObjectInstance.eventComponent.endDate,
				)
				logger.debug('availability of room suggestions fetched', { results })

				// Take the first three available options
				this.suggestedRooms = results.filter((room) => room.isAvailable).slice(0, 3)
			} catch (error) {
				logger.error('Could not find resources', { error })
				this.suggestedRooms = []
			}
		},

		/**
		 * Apply the location of the first resource to the event.
		 * Has no effect if the location is already set or there are multiple resource.
		 *
		 * @param {string} location The location to apply
		 */
		updateLocation(location) {
			if (this.calendarObjectInstance.location || this.calendarObjectInstance.eventComponent.location) {
				return
			}

			if (this.resources.length !== 1) {
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
.resource-list {
		margin-top: calc(var(--default-grid-baseline) * 4);
}

.app-full-subtitle {
	font-size: calc(var(--default-font-size) * 1.2);
	display: flex;
	gap: calc(var(--default-grid-baseline) * 4);
}
</style>
