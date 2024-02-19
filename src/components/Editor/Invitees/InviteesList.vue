<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2023 Jonas Heinrich <heinrich@synyx.net>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  - @author Jonas Heinrich <heinrich@synyx.net>
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
		<InviteesListSearch v-if="!isReadOnly && !isSharedWithMe && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			:organizer="calendarObjectInstance.organizer"
			@add-attendee="addAttendee" />
		<OrganizerListItem v-if="hasOrganizer"
			:is-read-only="isReadOnly || isSharedWithMe"
			:organizer="calendarObjectInstance.organizer" />
		<InviteesListItem v-for="invitee in inviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:is-read-only="isReadOnly || isSharedWithMe"
			:organizer-display-name="organizerDisplayName"
			:members="invitee.members"
			@remove-attendee="removeAttendee" />
		<NoAttendeesView v-if="isReadOnly && isListEmpty"
			:message="noInviteesMessage" />
		<NoAttendeesView v-if="!isReadOnly && isListEmpty && hasUserEmailAddress"
			:message="noInviteesMessage" />
		<NoAttendeesView v-if="isSharedWithMe"
			:message="noOwnerMessage" />
		<OrganizerNoEmailError v-if="!isReadOnly && isListEmpty && !hasUserEmailAddress" />

		<div class="invitees-list-button-group">
			<NcButton v-if="isCreateTalkRoomButtonVisible"
				class="invitees-list-button-group__button"
				:disabled="isCreateTalkRoomButtonDisabled"
				@click="createTalkRoom">
				{{ $t('calendar', 'Create Talk room for this event') }}
			</NcButton>

			<NcButton v-if="!isReadOnly"
				class="invitees-list-button-group__button"
				:disabled="isListEmpty || !isOrganizer"
				@click="openFreeBusy">
				{{ $t('calendar', 'Show busy times') }}
			</NcButton>
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
import { NcButton } from '@nextcloud/vue'
import { mapState } from 'vuex'
import InviteesListSearch from './InviteesListSearch.vue'
import InviteesListItem from './InviteesListItem.vue'
import OrganizerListItem from './OrganizerListItem.vue'
import NoAttendeesView from '../NoAttendeesView.vue'
import OrganizerNoEmailError from '../OrganizerNoEmailError.vue'
import { createTalkRoom, doesContainTalkLink } from '../../../services/talkService.js'
import FreeBusy from '../FreeBusy/FreeBusy.vue'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import usePrincipalsStore from '../../../store/principals.js'
import { mapStores } from 'pinia'

export default {
	name: 'InviteesList',
	components: {
		NcButton,
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
		isSharedWithMe: {
			type: Boolean,
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
		...mapStores(usePrincipalsStore()),
		...mapState({
			talkEnabled: state => state.settings.talkEnabled,
		}),
		noInviteesMessage() {
			return this.$t('calendar', 'No attendees yet')
		},
		noOwnerMessage() {
			return this.$t('calendar', 'You do not own this calendar, so you cannot add attendees to this event')
		},
		invitees() {
			return this.calendarObjectInstance.attendees.filter(attendee => {
				return !['RESOURCE', 'ROOM'].includes(attendee.attendeeProperty.userType)
			})
		},
		groups() {
			return this.invitees.filter(attendee => {
				if (attendee.attendeeProperty.userType === 'GROUP') {
					attendee.members = this.invitees.filter(invitee => {
						return invitee.attendeeProperty.member
							&& invitee.attendeeProperty.member.includes(attendee.uri)
							&& attendee.attendeeProperty.userType === 'GROUP'
					})
					return attendee.members.length > 0
				}
				return false
			})
		},
		inviteesWithoutOrganizer() {

			if (!this.calendarObjectInstance.organizer) {
				return this.invitees
			}

			return this.invitees
				.filter(attendee => {
					// Filter attendees which are part of an invited group
					if (this.groups.some(function(group) {
						return attendee.attendeeProperty.member
							&& attendee.attendeeProperty.member.includes(group.uri)
							&& attendee.attendeeProperty.userType === 'INDIVIDUAL'
					})) {
						return false
					}

					// Filter empty groups
					if (attendee.attendeeProperty.userType === 'GROUP') {
						return attendee.members.length > 0
					}

					return attendee.uri !== this.calendarObjectInstance.organizer.uri
				})
		},
		isOrganizer() {
			return this.calendarObjectInstance.organizer !== null
				&& this.principalsStore.getCurrentUserPrincipal !== null
				&& removeMailtoPrefix(this.calendarObjectInstance.organizer.uri) === this.principalsStore.getCurrentUserPrincipal.emailAddress
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

			const principal = this.principalsStore.getCurrentUserPrincipal
			if (principal) {
				emails.push(principal.emailAddress)
			}

			return emails
		},
		hasUserEmailAddress() {
			const principal = this.principalsStore.getCurrentUserPrincipal
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

			if (doesContainTalkLink(this.calendarObjectInstance.location)) {
				return true
			}
			if (doesContainTalkLink(this.calendarObjectInstance.description)) {
				return true
			}

			return false
		},
	},
	methods: {
		addAttendee({ commonName, email, calendarUserType, language, timezoneId, member }) {
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
				organizer: this.principalsStore.getCurrentUserPrincipal,
				member,
			})
		},
		removeAttendee(attendee) {
			// Remove attendee from participating group
			if (attendee.member) {
				this.groups.forEach(group => {
					if (attendee.member.includes(group.uri)) {
						group.members = group.members.filter(member => {
							if (!attendee.member.includes(group.uri)) {
								return true
							}
							return false
						})
					}
				})
			}
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
				const url = await createTalkRoom(
					this.calendarObjectInstance.title,
					this.calendarObjectInstance.description,
				)

				// Store in LOCATION property if it's missing/empty. Append to description otherwise.
				if ((this.calendarObjectInstance.location ?? '').trim() === '') {
					this.$store.commit('changeLocation', {
						calendarObjectInstance: this.calendarObjectInstance,
						location: url,
					})
					showSuccess(this.$t('calendar', 'Successfully appended link to talk room to location.'))
				} else {
					if (!this.calendarObjectInstance.description) {
						this.$store.commit('changeDescription', {
							calendarObjectInstance: this.calendarObjectInstance,
							description: url,
						})
					} else {
						this.$store.commit('changeDescription', {
							calendarObjectInstance: this.calendarObjectInstance,
							description: this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url + NEW_LINE,
						})
					}
					showSuccess(this.$t('calendar', 'Successfully appended link to talk room to description.'))
				}
			} catch (error) {
				showError(this.$t('calendar', 'Error creating Talk room'))
			} finally {
				this.creatingTalkRoom = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.invitees-list-button-group {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
}

.invitees-list-button-group__button {
	flex: 1 0 200px;

	::v-deep .button-vue__text {
		white-space: unset !important;
		overflow: unset !important;
		text-overflow: unset !important;
	}
}
</style>
