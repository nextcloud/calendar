<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div>
		<ResourceListSearch v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			:calendar-object-instance="calendarObjectInstance"
			@add-resource="addResource" />

		<ResourceListItem v-for="resource in resources"
			:key="resource.email"
			:resource="resource"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			@remove-resource="removeResource" />

		<NoAttendeesView v-if="isListEmpty && hasUserEmailAddress"
			:message="noResourcesMessage">
			<template #icon>
				<MapMarker :size="50" decorative />
			</template>
		</NoAttendeesView>
		<OrganizerNoEmailError v-if="!isReadOnly && isListEmpty && !hasUserEmailAddress" />

		<h3 v-if="suggestedRooms.length">
			{{ $t('calendar', 'Suggestions') }}
		</h3>
		<ResourceListItem v-for="room in suggestedRooms"
			:key="room.email + '-suggested'"
			:resource="room"
			:is-read-only="false"
			:organizer-display-name="organizerDisplayName"
			:is-suggestion="true"
			@add-suggestion="addResource" />
	</div>
</template>

<script>
import { advancedPrincipalPropertySearch } from '../../../services/caldavService.js'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import logger from '../../../utils/logger.js'
import NoAttendeesView from '../NoAttendeesView.vue'
import ResourceListSearch from './ResourceListSearch.vue'
import ResourceListItem from './ResourceListItem.vue'
import OrganizerNoEmailError from '../OrganizerNoEmailError.vue'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'

import MapMarker from 'vue-material-design-icons/MapMarker.vue'

export default {
	name: 'ResourceList',
	components: {
		ResourceListItem,
		NoAttendeesView,
		ResourceListSearch,
		OrganizerNoEmailError,
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
		resources() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
				return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
			})
		},
		attendees() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
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
			return this.resources.map(attendee => removeMailtoPrefix(attendee.uri))
		},
		organizerDisplayName() {
			return organizerDisplayName(this.calendarObjectInstance.organizer)
		},
		hasUserEmailAddress() {
			const emailAddress = this.$store.getters.getCurrentUserPrincipal?.emailAddress
			return !!emailAddress
		},
	},
	watch: {
		resources() {
			this.loadRoomSuggestions()
		},
	},
	async mounted() {
		await this.loadRoomSuggestions()
	},
	methods: {
		addResource({ commonName, email, calendarUserType, language, timezoneId, roomAddress }) {
			this.$store.commit('addAttendee', {
				calendarObjectInstance: this.calendarObjectInstance,
				commonName,
				uri: email,
				calendarUserType,
				participationStatus: 'NEEDS-ACTION',
				role: 'REQ-PARTICIPANT',
				rsvp: true,
				language,
				timezoneId,
				organizer: this.$store.getters.getCurrentUserPrincipal,
			})
			this.updateLocation(roomAddress)
		},
		removeResource(resource) {
			this.$store.commit('removeAttendee', {
				calendarObjectInstance: this.calendarObjectInstance,
				attendee: resource,
			})
		},
		async loadRoomSuggestions() {
			if (this.resources.length > 0) {
				this.suggestedRooms = []
				return
			}

			try {
				logger.info('fetching suggestions for ' + this.attendees.length + ' attendees')
				const query = {
					capacity: this.attendees.length,
				}
				const results = (await advancedPrincipalPropertySearch(query)).map(principal => {
					return {
						commonName: principal.displayname,
						email: principal.email,
						calendarUserType: principal.calendarUserType,
						displayName: principal.displayname ?? principal.email,
						isAvailable: true,
						roomAddress: principal.roomAddress,
						uri: principal.email,
						organizer: this.$store.getters.getCurrentUserPrincipal,
					}
				})

				await checkResourceAvailability(
					results,
					this.$store.getters.getCurrentUserPrincipalEmail,
					this.calendarObjectInstance.eventComponent.startDate,
					this.calendarObjectInstance.eventComponent.endDate,
				)
				logger.debug('availability of room suggestions fetched', { results })

				// Take the first three available options
				this.suggestedRooms = results.filter(room => room.isAvailable).slice(0, 3)
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

			this.$store.commit('changeLocation', {
				calendarObjectInstance: this.calendarObjectInstance,
				location,
			})
		},
	},
}
</script>
