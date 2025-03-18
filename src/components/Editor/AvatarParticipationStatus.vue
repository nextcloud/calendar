<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="avatar-participation-status">
		<Avatar v-if="isGroup">
			<template #icon>
				<AccountMultiple :size="28" />
			</template>
		</Avatar>
		<Avatar v-else
			:disable-tooltip="true"
			:user="commonName"
			:display-name="commonName"
			:is-no-user="true" />
		<template v-if="!isGroup">
			<component :is="status.icon"
				class="avatar-participation-status__indicator"
				:fill-color="status.fillColor"
				:size="20" />
			<div class="avatar-participation-status__text">
				{{ status.text }}
			</div>
		</template>
	</div>
</template>

<script>
import { NcAvatar as Avatar } from '@nextcloud/vue'
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import IconCheck from 'vue-material-design-icons/CheckCircle.vue'
import IconNoResponse from 'vue-material-design-icons/HelpCircle.vue'
import IconClose from 'vue-material-design-icons/CloseCircle.vue'
import IconDelegated from 'vue-material-design-icons/ArrowRightDropCircle.vue'

export default {
	name: 'AvatarParticipationStatus',
	components: {
	  Avatar,
	  AccountMultiple,
	  IconCheck,
	  IconNoResponse,
	  IconClose,
	  IconDelegated,
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
		scheduleStatus: {
			type: String,
			required: false,
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
		isGroup: {
			type: Boolean,
			required: false,
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
		/**
		 * @return {icon: object, fillColor: string|undefined, text: string}
		 */
		status() {
			const acceptedIcon = {
				icon: IconCheck,
				fillColor: '#32CD32',
			}
			const declinedIcon = {
				icon: IconClose,
				fillColor: '#ff4402',
			}

			if (this.isSuggestion) {
				return {
					...acceptedIcon,
					text: t('calendar', 'Suggested'),
				}
			}

			// Try to use the participation status first
			switch (this.participationStatus) {
			case 'ACCEPTED':
				if (this.isResource) {
					return {
						...acceptedIcon,
						text: t('calendar', 'Available'),
					}
				}

				if (this.attendeeIsOrganizer) {
					return {
						...acceptedIcon,
						text: t('calendar', 'Invitation accepted'),
					}
				}

				return {
					...acceptedIcon,
					text: t('calendar', 'Accepted {organizerName}\'s invitation', {
						organizerName: this.organizerDisplayName,
					}),
				}
			case 'TENTATIVE':
				return {
					...acceptedIcon,
					text: t('calendar', 'Participation marked as tentative'),
				}
			case 'DELEGATED':
				return {
					icon: IconDelegated,
					text: t('calendar', 'Invitation is delegated'),
				}
			case 'DECLINED':
				if (this.isResource) {
					return {
						...declinedIcon,
						text: t('calendar', 'Not available'),
					}
				}

				if (this.isViewedByOrganizer) {
					return {
						...declinedIcon,
						text: t('calendar', 'Invitation declined'),
					}
				}

				return {
					...declinedIcon,
					text: t('calendar', 'Declined {organizerName}\'s invitation', {
						organizerName: this.organizerDisplayName,
					}),
				}
			}

			// Schedule status is only present on the original event of the organizer
			// TODO: Is this a bug or compliant with RFCs?
			if (this.isViewedByOrganizer) {
				// No status or status 1.0 indicate that the invitation is pending
				if (!this.scheduleStatus || this.scheduleStatus === '1.0') {
					if (this.isResource) {
						return {
							icon: IconNoResponse,
							text: t('calendar', 'Availability will be checked'),
						}
					}

					return {
						icon: IconNoResponse,
						text: t('calendar', 'Invitation will be sent'),
					}
				}

				// Status 3.7, 3.8, 5.1, 5.2 and 5.3 indicate delivery failures.
				// Could be due to insufficient permissions or some temporary failure.
				if (this.scheduleStatus[0] === '3' || this.scheduleStatus[0] === '5') {
					if (this.isResource) {
						return {
							icon: IconNoResponse,
							text: t('calendar', 'Failed to check availability'),
						}
					}

					return {
						icon: IconNoResponse,
						text: t('calendar', 'Failed to deliver invitation'),
					}
				}

				return {
					icon: IconNoResponse,
					text: t('calendar', 'Awaiting response'),
				}
			}

			if (this.isResource) {
				return {
					icon: IconNoResponse,
					text: t('calendar', 'Checking availability'),
				}
			}

			return {
				icon: IconNoResponse,
				text: t('calendar', 'Has not responded to {organizerName}\'s invitation yet', {
					organizerName: this.organizerDisplayName,
				}),
			}
		},
	},
}
</script>
<style lang="scss" scoped>
:deep(.avatar-participation-status__indicator) {
	bottom: 2px !important;
	justify-self: unset !important;
	left: 43px;
	position: relative;
	opacity: .8;
}

.avatar-participation-status__text {
	opacity: .45;
	left: 63px;
	bottom: 21px;
	white-space: nowrap;
	position: relative;
	min-width: 220px;
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
