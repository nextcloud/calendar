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
	<div class="invitees-list-item">
		<AvatarParticipationStatus :attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="false"
			:avatar-link="avatarLink"
			:participation-status="attendee.participationStatus"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName" />
		<div class="invitees-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="invitees-list-item__actions">
			<Actions v-if="isViewedByOrganizer">
				<ActionCheckbox :checked="attendee.rsvp"
					@change="toggleRSVP">
					{{ $t('calendar', 'Send email') }}
				</ActionCheckbox>

				<ActionRadio :name="radioName"
					:checked="isChair"
					@change="changeRole('CHAIR')">
					{{ $t('calendar', 'Chairperson') }}
				</ActionRadio>
				<ActionRadio :name="radioName"
					:checked="isRequiredParticipant"
					@change="changeRole('REQ-PARTICIPANT')">
					{{ $t('calendar', 'Required participant') }}
				</ActionRadio>
				<ActionRadio :name="radioName"
					:checked="isOptionalParticipant"
					@change="changeRole('OPT-PARTICIPANT')">
					{{ $t('calendar', 'Optional participant') }}
				</ActionRadio>
				<ActionRadio :name="radioName"
					:checked="isNonParticipant"
					@change="changeRole('NON-PARTICIPANT')">
					{{ $t('calendar', 'Non-participant') }}
				</ActionRadio>

				<ActionButton @click="removeAttendee">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ $t('calendar', 'Remove attendee') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from '../AvatarParticipationStatus'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionRadio from '@nextcloud/vue/dist/Components/ActionRadio'
import ActionCheckbox from '@nextcloud/vue/dist/Components/ActionCheckbox'
import { removeMailtoPrefix } from '../../../utils/attendee'

import Delete from 'vue-material-design-icons/Delete.vue'

export default {
	name: 'InviteesListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		ActionCheckbox,
		ActionRadio,
		Actions,
		Delete,
	},
	props: {
		attendee: {
			type: Object,
			required: true,
		},
		organizerDisplayName: {
			type: String,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true,
		},
	},
	computed: {
		/**
		 * @return {string}
		 */
		avatarLink() {
			// return this.$store.getters.getAvatarForContact(this.uri) || this.commonName
			return this.commonName
		},
		/**
		 * Common name of the organizer or the uri without the 'mailto:' prefix.
		 *
		 * @return {string}
		 */
		commonName() {
			if (this.attendee.commonName) {
				return this.attendee.commonName
			}

			if (this.attendee.uri) {
				return removeMailtoPrefix(this.attendee.uri)
			}

			return ''
		},
		radioName() {
			return this._uid + '-role-radio-input-group'
		},
		isChair() {
			return this.attendee.role === 'CHAIR'
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
				attendee: this.attendee,
			})
		},
		/**
		 * Updates the role of the attendee
		 *
		 * @param {string} role The new role of the attendee
		 */
		changeRole(role) {
			this.$store.commit('changeAttendeesRole', {
				attendee: this.attendee,
				role,
			})
		},
		/**
		 * Removes an attendee from the event
		 */
		removeAttendee() {
			this.$emit('remove-attendee', this.attendee)
		},
	},
}
</script>

<style lang="scss" scoped>
.invitees-list-item__displayname {
	margin-bottom: 17px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.avatar-participation-status {
	margin-top: 5px;
}
</style>
