<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
