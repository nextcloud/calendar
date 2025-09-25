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
				:is-no-user="true" />
		</div>
		<div class="proposal-participant__name">
			{{ participantName }}
		</div>
		<div class="proposal-participant__action">
			<OptionalIcon v-if="!participantAttendance" />
			<NcActions>
				<NcActionButton
					:close-after-click="true"
					@click="onParticipantAttendance">
					<template #icon>
						<RequiredIcon v-if="!participantAttendance" />
						<OptionalIcon v-else />
					</template>
					{{ !participantAttendance ? t('calendar', 'Attendance required') : t('calendar', 'Attendance optional') }}
				</NcActionButton>
				<NcActionButton
					:close-after-click="true"
					@click="onParticipantRemove">
					<template #icon>
						<DestroyIcon />
					</template>
					{{ t('calendar', 'Remove participant') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script lang="ts">
import type { ProposalParticipantInterface } from '@/types/proposals/proposalInterfaces'

// types, object and stores
import { t } from '@nextcloud/l10n'
import OptionalIcon from 'vue-material-design-icons/AccountQuestionOutline'
// icons
import RequiredIcon from 'vue-material-design-icons/AccountStarOutline'
import DestroyIcon from 'vue-material-design-icons/TrashCanOutline'
import NcActionButton from '@nextcloud/vue/components/NcActionButton'
import NcActions from '@nextcloud/vue/components/NcActions'
// components
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import { ProposalParticipantAttendance, ProposalParticipantRealm } from '@/types/proposals/proposalEnums'

export default {
	name: 'ProposalParticipantItem',

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
		},
	},

	emits: ['participant-remove', 'participant-attendance'],

	data() {
		return {
			ProposalParticipantAttendance,
			ProposalParticipantRealm,
		}
	},

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
			const newAttendance = this.proposalParticipant.attendance === ProposalParticipantAttendance.Required
				? ProposalParticipantAttendance.Optional
				: ProposalParticipantAttendance.Required
			this.$emit('participant-attendance', newAttendance)
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
