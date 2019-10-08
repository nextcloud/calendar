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
	<div class="invitee-row">
		<avatar-participation-status
			:attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:avatar-link="avatarLink"
			:participation-status="attendee.participationStatus"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName"
		/>
		<div class="displayname">
			{{ commonName }}
		</div>
		<div class="attendee-actions">
			<Actions v-if="isViewedByOrganizer">
				<ActionCheckbox
					:checked="attendee.rsvp"
					@change="toggleRSVP">
					{{ $t('calendar', 'Send e-mail') }}
				</ActionCheckbox>

				<ActionRadio
					:name="radioName"
					:checked="isRequiredParticipant"
					@check="changeRole('REQ-PARTICIPANT')">
					{{ $t('calendar', 'Required participant') }}
				</ActionRadio>
				<ActionRadio
					:name="radioName"
					:checked="isOptionalParticipant"
					@check="changeRole('OPT-PARTICIPANT')">
					{{ $t('calendar', 'Optional participant') }}
				</ActionRadio>
				<ActionRadio
					:name="radioName"
					:checked="isNonParticipant"
					@check="changeRole('NON-PARTICIPANT')">
					{{ $t('calendar', 'Non-participant') }}
				</ActionRadio>

				<ActionButton
					icon="icon-delete"
					@click="removeAttendee">
					{{ $t('calendar', 'Remove attendee') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from './AvatarParticipationStatus'
import {
	Actions,
	ActionCheckbox,
	ActionButton,
	ActionRadio
} from 'nextcloud-vue'

export default {
	name: 'InviteesListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		ActionCheckbox,
		ActionRadio,
		Actions
	},
	props: {
		attendee: {
			type: Object,
			required: true
		},
		organizerDisplayName: {
			type: String,
			required: true
		},
		isReadOnly: {
			type: Boolean,
			required: true
		},
	},
	computed: {
		avatarLink() {
			// return this.$store.getters.getAvatarForContact(this.uri) || this.commonName
			return this.commonName
		},
		commonName() {
			if (this.attendee.commonName) {
				return this.attendee.commonName
			}

			if (this.attendee.uri && this.attendee.uri.startsWith('mailto:')) {
				return this.attendee.uri.substr(7)
			}

			return this.attendee.uri
		},
		radioName() {
			return this._uid + '-role-radio-input-group'
		},
		isRequiredParticipant() {
			return this.attendee.role === 'REQ-PARTICIPANT'
		},
		isOptionalParticipant() {
			return this.attendee.role === 'OPT-PARTICIPANT'
		},
		isNonParticipant() {
			return this.attendee.role === 'NON-PARTICIPANT'
		},
		isViewedByOrganizer() {
			// TODO: check if also viewed by organizer
			return !this.isReadOnly
		},
	},
	methods: {
		/**
		 * Toggles the RSVP flag of the attendee
		 */
		toggleRSVP() {
			this.$store.commit('toggleAttendeeRSVP', {
				attendee: this.attendee
			})
		},
		/**
		 * Updates the role of the attendee
		 *
		 * @param {String} role The new role of the attendee
		 */
		changeRole(role) {
			this.$store.commit('changeAttendeesRole', {
				attendee: this.attendee,
				role
			})
		},
		/**
		 * Removes an attendee from the event
		 */
		removeAttendee() {
			this.$emit('removeAttendee', this.attendee)
		}
	}
}
</script>

<style scoped>
.invitee-row{
	display: flex;
	align-items: center;
}

.displayname {
	margin-left: 8px;
}

.attendee-actions {
	margin-left: auto;
}
</style>
