<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<NcButton v-shortkey="['p']"
		:aria-label="newProposalButtonAriaLabel"
		class="button new-proposal"
		type="primary"
		@click="newProposal"
		@shortkey="newProposal">
		<template #icon>
			<Poll :size="20" />
		</template>
	</NcButton>
</template>

<script lang="ts">
import { t } from '@nextcloud/l10n'
import useProposalStore from '../../../store/proposalStore'
import Poll from 'vue-material-design-icons/Poll.vue'
import NcButton from '@nextcloud/vue/components/NcButton'

export default {
	name: 'AppNavigationHeaderNewProposal',

	components: {
		Poll,
		NcButton,
	},

	computed: {
		newProposalButtonAriaLabel(): string {
			return this.t('calendar', 'Create new event proposal')
		},
	},

	methods: {
		t,
		
		newProposal(): void {
			const proposalStore = useProposalStore()
			proposalStore.showModal()
		},
	},
}
</script>

<style lang="scss" scoped>
.button.primary.new-proposal {
	display: flex;
	align-items: center;
}
</style>
