<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license GNU AGPL version 3 or any later version
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
		<ResourceListSearch
			v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			:calendar-object-instance="calendarObjectInstance"
			@add-resource="addResource" />

		<ResourceListItem
			v-for="resource in resources"
			:key="resource.email"
			:resource="resource"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			@remove-resource="removeResource" />

		<NoAttendeesView
			v-if="isReadOnly && isListEmpty"
			:message="noResourcesMessage" />
		<NoAttendeesView
			v-if="!isReadOnly && isListEmpty && hasUserEmailAddress"
			:message="noResourcesMessage" />
		<OrganizerNoEmailError
			v-if="!isReadOnly && isListEmpty && !hasUserEmailAddress" />
	</div>
</template>

<script>
import NoAttendeesView from '../NoAttendeesView'
import ResourceListSearch from './ResourceListSearch'
import ResourceListItem from './ResourceListItem'
import OrganizerNoEmailError from '../OrganizerNoEmailError'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee'

export default {
	name: 'ResourceList',
	components: {
		ResourceListItem,
		NoAttendeesView,
		ResourceListSearch,
		OrganizerNoEmailError,
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
	computed: {
		resources() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
				return ['ROOM', 'RESOURCE'].includes(attendee.attendeeProperty.userType)
			})
		},
		noResourcesMessage() {
			return this.$t('calendar', 'No rooms or resources yet')
		},
		isListEmpty() {
			return this.resources.length === 0
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
	methods: {
		addResource({ commonName, email, calendarUserType, language, timezoneId }) {
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
		},
		removeResource(resource) {
			this.$store.commit('removeAttendee', {
				calendarObjectInstance: this.calendarObjectInstance,
				attendee: resource,
			})
		},
	},
}
</script>
