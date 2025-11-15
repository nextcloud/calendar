<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="invitees-list-item">
		<AvatarParticipationStatus
			:attendeeIsOrganizer="true"
			:avatarLink="avatarLink"
			:isViewedByOrganizer="isViewedByOrganizer"
			:isResource="isResource"
			:commonName="commonName"
			:organizerDisplayName="commonName"
			:scheduleStatus="organizer.attendeeProperty.getParameterFirstValue('SCHEDULE-STATUS')"
			participationStatus="ACCEPTED" />

		<AttendeeDisplay
			:displayName="commonName"
			:email="organizerEmail" />

		<div class="invitees-list-item__organizer-hint">
			{{ $t('calendar', '(organizer)') }}
		</div>
		<div class="invitees-list-item__actions">
			<NcActions v-if="!isReadOnly && isSharedWithMe">
				<template v-for="person in organizerSelection">
					<NcActionButton
						v-if="!selectedOrganizer(person.address)"
						:key="person.address + '-1'"
						:closeAfterClick="true"
						@click="changeOrganizer(person, false)">
						<template #icon>
							<Crown :size="20" />
						</template>
						{{ $t('calendar', 'Make {label} the organizer', { label: person.label }) }}
					</NcActionButton>
					<NcActionButton
						v-if="!selectedOrganizer(person.address)"
						:key="person.address + '-2'"
						:closeAfterClick="true"
						@click="changeOrganizer(person, true)">
						<template #icon>
							<Crown :size="20" />
						</template>
						{{ $t('calendar', 'Make {label} the organizer and attend', { label: person.label }) }}
					</NcActionButton>
				</template>
			</NcActions>
		</div>
	</div>
</template>

<script>
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcActions from '@nextcloud/vue/components/NcActions'
import Crown from 'vue-material-design-icons/CrownOutline.vue'
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import AttendeeDisplay from './AttendeeDisplay.vue'
import { removeMailtoPrefix } from '../../../utils/attendee.js'

export default {
	name: 'OrganizerListItem',
	components: {
		AttendeeDisplay,
		AvatarParticipationStatus,
		Crown,
		NcActions,
		NcActionButton,
	},

	props: {
		organizer: {
			type: Object,
			required: true,
		},

		organizerSelection: {
			type: Array,
			required: true,
		},

		isReadOnly: {
			type: Boolean,
			required: true,
		},

		isSharedWithMe: {
			type: Boolean,
			required: true,
		},

		isViewedByOrganizer: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		/**
		 * @return {string}
		 */
		avatarLink() {
			return this.commonName
		},

		/**
		 * Common name of the attendee or the uri without the 'mailto:' prefix.
		 *
		 * @return {string}
		 */
		commonName() {
			if (this.organizer.commonName) {
				return this.organizer.commonName
			}

			if (this.organizer.uri) {
				return removeMailtoPrefix(this.organizer.uri)
			}

			return ''
		},

		/**
		 * Email address without the 'mailto:' prefix
		 *
		 * @return {string}
		 */
		organizerEmail() {
			return this.organizer.uri ? removeMailtoPrefix(this.organizer.uri) : ''
		},

		isResource() {
			// The organizer does not have a tooltip
			return false
		},
	},

	methods: {
		selectedOrganizer(address) {
			if (removeMailtoPrefix(this.organizer.uri) === address) {
				return true
			}
			return false
		},

		changeOrganizer(person, attend) {
			this.$emit('changeOrganizer', person, attend)
		},
	},
}
</script>

<style lang="scss" scoped>
.invitees-list-item__displayname {
	margin-bottom: 13px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.invitees-list-item__organizer-hint {
	margin-bottom: 14px;
}

.avatar-participation-status {
	margin-top: 10px;
}
</style>
