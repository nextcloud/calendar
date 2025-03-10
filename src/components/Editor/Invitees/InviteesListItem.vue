<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="invitees-list-item">
		<AvatarParticipationStatus :attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="false"
			:avatar-link="avatarLink"
			:participation-status="attendee.participationStatus"
			:schedule-status="attendee.attendeeProperty.getParameterFirstValue('SCHEDULE-STATUS')"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName"
			:is-group="isGroup" />
		<div class="invitees-list-item__displayname"
			:class="{ 'invitees-list-item__groupname':members.length }">
			{{ commonName }}
			<span v-if="members.length"
				class="invitees-list-item__member-count">
				({{ $n('calendar', '%n member', '%n members', members.length) }})
			</span>
		</div>
		<div class="invitees-list-item__actions">
			<NcButton v-if="members.length"
				class="icon-collapse"
				:class="{ 'icon-collapse--open':memberListExpaneded }"
				type="tertiary"
				@click="toggleMemberList">
				<template #icon>
					<ChevronUp v-if="memberListExpaneded"
						:size="20" />
					<ChevronDown v-else
						:size="20" />
				</template>
			</NcButton>
			<Actions v-if="!isReadOnly && isViewedByOrganizer">
				<ActionCheckbox v-if="!members.length"
					:checked="attendee.rsvp"
					@change="toggleRSVP">
					{{ $t('calendar', 'Request reply') }}
				</ActionCheckbox>

				<ActionRadio v-if="!members.length"
					:name="radioName"
					:checked="isChair"
					@change="changeRole('CHAIR')">
					{{ $t('calendar', 'Chairperson') }}
				</ActionRadio>
				<ActionRadio v-if="!members.length"
					:name="radioName"
					:checked="isRequiredParticipant"
					@change="changeRole('REQ-PARTICIPANT')">
					{{ $t('calendar', 'Required participant') }}
				</ActionRadio>
				<ActionRadio v-if="!members.length"
					:name="radioName"
					:checked="isOptionalParticipant"
					@change="changeRole('OPT-PARTICIPANT')">
					{{ $t('calendar', 'Optional participant') }}
				</ActionRadio>
				<ActionRadio v-if="!members.length"
					:name="radioName"
					:checked="isNonParticipant"
					@change="changeRole('NON-PARTICIPANT')">
					{{ $t('calendar', 'Non-participant') }}
				</ActionRadio>

				<ActionButton @click="removeAttendee(attendee)">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ removeAttendeeText }}
				</ActionButton>
			</Actions>
		</div>
		<div v-if="members.length"
			class="member-list"
			:class="{ 'member-list--open':memberListExpaneded }">
			<InviteesListItem v-for="member in members"
				:key="member.email"
				:attendee="member"
				:is-read-only="isReadOnly"
				:organizer-display-name="organizerDisplayName"
				:members="member.members"
				@remove-attendee="removeAttendee(member)" />
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
	NcActionRadio as ActionRadio,
	NcActionCheckbox as ActionCheckbox,
	NcButton,
} from '@nextcloud/vue'
import { removeMailtoPrefix } from '../../../utils/attendee.js'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import Delete from 'vue-material-design-icons/Delete.vue'

import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import { mapStores } from 'pinia'

export default {
	name: 'InviteesListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		ActionCheckbox,
		ActionRadio,
		Actions,
		Delete,
		NcButton,
		ChevronDown,
		ChevronUp,
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
		members: {
			type: Array,
			default: () => [],
			required: false,
		},
		isViewedByOrganizer: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			memberListExpaneded: false,
		}
	},
	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		/**
		 * @return {string}
		 */
		avatarLink() {
			return this.commonName
		},
		/**
		 * @return {string}
		 */
		removeAttendeeText() {
			if (this.isGroup) {
				return this.$t('calendar', 'Remove group')
			} else {
				return this.$t('calendar', 'Remove attendee')
			}
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
		isGroup() {
			return this.attendee.attendeeProperty.userType === 'GROUP'
		},
	},
	methods: {
		/**
		 * Toggles the RSVP flag of the attendee
		 */
		toggleRSVP() {
			this.calendarObjectInstanceStore.toggleAttendeeRSVP({
				attendee: this.attendee,
			})
		},
		/**
		 * Updates the role of the attendee
		 *
		 * @param {string} role The new role of the attendee
		 */
		changeRole(role) {
			this.calendarObjectInstanceStore.changeAttendeesRole({
				attendee: this.attendee,
				role,
			})
		},
		/**
		 * Removes an attendee from the event
		 *
		 * @param {object} attendee Attendee object to remove
		 */
		removeAttendee(attendee) {
			this.$emit('remove-attendee', attendee)
		},
		/**
		 * Toggle member list if attendee is a group
		 */
		toggleMemberList() {
			this.memberListExpaneded = !this.memberListExpaneded
		},
	},
}
</script>

<style lang="scss" scoped>
.invitees-list-item {
	flex-wrap: wrap;
}
.invitees-list-item__actions {
	display: flex;
}

.invitees-list-item__displayname {
	margin-bottom: 17px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.invitees-list-item__groupname {
	margin-bottom: 0px;
}

.avatar-participation-status {
	margin-top: 5px;
}

.invitees-list-item__member-count {
	color: var(--color-text-maxcontrast);
	font-weight: 300;
}

.member-list {
	height: auto;
	max-height: 0;
	flex-basis: 100%;
	overflow: hidden;
	transition: all 0.3s ease;
	padding: 0;
	opacity: 0;
}

.member-list--open {
	max-height: 1000px;
	transition: all 0.3s ease;
	padding: 0 0 10px 15px;
	opacity: 1;
}
</style>
