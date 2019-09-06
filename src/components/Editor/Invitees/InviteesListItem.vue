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
			:participation-status="partStat"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName"
		/>
		<div class="displayname">
			{{ commonName }}
		</div>
		<div class="attendee-actions">
			<Actions v-if="isViewedByOrganizer">
				<ActionCheckbox :checked="rsvp" @change="toggleRSVP">{{ sendEMailLabel }}</ActionCheckbox>
				<ActionCheckbox :checked="isRequiredParticipant" @check="changeRole('REQ-PARTICIPANT')" @uncheck="uncheckRole('REQ-PARTICIPANT')">{{ requiredParticipantLabel }}</ActionCheckbox>
				<ActionCheckbox :checked="isOptionalParticipant" @check="changeRole('OPT-PARTICIPANT')" @uncheck="uncheckRole('OPT-PARTICIPANT')">{{ optionalParticipantLabel }}</ActionCheckbox>
				<ActionCheckbox :checked="isNonParticipant" @check="changeRole('NON-PARTICIPANT')" @uncheck="uncheckRole('NON-PARTICIPANT')">{{ nonParticipantLabel }}</ActionCheckbox>
				<ActionButton icon="icon-delete" @click="removeAttendee">{{ removeLabel }}</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from './AvatarParticipationStatus'
import {
	Actions,
	ActionCheckbox,
	ActionButton
} from 'nextcloud-vue'

export default {
	name: 'InviteesListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		ActionCheckbox,
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
		}
	},
	data() {
		return {
			cn: null,
			partStat: '',
			role: '',
			rsvp: false,
			uri: '',
		}
	},
	watch: {
		attendee: {
			handler(newAttendee, oldAttendee) {
				if (oldAttendee) {
					oldAttendee.unsubscribe(this.handler)
				}

				this.handler = () => this.updateValuesFromAttendee()
				newAttendee.subscribe(this.handler)
				this.handler()
			},
			immediate: true
		}
	},
	computed: {
		avatarLink() {
			// return this.$store.getters.getAvatarForContact(this.uri) || this.commonName
			return this.commonName
		},
		commonName() {
			if (this.cn) {
				return this.cn
			}

			if (this.uri && this.uri.startsWith('mailto:')) {
				return this.uri.substr(7)
			}

			return this.uri
		},
		sendEMailLabel() {
			return t('calendar', 'Send e-mail')
		},
		isRequiredParticipant() {
			return this.role === 'REQ-PARTICIPANT'
		},
		requiredParticipantLabel() {
			return t('calendar', 'Required participant')
		},
		isOptionalParticipant() {
			return this.role === 'OPT-PARTICIPANT'
		},
		optionalParticipantLabel() {
			return t('calendar', 'Optional participant')
		},
		isNonParticipant() {
			return this.role === 'NON-PARTICIPANT'
		},
		nonParticipantLabel() {
			return t('calendar', 'Non-participant')
		},
		removeLabel() {
			return t('calendar', 'Remove attendee')
		},
		isViewedByOrganizer() {
			return true
		},
	},
	methods: {
		toggleRSVP() {
			this.attendee.rsvp = !this.rsvp
			this.rsvp = !this.rsvp
		},
		changeRole(newRole) {
			this.attendee.role = newRole
			this.role = newRole
		},
		uncheckRole(oldRole) {
			this.role = ''
			this.$nextTick(() => {
				this.role = oldRole
			})
		},
		removeAttendee() {
			this.$emit('removeAttendee', this.attendee)
		},
		updateValuesFromAttendee() {
			this.cn = this.attendee.commonName
			this.partStat = this.attendee.participationStatus
			this.role = this.attendee.role
			this.rsvp = this.attendee.rsvp
			this.uri = this.attendee.email
			this.$forceUpdate()
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
