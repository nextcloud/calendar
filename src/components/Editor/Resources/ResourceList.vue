<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div>
		<span v-if="!(!resources.length && !suggestedRooms.length)" class="app-full-subtitle"> <MapMarker :size="20" /> {{ t('calendar', 'Resources') }}</span>

		<ResourceListSearch
			v-if="!isReadOnly && hasUserEmailAddress && resourceBookingEnabled"
			:alreadyInvitedEmails="alreadyInvitedEmails"
			:calendarObjectInstance="calendarObjectInstance"
			@addResource="addResource" />

		<div class="resource-list">
			<ResourceListItem
				v-for="resource in resources"
				:key="resource.email"
				:resource="resource"
				:organizerDisplayName="organizerDisplayName"
				:isViewedByOrganizer="isViewedByOrganizer"
				:availability="availabilityFor(resource)"
				@removeResource="removeResource" />

			<ResourceListItem
				v-for="room in suggestedRooms"
				:key="room.email + '-suggested'"
				:resource="room"
				:organizerDisplayName="organizerDisplayName"
				:isSuggestion="true"
				:isViewedByOrganizer="isViewedByOrganizer"
				@addSuggestion="addResource" />
		</div>
	</div>
</template>

<script>
import { loadState } from '@nextcloud/initial-state'
import debounce from 'debounce'
import { mapStores } from 'pinia'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import ResourceListItem from './ResourceListItem.vue'
import ResourceListSearch from './ResourceListSearch.vue'
import { advancedPrincipalPropertySearch } from '../../../services/caldavService.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import usePrincipalsStore from '../../../store/principals.js'
import { isPendingResourceBooking, organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
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
			// email -> 'checking' | 'available' | 'unavailable'
			resourceAvailabilities: {},
			availabilityRequestToken: 0,
			suggestionsRequestToken: 0,
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

		/**
		 * Resources whose booking outcome is still unknown. Resources that
		 * already accepted or declined have an authoritative answer from the
		 * server. An accepted resource must not be probed again because its
		 * own reservation would show up as busy (VFREEBUSY carries no UIDs).
		 */
		pendingResources() {
			return this.resources.filter((resource) => {
				const scheduleStatus = resource.attendeeProperty?.getParameterFirstValue('SCHEDULE-STATUS') ?? ''
				return isPendingResourceBooking(resource.participationStatus, scheduleStatus)
			})
		},

		/**
		 * Cheap watch source for the event time. The store replaces the
		 * startDate/endDate objects on every change.
		 */
		eventTimeRange() {
			return `${this.calendarObjectInstance.startDate?.getTime()}/${this.calendarObjectInstance.endDate?.getTime()}`
		},
	},

	watch: {
		resources() {
			if (this.isViewedByOrganizer) {
				this.loadRoomSuggestions()
				this.checkAvailabilityDebounced()
			}
		},

		eventTimeRange() {
			this.loadRoomSuggestions()
			this.checkAvailabilityDebounced()
		},
	},

	created() {
		// Created per instance, since a debounced function shared across all
		// ResourceList instances (e.g. via the methods object) would throw
		// when called with a different `this` while a previous call is still
		// pending.
		this.checkAvailabilityDebounced = debounce(this.checkPendingResourceAvailability.bind(this), 700)
	},

	async mounted() {
		if (this.isViewedByOrganizer) {
			this.checkAvailabilityDebounced()
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

		/**
		 * Get the predicted availability of a resource
		 *
		 * @param {object} resource The resource attendee object
		 * @return {?string} One of 'checking', 'available', 'unavailable' or null if unknown
		 */
		availabilityFor(resource) {
			return this.resourceAvailabilities[removeMailtoPrefix(resource.uri)] ?? null
		},

		/**
		 * Predict the booking outcome of all pending resources with a
		 * free busy request. The result is only a prediction because the
		 * authoritative check happens on the server when the event is saved.
		 * Recurring events are only probed for the edited occurrence.
		 */
		async checkPendingResourceAvailability() {
			if (this.isReadOnly || !this.isViewedByOrganizer || !this.resourceBookingEnabled) {
				return
			}

			// Invalidate results of any request still in flight
			const token = ++this.availabilityRequestToken

			const options = this.pendingResources.map((resource) => ({
				email: removeMailtoPrefix(resource.uri),
				isAvailable: true,
			}))
			if (options.length === 0) {
				this.resourceAvailabilities = {}
				return
			}

			// Kept so a failed request can restore the last known result
			// instead of dropping it in favour of an unknown state.
			const previousAvailabilities = this.resourceAvailabilities
			this.resourceAvailabilities = Object.fromEntries(options.map(({ email }) => [email, 'checking']))

			try {
				await checkResourceAvailability(
					options,
					this.principalsStore.getCurrentUserPrincipalEmail,
					this.calendarObjectInstance.eventComponent.startDate,
					this.calendarObjectInstance.eventComponent.endDate,
				)

				if (token !== this.availabilityRequestToken) {
					return
				}

				this.resourceAvailabilities = Object.fromEntries(options.map(({ email, isAvailable }) => [email, isAvailable ? 'available' : 'unavailable']))
			} catch (error) {
				if (token !== this.availabilityRequestToken) {
					return
				}

				logger.warn('Could not check resource availability', { error })
				this.resourceAvailabilities = previousAvailabilities
			}
		},

		async loadRoomSuggestions() {
			if (!this.resourceBookingEnabled) {
				return
			}

			if (this.resources.length > 0) {
				this.suggestedRooms = []
				return
			}

			// Invalidate results of any request still in flight
			const token = ++this.suggestionsRequestToken

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

				if (token !== this.suggestionsRequestToken) {
					return
				}

				// Take the first three available options
				this.suggestedRooms = results.filter((room) => room.isAvailable).slice(0, 3)
			} catch (error) {
				if (token !== this.suggestionsRequestToken) {
					return
				}

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
