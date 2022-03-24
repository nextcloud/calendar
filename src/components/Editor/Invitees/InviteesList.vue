<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
		<InviteesListSearch v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			@add-attendee="addAttendee" />
		<OrganizerListItem v-if="hasOrganizer"
			:is-read-only="isReadOnly"
			:organizer="calendarObjectInstance.organizer" />
		<InviteesListItem v-for="invitee in inviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			@remove-attendee="removeAttendee" />
		<NoAttendeesView v-if="isReadOnly && isListEmpty"
			:message="noInviteesMessage" />
		<NoAttendeesView v-if="!isReadOnly && isListEmpty && hasUserEmailAddress"
			:message="noInviteesMessage" />
		<OrganizerNoEmailError v-if="!isReadOnly && isListEmpty && !hasUserEmailAddress" />

		<div class="invitees-list-button-group">
			<button v-if="isCreateTalkRoomButtonVisible"
				:disabled="isCreateTalkRoomButtonDisabled"
				@click="createTalkRoom">
				{{ $t('calendar', 'Create Talk room for this event') }}
			</button>

			<button v-if="!isReadOnly" :disabled="isListEmpty" @click="openFreeBusy">
				{{ $t('calendar', 'Show busy times') }}
			</button>
			<FreeBusy v-if="showFreeBusyModel"
				:attendees="calendarObjectInstance.attendees"
				:organizer="calendarObjectInstance.organizer"
				:start-date="calendarObjectInstance.startDate"
				:end-date="calendarObjectInstance.endDate"
				@close="closeFreeBusy" />
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import InviteesListSearch from './InviteesListSearch'
import InviteesListItem from './InviteesListItem'
import OrganizerListItem from './OrganizerListItem'
import NoAttendeesView from '../NoAttendeesView'
import OrganizerNoEmailError from '../OrganizerNoEmailError.vue'
import { createTalkRoom, doesDescriptionContainTalkLink } from '../../../services/talkService.js'
import FreeBusy from '../FreeBusy/FreeBusy.vue'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee'

export default {
	name: 'InviteesList',
	components: {
		FreeBusy,
		OrganizerNoEmailError,
		NoAttendeesView,
		InviteesListItem,
		InviteesListSearch,
		OrganizerListItem,
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
			creatingTalkRoom: false,
			showFreeBusyModel: false,
		}
	},
	computed: {
		...mapState({
			talkEnabled: state => state.settings.talkEnabled,
		}),
		noInviteesMessage() {
			return this.$t('calendar', 'No attendees yet')
		},
		invitees() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
				return !['RESOURCE', 'ROOM'].includes(attendee.attendeeProperty.userType)
			})
		},
		inviteesWithoutOrganizer() {
			if (!this.calendarObjectInstance.organizer) {
				return this.invitees
			}

			return this.invitees
				.filter(attendee => attendee.uri !== this.calendarObjectInstance.organizer.uri)
		},
		hasOrganizer() {
			return this.calendarObjectInstance.organizer !== null
		},
		organizerDisplayName() {
			return organizerDisplayName(this.calendarObjectInstance.organizer)
		},
		isListEmpty() {
			return !this.calendarObjectInstance.organizer && this.invitees.length === 0
		},
		alreadyInvitedEmails() {
			const emails = this.invitees.map(attendee => removeMailtoPrefix(attendee.uri))

			const principal = this.$store.getters.getCurrentUserPrincipal
			if (principal) {
				emails.push(principal.emailAddress)
			}

			return emails
		},
		hasUserEmailAddress() {
			const principal = this.$store.getters.getCurrentUserPrincipal
			if (!principal) {
				return false
			}

			return !!principal.emailAddress
		},
		isCreateTalkRoomButtonVisible() {
			return this.talkEnabled
		},
		isCreateTalkRoomButtonDisabled() {
			if (this.creatingTalkRoom) {
				return true
			}

			if (doesDescriptionContainTalkLink(this.calendarObjectInstance.description)) {
				return true
			}

			return false
		},
	},
	methods: {
		addAttendee({ commonName, email, calendarUserType, language, timezoneId }) {
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
		removeAttendee(attendee) {
			this.$store.commit('removeAttendee', {
				calendarObjectInstance: this.calendarObjectInstance,
				attendee,
			})
		},
		openFreeBusy() {
			this.showFreeBusyModel = true
		},
		closeFreeBusy() {
			this.showFreeBusyModel = false
		},
		async createTalkRoom() {
			const NEW_LINE = '\r\n'
			try {
				this.creatingTalkRoom = true
				const url = await createTalkRoom(this.calendarObjectInstance.title)

				let newDescription
				if (!this.calendarObjectInstance.description) {
					newDescription = url + NEW_LINE
				} else {
					newDescription = this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url + NEW_LINE
				}

				this.$store.commit('changeDescription', {
					calendarObjectInstance: this.calendarObjectInstance,
					description: newDescription,
				})

				showSuccess(this.$t('calendar', 'Successfully appended link to talk room to description.'))
			} catch (error) {
				showError(this.$t('calendar', 'Error creating Talk room'))
			} finally {
				this.creatingTalkRoom = false
			}
		},
	},
}
</script>
