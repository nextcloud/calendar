<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="invitees-list-item">
		<AvatarParticipationStatus :attendee-is-organizer="true"
			:avatar-link="avatarLink"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="isResource"
			:common-name="commonName"
			:organizer-display-name="commonName"
			:schedule-status="organizer.attendeeProperty.getParameterFirstValue('SCHEDULE-STATUS')"
			participation-status="ACCEPTED" />
		<div class="invitees-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="invitees-list-item__organizer-hint">
			{{ $t('calendar', '(organizer)') }}
		</div>
		<div class="invitees-list-item__actions">
			<NcActions v-if="!isReadOnly && isSharedWithMe">
				<template v-for="person in organizerSelection">
					<NcActionButton v-if="!selectedOrganizer(person.address)"
						:key="person.address + '-1'"
						:close-after-click="true"
						@click="changeOrganizer(person, false)">
						<template #icon>
							<Crown :size="20" />
						</template>
						{{ $t('calendar', 'Make {label} the organizer', {label: person.label}) }}
					</NcActionButton>
					<NcActionButton v-if="!selectedOrganizer(person.address)"
						:key="person.address + '-2'"
						:close-after-click="true"
						@click="changeOrganizer(person, true)">
						<template #icon>
							<Crown :size="20" />
						</template>
						{{ $t('calendar', 'Make {label} the organizer and attend', {label: person.label}) }}
					</NcActionButton>
				</template>
			</NcActions>
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import Crown from 'vue-material-design-icons/Crown.vue'
import { removeMailtoPrefix } from '../../../utils/attendee.js'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'

export default {
	name: 'OrganizerListItem',
	components: {
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
			this.$emit('change-organizer', person, attend)
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
