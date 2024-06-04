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
			participation-status="ACCEPTED" />
		<div class="invitees-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="invitees-list-item__organizer-hint">
			{{ $t('calendar', '(organizer)') }}
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import { removeMailtoPrefix } from '../../../utils/attendee.js'

export default {
	name: 'OrganizerListItem',
	components: {
		AvatarParticipationStatus,
	},
	props: {
		organizer: {
			type: Object,
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
		isViewedByOrganizer() {
			return true
		},
		isResource() {
			// The organizer does not have a tooltip
			return false
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
