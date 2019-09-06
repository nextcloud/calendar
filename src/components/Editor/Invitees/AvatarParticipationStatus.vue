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
	<div v-tooltip="tooltip" class="avatar-participation-status-wrapper">
		<Avatar
			:disable-tooltip="true"
			:user="avatarLink"
		/>
		<div class="participation-status" :class="className" />
	</div>
</template>

<script>
import {
	Avatar
} from 'nextcloud-vue'

export default {
	name: 'AvatarParticipationStatus',
	components: {
		Avatar
	},
	props: {
		avatarLink: {
			type: String,
			required: true
		},
		participationStatus: {
			type: String,
			required: true
		},
		commonName: {
			type: String,
			required: true
		},
		isViewedByOrganizer: {
			type: Boolean,
			required: true
		},
		attendeeIsOrganizer: {
			type: Boolean,
			required: true
		},
		organizerDisplayName: {
			type: String,
			required: true
		}
	},
	computed: {
		tooltip() {
			if (this.isViewedByOrganizer && this.attendeeIsOrganizer) {
				return null
			}

			if (this.participationStatus === 'ACCEPTED' && this.isViewedByOrganizer) {
				return t('calendar', '{name} accepted your invitation.', {
					name: this.commonName
				})
			}
			if (this.participationStatus === 'ACCEPTED' && !this.isViewedByOrganizer) {
				return t('calendar', '{name} accepted {organizerName}\'s invitation.', {
					name: this.commonName,
					organizerName: this.organizerDisplayName
				})
			}

			if (this.participationStatus === 'DECLINED' && this.isViewedByOrganizer) {
				return t('calendar', '{name} declined your invitation.', {
					name: this.commonName
				})
			}
			if (this.participationStatus === 'DECLINED' && !this.isViewedByOrganizer) {
				return t('calendar', '{name} declined {organizerName}\'s invitation.', {
					name: this.commonName,
					organizerName: this.organizerDisplayName
				})
			}

			if (this.participationStatus === 'DELEGATED') {
				return t('calendar', '{name} has delegated their invitation.', {
					name: this.commonName
				})
			}
			if (this.participationStatus === 'TENTATIVE') {
				return t('calendar', '{name} marked their participation as tentative.', {
					name: this.commonName
				})
			}

			if (this.isViewedByOrganizer) {
				return t('calendar', '{name} did not respond to your invitation yet.', {
					name: this.commonName
				})
			} else {
				return t('calendar', '{name} did not respond to {organizerName}\'s invitation yet.', {
					name: this.commonName,
					organizerName: this.organizerDisplayName
				})
			}
		},
		className() {
			if (this.participationStatus === 'ACCEPTED') {
				return ['accepted', 'icon', 'icon-checkmark-white']
			}
			if (this.participationStatus === 'DECLINED') {
				return ['declined', 'icon', 'icon-close-white']
			}
			if (this.participationStatus === 'TENTATIVE') {
				return ['tentative', 'icon', 'icon-checkmark-white']
			}
			if (this.participationStatus === 'DELEGATED') {
				return ['delegated', 'icon', 'icon-confirm-white']
			}

			return ['no-response', 'icon', 'icon-invitees-no-response-white']
		}
	}
}
</script>

<style scoped>
.avatar-participation-status-wrapper {
	position: relative;
	height: 38px;
	width: 38px;
}

.participation-status {
	position: absolute;
	bottom: 0;
	right: 0;
	background-size: 10px;
	height: 15px;
	width: 15px;
	box-shadow: 0 0 3px grey;
	border-radius: 50%;
}

.participation-status.accepted {
	background-color: #2fb130;
}

.participation-status.declined {
	background-color: #ff0000;
}

.participation-status.tentative {
	background-color: #ffa704;
}

.participation-status.delegated,
.participation-status.no-response {
	background-color: grey;
}
</style>
