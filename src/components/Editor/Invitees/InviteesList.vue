<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
		<InviteesListSearch
			v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			@addAttendee="addAttendee" />
		<OrganizerListItem
			v-if="hasOrganizer"
			:is-read-only="isReadOnly"
			:organizer="calendarObjectInstance.organizer" />
		<InviteesListItem
			v-for="invitee in inviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			@removeAttendee="removeAttendee" />
		<NoInviteesView
			v-if="isReadOnly && isListEmpty" />
		<NoInviteesView
			v-if="!isReadOnly && isListEmpty && hasUserEmailAddress" />
		<OrganizerNoEmailError
			v-if="!isReadOnly && isListEmpty && !hasUserEmailAddress" />
		<button
			v-if="isCreateTalkRoomButtonVisible"
			:disabled="isCreateTalkRoomButtonDisabled"
			@click="createTalkRoom">
			{{ $t('calendar', 'Create Talk room for this event') }}
		</button>

		<button v-if="!isReadOnly" :disabled="isListEmpty" @click="openFreeBusy">
			{{ $t('calendar', 'Show busy times') }}
		</button>
		<FreeBusy
			v-if="showFreeBusyModel"
			:attendees="calendarObjectInstance.attendees"
			:organizer="calendarObjectInstance.organizer"
			:start-date="calendarObjectInstance.startDate"
			:end-date="calendarObjectInstance.endDate"
			@close="closeFreeBusy" />
	</div>
</template>

<script>
import { mapState } from 'vuex'
import InviteesListSearch from './InviteesListSearch'
import InviteesListItem from './InviteesListItem'
import OrganizerListItem from './OrganizerListItem'
import NoInviteesView from './NoInviteesView.vue'
import OrganizerNoEmailError from './OrganizerNoEmailError.vue'
import { createTalkRoom, doesDescriptionContainTalkLink } from '../../../services/talkService.js'
import FreeBusy from '../FreeBusy/FreeBusy.vue'

export default {
	name: 'InviteesList',
	components: {
		FreeBusy,
		OrganizerNoEmailError,
		NoInviteesView,
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
		inviteesWithoutOrganizer() {
			if (!this.calendarObjectInstance.organizer) {
				return this.calendarObjectInstance.attendees
			}

			return this.calendarObjectInstance.attendees
				.filter(attendee => attendee.uri !== this.calendarObjectInstance.organizer.uri)
		},
		hasOrganizer() {
			return this.calendarObjectInstance.organizer !== null
		},
		organizerDisplayName() {
			if (!this.calendarObjectInstance.organizer) {
				return ''
			}

			if (this.calendarObjectInstance.organizer.commonName) {
				return this.calendarObjectInstance.organizer.commonName
			}

			if (this.calendarObjectInstance.organizer.uri.startsWith('mailto:')) {
				return this.calendarObjectInstance.organizer.uri.substr(7)
			}

			return this.calendarObjectInstance.organizer.uri
		},
		isListEmpty() {
			return this.calendarObjectInstance.organizer === null
				&& this.calendarObjectInstance.attendees.length === 0
		},
		alreadyInvitedEmails() {
			const emails = this.calendarObjectInstance.attendees.map(attendee => {
				if (attendee.uri.startsWith('mailto:')) {
					return attendee.uri.substr(7)
				}

				return attendee.uri
			})

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
			})

			if (!this.hasOrganizer) {
				const principal = this.$store.getters.getCurrentUserPrincipal
				if (!principal) {
					return
				}

				this.$store.commit('setOrganizer', {
					calendarObjectInstance: this.calendarObjectInstance,
					commonName: principal.displayname,
					email: principal.emailAddress,
				})
			}
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
			try {
				this.creatingTalkRoom = true
				const url = await createTalkRoom(this.calendarObjectInstance.title)

				let newDescription
				if (!this.calendarObjectInstance.description) {
					newDescription = url
				} else {
					newDescription = this.calendarObjectInstance.description + '\r\n\r\n' + url
				}

				this.$store.commit('changeDescription', {
					calendarObjectInstance: this.calendarObjectInstance,
					description: newDescription,
				})

				this.$toast.success(this.$t('calendar', 'Successfully appended link to talk room to description.'))
			} catch (error) {
				this.$toast.error(this.$t('calendar', 'Error creating Talk room'))
			} finally {
				this.creatingTalkRoom = false
			}
		},
	},
}
</script>
