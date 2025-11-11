<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div v-if="!(invitees.length === 0 && isReadOnly)" class="invitees-list">
		<div v-if="showHeader" class="invitees-list__header">
			<div class="invitees-list__header__title">
				<AccountMultipleIcon :size="20" />
				<span class="invitees-list__header__title__text">{{ t('calendar', 'Attendees') }}</span>
				<NcCounterBubble :count="invitees.length + 1" />
			</div>

			<div v-if="!hideButtons" class="invitees-list-button-group">
				<NcButton
					v-if="!isReadOnly"
					class="invitees-list-button-group__button"
					:disabled="isListEmpty || !isOrganizer"
					@click="openFreeBusy">
					{{ $t('calendar', 'Find a time') }}
				</NcButton>
				<FreeBusy
					v-if="showFreeBusyModel"
					:attendees="calendarObjectInstance.attendees"
					:organizer="calendarObjectInstance.organizer"
					:start-date="calendarObjectInstance.startDate"
					:end-date="calendarObjectInstance.endDate"
					:event-title="calendarObjectInstance.title"
					:already-invited-emails="alreadyInvitedEmails"
					:show-done-button="true"
					:all-day="calendarObjectInstance.eventComponent.isAllDay()"
					@remove-attendee="removeAttendee"
					@add-attendee="addAttendee"
					@update-dates="saveNewDate"
					@close="closeFreeBusy" />
			</div>
		</div>

		<div class="invitees-list__subtitle">
			{{ statusHeader }}
		</div>

		<InviteesListSearch
			v-if="!isReadOnly && hasUserEmailAddress"
			:already-invited-emails="alreadyInvitedEmails"
			:organizer="calendarObjectInstance.organizer"
			@add-attendee="addAttendee" />
		<OrganizerListItem
			v-if="hasOrganizer"
			:is-read-only="isReadOnly"
			:is-shared-with-me="isSharedWithMe"
			:organizer="calendarObjectInstance.organizer"
			:organizer-selection="organizerSelection"
			:is-viewed-by-organizer="isViewedByOrganizer"
			@change-organizer="changeOrganizer" />
		<InviteesListItem
			v-for="invitee in limitedInviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:is-read-only="isReadOnly"
			:organizer-display-name="organizerDisplayName"
			:members="invitee.members"
			:is-viewed-by-organizer="isViewedByOrganizer"
			@remove-attendee="removeAttendee" />
		<div
			v-if="limit > 0 && invitees.length > (limit - 1)"
			class="invitees-list__more">
			{{ n('calendar', '%n more attendee', '%n more attendees', invitees.length + 1 - limit) }}
		</div>
		<OrganizerNoEmailError v-else-if="!isReadOnly && isListEmpty && !hasUserEmailAddress && !hideErrors" />
	</div>
</template>

<script>
import {
	showError,
	showSuccess,
	showWarning,
} from '@nextcloud/dialogs'
import { NcButton, NcCounterBubble } from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import AccountMultipleIcon from 'vue-material-design-icons/AccountMultipleOutline.vue'
import FreeBusy from '../FreeBusy/FreeBusy.vue'
import OrganizerNoEmailError from '../OrganizerNoEmailError.vue'
import InviteesListItem from './InviteesListItem.vue'
import InviteesListSearch from './InviteesListSearch.vue'
import OrganizerListItem from './OrganizerListItem.vue'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import useCalendarsStore from '../../../store/calendars.js'
import usePrincipalsStore from '../../../store/principals.js'
import useSettingsStore from '../../../store/settings.js'
import { organizerDisplayName, removeMailtoPrefix } from '../../../utils/attendee.js'
import { containsRoomUrl } from '@/services/talkService'

export default {
	name: 'InviteesList',
	components: {
		NcButton,
		FreeBusy,
		OrganizerNoEmailError,
		InviteesListItem,
		InviteesListSearch,
		OrganizerListItem,
		AccountMultipleIcon,
		NcCounterBubble,
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
			return this.calendarObjectInstance.attendees.filter((attendee) => {
				return !['RESOURCE', 'ROOM'].includes(attendee.attendeeProperty.userType)
			})
		},

		groups() {
			return this.invitees.filter((attendee) => {
				if (attendee.attendeeProperty.userType === 'GROUP') {
					attendee.members = this.invitees.filter((invitee) => {
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
				.filter((attendee) => {
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
			const emails = this.invitees.map((attendee) => removeMailtoPrefix(attendee.uri))

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

			return containsRoomUrl(this.calendarObjectInstance.location) || containsRoomUrl(this.calendarObjectInstance.description)
		},

		isViewedByOrganizer() {
			const organizerEmail = removeMailtoPrefix(this.calendarObjectInstance.organizer.uri)
			return organizerEmail === this.principalsStore.getCurrentUserPrincipalEmail
		},

		statusHeader() {
			if (!this.isReadOnly) {
				return ''
			}

			return this.t('calendar', '{confirmedCount} confirmed, {waitingCount} awaiting response', {
				confirmedCount: this.invitees
					.filter((attendee) => attendee.participationStatus === 'ACCEPTED')
					.length + 1, // +1 for organizer
				waitingCount: this.invitees
					.filter((attendee) => attendee.participationStatus === 'NEEDS-ACTION').length,
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
		changeOrganizer({ address, label }, attend) {
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
				this.groups.forEach((group) => {
					if (attendee.member.includes(group.uri)) {
						// Keep all members except the one being removed
						group.members = group.members.filter((m) => m.uri !== attendee.uri)
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
	},
}
</script>

<style lang="scss" scoped>
.invitees-list {
	&__header {
		display: flex;
		gap: calc(var(--default-grid-baseline) * 6);
		align-items: center;

		&__title {
			display: flex;
			gap: calc(var(--default-grid-baseline) * 2);
			font-size: calc(var(--default-font-size) * 1.2);
			align-items: center;
			font-weight: bold;

			div {
				box-sizing: border-box;
			}

			&__text {
				margin-inline-start: calc(var(--default-grid-baseline) * 4);
			}
		}
	}

	&__subtitle {
		color: var(--color-text-maxcontrast);
		margin-inline-start: calc(var(--default-grid-baseline) * 11);
	}

	&__more {
		padding: calc(var(--default-grid-baseline) * 4) 0 0 calc(var(--default-grid-baseline) * 11);
		opacity: 0.75;
	}

	.invitees-list-button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;

		&__button {
			flex: 1 0 100px;

			:deep(.button-vue__text) {
				white-space: unset !important;
				overflow: unset !important;
				text-overflow: unset !important;
			}
		}
	}
}
</style>
