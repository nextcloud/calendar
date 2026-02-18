<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="invitees-list-item">
		<AvatarParticipationStatus
			:attendeeIsOrganizer="false"
			:isViewedByOrganizer="isViewedByOrganizer"
			:isResource="false"
			:avatarLink="avatarLink"
			:participationStatus="attendee.participationStatus"
			:scheduleStatus="attendee.attendeeProperty.getParameterFirstValue('SCHEDULE-STATUS')"
			:organizerDisplayName="organizerDisplayName"
			:commonName="commonName"
			:timezone="timezone"
			:isGroup="isGroup" />

		<AttendeeDisplay
			:displayName="commonName"
			:email="attendeeEmail"
			:hasMembers="!!members.length">
			<template #displayname>
				{{ commonName }}
				<span
					v-if="members.length"
					class="invitees-list-item__member-count">
					({{ $n('calendar', '%n member', '%n members', members.length) }})
				</span>
			</template>
		</AttendeeDisplay>

		<div class="invitees-list-item__actions">
			<NcButton
				v-if="members.length"
				class="icon-collapse"
				:class="{ 'icon-collapse--open': memberListExpaneded }"
				variant="tertiary"
				@click="toggleMemberList">
				<template #icon>
					<ChevronUp
						v-if="memberListExpaneded"
						:size="20" />
					<ChevronDown
						v-else
						:size="20" />
				</template>
			</NcButton>
			<Actions v-if="!isReadOnly && isViewedByOrganizer">
				<ActionCheckbox
					v-if="!members.length"
					:modelValue="attendee.rsvp"
					@update:modelValue="toggleRSVP">
					{{ $t('calendar', 'Request reply') }}
				</ActionCheckbox>

				<ActionRadio
					v-if="!members.length"
					:name="radioName"
					value="CHAIR"
					:modelValue="attendee.role"
					@update:modelValue="changeRole">
					{{ $t('calendar', 'Chairperson') }}
				</ActionRadio>
				<ActionRadio
					v-if="!members.length"
					:name="radioName"
					value="REQ-PARTICIPANT"
					:modelValue="attendee.role"
					@update:modelValue="changeRole">
					{{ $t('calendar', 'Required participant') }}
				</ActionRadio>
				<ActionRadio
					v-if="!members.length"
					:name="radioName"
					value="OPT-PARTICIPANT"
					:modelValue="attendee.role"
					@update:modelValue="changeRole">
					{{ $t('calendar', 'Optional participant') }}
				</ActionRadio>
				<ActionRadio
					v-if="!members.length"
					:name="radioName"
					value="NON-PARTICIPANT"
					:modelValue="attendee.role"
					@update:modelValue="changeRole">
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
		<div
			v-if="members.length"
			class="member-list"
			:class="{ 'member-list--open': memberListExpaneded }">
			<InviteesListItem
				v-for="member in members"
				:key="member.email"
				:attendee="member"
				:isReadOnly="isReadOnly"
				:organizerDisplayName="organizerDisplayName"
				:members="member.members"
				@removeAttendee="removeAttendee(member)" />
		</div>
	</div>
</template>

<script>
import {
	NcActionButton as ActionButton,
	NcActionCheckbox as ActionCheckbox,
	NcActionRadio as ActionRadio,
	NcActions as Actions,
	NcButton,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import ChevronDown from 'vue-material-design-icons/ChevronDown.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import AttendeeDisplay from './AttendeeDisplay.vue'
import { getAttendeeDetails } from '../../../services/attendeeDetails.js'
import useCalendarObjectInstanceStore from '../../../store/calendarObjectInstance.js'
import { removeMailtoPrefix } from '../../../utils/attendee.js'

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
		AttendeeDisplay,
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
			timezone: null,
		}
	},

	computed: {
		...mapStores(useCalendarObjectInstanceStore),
		...mapState(useCalendarObjectInstanceStore, ['calendarObjectInstance']),
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

		/**
		 * Email address without the 'mailto:' prefix
		 *
		 * @return {string}
		 */
		attendeeEmail() {
			return this.attendee.uri ? removeMailtoPrefix(this.attendee.uri) : ''
		},

		radioName() {
			return this.$.uid + '-role-radio-input-group'
		},

		isGroup() {
			return this.attendee.attendeeProperty.userType === 'GROUP'
		},
	},

	watch: {
		'calendarObjectInstance.isAllDay': function(newVal) {
			if (!newVal) {
				getAttendeeDetails(this.attendee.uri).then((res) => {
					this.timezone = res?.timezone
				})
			} else {
				this.timezone = null
			}
		},
	},

	mounted() {
		if (!this.calendarObjectInstance.isAllDay) {
			getAttendeeDetails(this.attendee.uri).then((res) => {
				this.timezone = res?.timezone
			})
		}
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
			this.$emit('removeAttendee', attendee)
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
