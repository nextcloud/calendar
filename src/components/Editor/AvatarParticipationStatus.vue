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
	<div class="avatar-participation-status">
		<Avatar :disable-tooltip="true"
			:user="avatarLink"
			:is-no-user="isResource" />
		<div class="avatar-participation-status__indicator" :class="status.indicatorClass" />
		<div class="avatar-participation-status__text">
			{{ status.label }}
		</div>
	</div>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'

export default {
	name: 'AvatarParticipationStatus',
	components: {
		Avatar,
	},
	props: {
		avatarLink: {
			type: String,
			required: true,
		},
		participationStatus: {
			type: String,
			required: true,
		},
		commonName: {
			type: String,
			required: true,
		},
		isViewedByOrganizer: {
			type: Boolean,
			required: true,
		},
		isResource: {
			type: Boolean,
			required: true,
		},
		isSuggestion: {
			type: Boolean,
			default: false,
		},
		attendeeIsOrganizer: {
			type: Boolean,
			required: true,
		},
		organizerDisplayName: {
			type: String,
			required: true,
		},
	},
	computed: {
		status() {
			if (this.isSuggestion) {
				return {
					indicatorClass: ['accepted', 'icon', 'icon-checkmark-white'],
					label: t('calendar', 'Suggested'),
				}
			}

			if (this.isResource && this.participationStatus === 'ACCEPTED') {
				return {
					indicatorClass: ['accepted', 'icon', 'icon-checkmark-white'],
					label: t('calendar', 'Available'),
				}
			}
			if (this.isResource && this.participationStatus === 'DECLINED') {
				return {
					indicatorClass: ['declined', 'icon', 'icon-close-white'],
					label: t('calendar', 'Not available'),
				}
			}
			if (this.isResource) {
				return {
					indicatorClass: ['no-response', 'icon', 'icon-invitees-no-response-white'],
					label: t('calendar', 'Checking availability'),
				}
			}

			if (this.participationStatus === 'ACCEPTED' && this.isViewedByOrganizer) {
				return {
					indicatorClass: ['accepted', 'icon', 'icon-checkmark-white'],
					label: t('calendar', 'Invitation accepted'),
				}
			}
			if (this.participationStatus === 'ACCEPTED' && !this.isViewedByOrganizer) {
				return {
					indicatorClass: ['accepted', 'icon', 'icon-checkmark-white'],
					label: t('calendar', 'Accepted {organizerName}\'s invitation', {
						organizerName: this.organizerDisplayName,
					}),
				}
			}

			if (this.participationStatus === 'DECLINED' && this.isViewedByOrganizer) {
				return {
					indicatorClass: ['declined', 'icon', 'icon-close-white'],
					label: t('calendar', 'Invitation declined'),
				}
			}
			if (this.participationStatus === 'DECLINED' && !this.isViewedByOrganizer) {
				return {
					indicatorClass: ['declined', 'icon', 'icon-close-white'],
					label: t('calendar', 'Declined {organizerName}\'s invitation', {
						organizerName: this.organizerDisplayName,
					}),
				}
			}

			if (this.participationStatus === 'DELEGATED') {
				return {
					indicatorClass: [],
					label: this.$t('calendar', 'Invitation is delegated'),
				}
			}
			if (this.participationStatus === 'TENTATIVE') {
				return {
					indicatorClass: ['tentative', 'icon', 'icon-checkmark-white'],
					label: t('calendar', 'Participation marked as tentative'),
				}
			}

			if (this.isViewedByOrganizer) {
				return {
					indicatorClass: ['no-response', 'icon', 'icon-invitees-no-response-white'],
					label: t('calendar', 'Invitation sent'),
				}
			} else {
				return {
					indicatorClass: ['no-response', 'icon', 'icon-invitees-no-response-white'],
					label: t('calendar', 'Has not responded to {organizerName}\'s invitation yet', {
						organizerName: this.organizerDisplayName,
					}),
				}
			}
		},
	},
}
</script>
<style lang="scss" scoped>
::v-deep .avatar-participation-status__indicator {
	bottom: 20px;
	left: 43px;
	position: relative;
}

.avatar-participation-status__text {
	opacity: .45;
	left: 63px;
	bottom: 40px;
	white-space: nowrap;
	position: relative;
	min-width: 220px;
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
