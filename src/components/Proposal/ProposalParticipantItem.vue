<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-participant__item">
		<div class="proposal-participant__status">
			<IconCheck v-if="participantStatus === ProposalParticipantStatus.Responded"
				:title="t('calendar', 'Participant has responded')" />
			<IconNoResponse v-else-if="participantStatus === ProposalParticipantStatus.Pending"
				:title="t('calendar', 'Participant response pending')" />
		</div>
		<div class="proposal-participant__avatar">
			<NcAvatar 
				:user="participantName"
				:display-name="participantName"
				:disable-tooltip="true"
				:is-no-user="ProposalParticipantRealm.External" />
		</div>
		<div class="proposal-participant__name">
			{{ participantName }}
		</div>
		<div class="proposal-participant__action">
			<CloseIcon 
				:title="t('calendar', 'Remove participant')"
				@click="$emit('remove-participant')" />
		</div>
	</div>
</template>

<script lang="ts">
/// types, enums and models
import { t } from '@nextcloud/l10n'
import type { ProposalParticipantInterface } from '@/types/proposals/proposalInterfaces'
import { ProposalParticipantRealm, ProposalParticipantStatus } from '@/types/proposals/proposalEnums'
// components
import NcAvatar from '@nextcloud/vue/dist/Components/NcAvatar.js'
// icons
import IconCheck from 'vue-material-design-icons/Check.vue'
import IconNoResponse from 'vue-material-design-icons/Help.vue'
import CloseIcon from 'vue-material-design-icons/Close.vue'

export default {
	name: 'ProposalParticipantItem',
	
	data() {
		return {
			ProposalParticipantRealm,
			ProposalParticipantStatus,
		}
	},

	components: {
		NcAvatar,
		IconCheck,
		IconNoResponse,
		CloseIcon,
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
		participantStatus(): ProposalParticipantStatus {
			return this.proposalParticipant.status || ProposalParticipantStatus.Pending
		},
	},
	
	methods: {
		t,		
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
	
	&:hover {
		color: var(--color-error);
	}
}
</style>
