<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="invitees-list">
		<div v-if="showHeader" class="invitees-list__header">
			<AccountMultipleIcon :size="20" />
			<b>{{ t('calendar', 'Attendees') }}</b>
			{{ statusHeader }}
		</div>

		<InviteesListSearch v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			:organizer="calendarObjectInstance.organizer"
			@add-attendee="addAttendee" />
		<OrganizerListItem v-if="hasOrganizer"
			:is-read-only="isReadOnly"
			:is-shared-with-me="isSharedWithMe"
			:organizer="calendarObjectInstance.organizer"
			:organizer-selection="organizerSelection"
			:is-viewed-by-organizer="isViewedByOrganizer"
			@change-organizer="changeOrganizer" />
		<InviteesListItem v-for="invitee in limitedInviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			:members="invitee.members"
			:is-viewed-by-organizer="isViewedByOrganizer"
			@remove-attendee="removeAttendee" />
		<div v-if="limit > 0 && inviteesWithoutOrganizer.length > limit"
			class="invitees-list__more">
			{{ n('calendar', '%n more guest', '%n more guests', inviteesWithoutOrganizer.length - limit) }}
		</div>
		<NoAttendeesView v-if="isReadOnly && !hideErrors"
			:message="noOwnerMessage" />
		<NoAttendeesView v-else-if="isReadOnly && isListEmpty && hasUserEmailAddress"
			:message="noInviteesMessage" />
		<OrganizerNoEmailError v-else-if="!isReadOnly && isListEmpty && !hasUserEmailAddress && !hideErrors" />

		<div v-if="!hideButtons" class="invitees-list-button-group">
			<NcButton v-if="!isReadOnly"
				class="invitees-list-button-group__button"
				:disabled="isListEmpty || !isOrganizer"
				@click="openFreeBusy">
				{{ $t('calendar', 'Find a time') }}
			</NcButton>
			<FreeBusy v-if="showFreeBusyModel"
				:attendees="calendarObjectInstance.attendees"
				:organizer="calendarObjectInstance.organizer"
				:start-date="calendarObjectInstance.startDate"
				:end-date="calendarObjectInstance.endDate"
				:event-title="calendarObjectInstance.title"
				:all-day="calendarObjectInstance.eventComponent.isAllDay()"
				:already-invited-emails="alreadyInvitedEmails"
				:show-done-button="true"
				@remove-attendee="removeAttendee"
				@add-attendee="addAttendee"
				@update-dates="saveNewDate"
				@close:no-attendees="closeFreeBusy(true)"
				@close="closeFreeBusy" />
		</div>
	</div>
</template>

<script>
import { NcButton } from '@nextcloud/vue'
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
	showWarning,
} from '@nextcloud/dialogs'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import AccountMultipleIcon from 'vue-material-design-icons/AccountMultiple.vue'
import usePrincipalsStore from '../../../store/principals.js'
import useCalendarsStore from '../../../store/calendars.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useSettingsStore from '../../../store/settings.js'
import { mapStores, mapState } from 'pinia'

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
		AccountMultipleIcon,
	},
	props: {
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		isSharedWithMe: {
			type: Boolean,
			required: true,
		},
		calendar: {
			type: Object,
			required: true,
		},
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		showHeader: {
			type: Boolean,
			required: true,
		},
		hideButtons: {
			type: Boolean,
			default: false,
		},
		hideErrors: {
			type: Boolean,
			default: false,
		},
		limit: {
			type: Number,
			default: 0,
		},
	},
	data() {
		return {
			creatingTalkRoom: false,
			showFreeBusyModel: false,
			recentAttendees: [],
		}
	},
	computed: {
		...mapStores(usePrincipalsStore, useCalendarsStore, useCalendarObjectInstanceStore),
		...mapState(useSettingsStore, ['talkEnabled']),
		noInviteesMessage() {
			return this.$t('calendar', 'No attendees yet')
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
		/**
		 * All invitees except the organizer.
		 *
		 * @return {object[]}
		 */
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
		/**
		 * All invitees except the organizer limited by the limit prop.
		 * If the limit prop is 0 all invitees except the organizer are returned.
		 *
		 * @return {object[]}
		 */
		limitedInviteesWithoutOrganizer() {
			const filteredInvitees = this.inviteesWithoutOrganizer

			if (this.limit) {
				const limit = this.hasOrganizer ? this.limit - 1 : this.limit
				return filteredInvitees
					// Push newly added attendees to the top of the list
					.toSorted((a, b) => this.recentAttendees.indexOf(b.uri) - this.recentAttendees.indexOf(a.uri))
					.slice(0, limit)
			}

			return filteredInvitees
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
		organizerSelection() {
			const organizers = []
			const owner = this.principalsStore.getPrincipalByUrl(this.calendar.owner)
			const principal = this.principalsStore.getCurrentUserPrincipal
			if (owner) {
				organizers.push({
					id: owner.id,
					label: owner.displayname,
					address: owner.emailAddress,
				})
			}
			if (principal && owner.id !== principal.id) {
				organizers.push({
					id: principal.id,
					label: principal.displayname,
					address: principal.emailAddress,
				})
			}
			return organizers
		},
		isListEmpty() {
			return !this.calendarObjectInstance.organizer && this.invitees.length === 0
		},
		alreadyInvitedEmails() {
			const emails = this.invitees.map(attendee => removeMailtoPrefix(attendee.uri))

			// A user should be able to invite themselves if they are not the organizer
			const principal = this.principalsStore.getCurrentUserPrincipal
			const organizerUri = this.calendarObjectInstance.organizer?.uri
			if (organizerUri) {
				emails.push(removeMailtoPrefix(organizerUri))
			} else if (principal) {
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
		isViewedByOrganizer() {
			const organizerEmail = removeMailtoPrefix(this.calendarObjectInstance.organizer.uri)
			return organizerEmail === this.principalsStore.getCurrentUserPrincipalEmail
		},
		statusHeader() {
			if (!this.isReadOnly) {
				return ''
			}

			return this.t('calendar', '{invitedCount} invited, {confirmedCount} confirmed', {
				invitedCount: this.inviteesWithoutOrganizer.length,
				confirmedCount: this.inviteesWithoutOrganizer
					.filter((attendee) => attendee.participationStatus === 'ACCEPTED')
					.length,
			})
		},
		selectedOrganizer() {
			let organizer = null
			if (this.calendarObjectInstance.organizer) {
				const user = this.calendarObjectInstance.organizer
				organizer = {
					label: user.commonName,
					address: removeMailtoPrefix(user.uri),
				}
			} else if (this.principalsStore.getCurrentUserPrincipal) {
				const user = this.principalsStore.getCurrentUserPrincipal
				organizer = {
					label: user.displayname,
					address: user.emailAddress,
				}
			}
			return organizer
		},
	},
	methods: {
		changeOrganizer({ id, address, label }, attend) {
			// retrieve current organizer
			const current = this.selectedOrganizer
			// remove new organizer from attendees
			this.calendarObjectInstance.attendees.forEach(function(attendee) {
				if (removeMailtoPrefix(attendee.uri) === address || removeMailtoPrefix(attendee.uri) === current.address) {
					this.removeAttendee(attendee)
				}
			}, this)
			// determine if current organizer needs to be converted to a attendee
			if (attend === true) {
				this.addAttendee({
					commonName: current.label,
					email: current.address,
					calendarUserType: 'INDIVIDUAL',
					language: null,
					timezoneId: null,
					member: null,
				})
			}
			// set new organizer
			this.calendarObjectInstanceStore.setOrganizer({
				calendarObjectInstance: this.calendarObjectInstance,
				commonName: label,
				email: address,
			})
			this.recentAttendees.push(address)
		},
		addAttendee({ commonName, email, calendarUserType, language, timezoneId, member }) {
			let modifiedMember = null
			if (calendarUserType === 'INDIVIDUAL' && member) {
				const modifiedMemberIndex = this.calendarObjectInstance.attendees.findIndex(function(attendee) {
					if (attendee.uri === email) {
						return true
					}
					return false
				})
				modifiedMember = this.calendarObjectInstance.attendees[modifiedMemberIndex]
			}

			if (modifiedMember) {
				const group = modifiedMember.attendeeProperty.member
				this.calendarObjectInstanceStore.removeAttendee({
					calendarObjectInstance: this.calendarObjectInstance,
					attendee: modifiedMember,
				})
				member = member.split(',')
				member.push(group)
			}

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
				member,
			})
			this.recentAttendees.push(email)
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
			this.calendarObjectInstanceStore.removeAttendee({
				calendarObjectInstance: this.calendarObjectInstance,
				attendee,
			})
			this.recentAttendees = this.recentAttendees.filter((a) => a.uri !== attendee.email)
		},
		openFreeBusy() {
			this.showFreeBusyModel = true
		},
		closeFreeBusy(showNoAttendeesToast = false) {
			if (showNoAttendeesToast) {
				showWarning(this.$t('calendar', 'Please add at least one attendee to use the "Find a time" feature.'))
			}
			this.showFreeBusyModel = false
		},
		saveNewDate(dates) {
			this.$emit('update-dates', dates)
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
					this.calendarObjectInstanceStore.changeLocation({
						calendarObjectInstance: this.calendarObjectInstance,
						location: url,
					})
					showSuccess(this.$t('calendar', 'Successfully appended link to talk room to location.'))
				} else {
					if (!this.calendarObjectInstance.description) {
						this.calendarObjectInstanceStore.changeDescription({
							calendarObjectInstance: this.calendarObjectInstance,
							description: url,
						})
					} else {
						this.calendarObjectInstanceStore.changeDescription({
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
.invitees-list {
	&__header {
		display: flex;
		gap: 5px;
		padding: 5px 5px 5px 6px;
	}

	&__more {
		padding: 15px 0 0 46px;
		font-weight: bold;
		opacity: 0.75;
	}

	.invitees-list-button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;

		&__button {
			flex: 1 0 200px;

			:deep(.button-vue__text) {
				white-space: unset !important;
				overflow: unset !important;
				text-overflow: unset !important;
			}
		}
	}
}
</style>
