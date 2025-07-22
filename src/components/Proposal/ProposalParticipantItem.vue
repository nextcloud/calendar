<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-participant__item">
		<div class="proposal-participant__avatar">
			<NcAvatar 
				:user="participantName"
				:display-name="participantName"
				:disable-tooltip="true"
				:is-no-user="!ProposalParticipantRealm.Internal" />
		</div>
		<div class="proposal-participant__name">
			{{ participantName }}
		</div>
		<div class="proposal-participant__action">
			<RequiredIcon v-if="participantAttendance"/>
			<NcActions>
				<NcActionButton :close-after-click="true"
					@click="onParticipantAttendance">
					<template #icon>
						<RequiredIcon v-if="!participantAttendance"/>
						<OptionalIcon v-else/>
					</template>
					{{ !participantAttendance ? t('calendar', 'Attendance Required') : t('calendar', 'Attendance Optional') }}
				</NcActionButton>
				<NcActionButton :close-after-click="true"
					@click="onParticipantRemove">
					<template #icon>
						<DestroyIcon />
					</template>
					{{ t('calendar', 'Delete') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script lang="ts">
/// types, enums and models
import { t } from '@nextcloud/l10n'
import type { ProposalParticipantInterface } from '@/types/proposals/proposalInterfaces'
import { ProposalParticipantAttendance, ProposalParticipantRealm } from '@/types/proposals/proposalEnums'
// components
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
// icons
import RequiredIcon from 'vue-material-design-icons/AccountStarOutline.vue'
import OptionalIcon from 'vue-material-design-icons/AccountQuestionOutline.vue'
import DestroyIcon from 'vue-material-design-icons/TrashCanOutline.vue'

export default {
	name: 'ProposalParticipantItem',
	
	data() {
		return {
			ProposalParticipantAttendance,
			ProposalParticipantRealm,
		}
	},

	components: {
		NcAvatar,
		NcActions,
		NcActionButton,
		RequiredIcon,
		OptionalIcon,
		DestroyIcon,
	},
	
	props: {
		proposalParticipant: {
			type: Object as () => ProposalParticipantInterface,
			required: true,
			default: null,
		},
	},

	emits: ['remove-participant'],
	
	computed: {
		participantName(): string {
			return this.proposalParticipant.name || this.proposalParticipant.address
		},

		participantAttendance(): boolean {
			return this.proposalParticipant.attendance === ProposalParticipantAttendance.Required
		},
	},
	
	methods: {
		t,

		onParticipantRemove() {
			this.$emit('participant-remove', this.proposalParticipant.address)
		},

		onParticipantAttendance() {
			if (this.proposalParticipant.attendance === ProposalParticipantAttendance.Required) {
				this.proposalParticipant.attendance = ProposalParticipantAttendance.Optional
			} else {
				this.proposalParticipant.attendance = ProposalParticipantAttendance.Required
			}
			//this.$emit('participant-attendance', this.proposalParticipant.attendance)
		},
	},
}
</script>

<style lang="scss" scoped>
.proposal-participant__item {
	display: flex;
	align-items: center;
	padding: var(--default-grid-baseline);
	transition: background-color 0.2s ease;

	&:hover {
		background-color: var(--color-background-hover);
	}
}

.proposal-participant__status {
	flex-shrink: 0;
}

.proposal-participant__avatar {
	flex-shrink: 0;
}

.proposal-participant__name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.proposal-participant__action {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	gap: var(--default-grid-baseline);
}
</style>
