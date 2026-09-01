<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-public__content">
		<NcGuestContent v-if="contentView === 'loading' || contentView === 'notfound'">
			<NcEmptyContent :name="blankViewLabel" :description="blankViewDescription">
				<template #icon>
					<ProposalIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'responded'">
			<NcEmptyContent :name="respondedViewLabel" :description="respondedViewDescription">
				<template #icon>
					<RespondedIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'loaded'">
			<div class="proposal-public__content-row-details">
				<div class="proposal-public__content-organizer">
					<NcAvatar :user="storedProposal?.uid" :displayName="storedProposal?.uname" :isNoUser="true" />
					{{ storedProposal?.uname || t('calendar', 'Unknown User') }}
				</div>
				<h1 class="proposal-public__content-title">
					{{ storedProposal?.title || t('calendar', 'No Title') }}
				</h1>
				<div class="proposal-public__content-description">
					{{ storedProposal?.description || t('calendar', 'No Description') }}
				</div>
				<div class="proposal-public__content-location">
					<LocationIcon />
					{{ storedProposal?.location || t('calendar', 'No Location') }}
				</div>
				<div class="proposal-public__content-duration">
					<div class="proposal-public__content-duration-left">
						<DurationIcon />
						{{ storedProposal?.duration ? storedProposal.duration + ' min' : t('calendar', 'No Duration') }}
					</div>
					<div class="proposal-public__content-duration-right">
						<NcTimezonePicker
							v-model="userTimezone"
							:aria-label="t('calendar', 'Select a different time zone')" />
					</div>
				</div>
				<div class="proposal-public__content-matrix">
					<ProposalResponseMatrix
						mode="participant"
						:proposal="storedProposal"
						:response="response"
						:timezoneId="userTimezone"
						@dateVote="onDateVote" />
				</div>
			</div>
			<div class="proposal-public__content-row-actions">
				<NcButton variant="primary" @click="onSubmit">
					{{ t('calendar', 'Submit') }}
				</NcButton>
			</div>
		</NcGuestContent>
	</div>
</template>

<script setup lang="ts">
import type { Proposal, ProposalDate } from '@/models/proposals/proposals'

import { t } from '@nextcloud/l10n'
import { computed, onMounted, ref } from 'vue'
import ProposalIcon from 'vue-material-design-icons/BallotOutline'
// icons
import RespondedIcon from 'vue-material-design-icons/Check'
import DurationIcon from 'vue-material-design-icons/ClockOutline'
import LocationIcon from 'vue-material-design-icons/MapMarkerOutline'
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
// components
import NcGuestContent from '@nextcloud/vue/components/NcGuestContent'
import NcTimezonePicker from '@nextcloud/vue/components/NcTimezonePicker'
import ProposalResponseMatrix from '@/components/Proposal/ProposalResponseMatrix.vue'
import { ProposalResponse, ProposalResponseDate } from '@/models/proposals/proposals'
// types, object and stores
import useProposalStore from '@/store/proposalStore'
import { ProposalDateVote } from '@/types/proposals/proposalEnums'
import logger from '@/utils/logger.js'

const proposalStore = useProposalStore()

const token = ref('')
const contentView = ref<'loading' | 'notfound' | 'responded' | 'loaded'>('loading')
const storedProposal = ref<Proposal | null>(null)
const response = ref(new ProposalResponse())
const userTimezone = ref('UTC')

const blankViewLabel = computed<string>(() => {
	if (contentView.value === 'loading') {
		return t('calendar', 'Loading meeting proposal')
	} else {
		return t('calendar', 'No meeting proposal found')
	}
})

const blankViewDescription = computed<string>(() => {
	if (contentView.value === 'loading') {
		return t('calendar', 'Please wait while we load the meeting proposal.')
	} else {
		return t('calendar', 'The link you followed may be broken, or the meeting proposal may no longer exist.')
	}
})

const respondedViewLabel = computed<string>(() => t('calendar', 'Thank you for your response!'))

const respondedViewDescription = computed<string>(() => t('calendar', 'Your vote has been recorded. Thank you for participating!'))

function onDateVote({ date, vote }: { date: ProposalDate, vote: ProposalDateVote }): void {
	if (date.id !== null && response.value.dates[date.id]) {
		response.value.dates[date.id].vote = vote
	}
}

async function onSubmit(): Promise<void> {
	try {
		await proposalStore.storeResponse(response.value)
		contentView.value = 'responded'
	} catch (e) {
		logger.error('Failed to store proposal response', { e })
	}
}

onMounted(() => {
	// determine initial timezone
	userTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

	const pathParts = window.location.pathname.split('/')
	contentView.value = 'loading'
	token.value = pathParts[pathParts.length - 1]
	proposalStore.fetchProposalByToken(token.value)
		.then((proposal) => {
			storedProposal.value = proposal
			response.value.token = token.value
			// Initialize response state for each date
			if (proposal && proposal.dates) {
				proposal.dates.forEach((date) => {
					if (date.id !== null) {
						const responseDate = new ProposalResponseDate()
						responseDate.id = date.id
						responseDate.date = new Date(date.date ?? 0)
						responseDate.vote = ProposalDateVote.Maybe
						response.value.dates[date.id] = responseDate
					}
				})
			}
			contentView.value = 'loaded'
		})
		.catch(() => {
			contentView.value = 'notfound'
		})
})
</script>

<style lang="scss" scoped>

.proposal-public__content {
  display: flex;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.proposal-public__content-row-details {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: calc(var(--default-grid-baseline) * 2);
  padding-top: calc(var(--default-grid-baseline) * 4);
  padding-bottom: calc(var(--default-grid-baseline) * 4);
  padding-inline: calc(var(--default-grid-baseline) * 4);
}

.proposal-public__content-row-actions {
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
  justify-content: flex-end;
  width: 100%;
  padding-top: 0;
  padding-inline: calc(var(--default-grid-baseline) * 4);
  padding-bottom: calc(var(--default-grid-baseline) * 4);
}

.proposal-public__content-organizer {
  display: flex;
  align-items: center;
}

.proposal-public__content-title {
  font-size: calc(var(--default-grid-baseline) * 6);
  font-weight: bold;
  overflow-wrap: break-word;
  hyphens: auto;
}

.proposal-public__content-location {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.proposal-public__content-duration {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
}

.proposal-public__content-duration-left {
	display: flex;
	align-items: center;
}

.proposal-public__content-duration-right {
	margin-inline-start: auto;
}

.proposal-public__content-timezone {
  display: flex;
  flex-direction: column;
  gap: calc(var(--default-grid-baseline) * 1);
}

.proposal-public__content-matrix {
	padding-top: calc(var(--default-grid-baseline) * 4);
	padding-bottom: calc(var(--default-grid-baseline) * 2);
	border-top: 2px solid var(--color-border);
	border-bottom: 2px solid var(--color-border);
}

.proposal-public__content-date-empty {
  font-style: italic;
  color: var(--color-text-lighter);
}
</style>
