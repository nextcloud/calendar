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
	<div class="invitees-list-item">
		<avatar-participation-status
			:attendee-is-organizer="true"
			:avatar-link="avatarLink"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:common-name="commonName"
			:organizer-display-name="commonName"
			participation-status="ACCEPTED"
		/>
		<div class="invitees-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="invitees-list-item__organizer-hint">
			{{ $t('calendar', '(organizer)') }}
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from './AvatarParticipationStatus'

export default {
	name: 'OrganizerListItem',
	components: {
		AvatarParticipationStatus
	},
	props: {
		organizer: {
			type: Object,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true
		},
	},
	computed: {
		avatarLink() {
			// return this.$store.getters.getAvatarForContact(this.uri) || this.commonName
			return this.organizer.commonName
		},
		commonName() {
			if (this.organizer.commonName) {
				return this.organizer.commonName
			}

			if (this.organizer.uri && this.organizer.uri.startsWith('mailto:')) {
				return this.organizer.uri.substr(7)
			}

			return this.organizer.uri
		},
		isViewedByOrganizer() {
			return true
		},
	}
}
</script>
