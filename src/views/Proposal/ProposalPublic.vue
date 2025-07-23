<template>
	<div class="proposal-public__content">
		<NcGuestContent v-if="contentView === 'loading' || contentView === 'notfound'"
			class="proposal-public__content-empty">
			<NcEmptyContent :name="blankViewLabel" :description="blankViewDescription">
				<template #icon>
					<BallotIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'responded'" class="proposal-public__content-empty">
			<NcEmptyContent :name="t('calendar', 'Response Submitted')" :description="t('calendar', 'Thank you for your response! Your vote has been recorded.')">
				<template #icon>
					<CheckIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'loaded'" class="proposal-public__content-details">
			<!-- Row 1: Title -->
			<div class="proposal-public__row proposal-public__row-title">
				<h2>{{ storedProposal?.title || t('calendar', 'No Title') }}</h2>
			</div>
			<!-- Row 2: Details Columns -->
			<div class="proposal-public__row proposal-public__row-fields">
				<!-- Left Column: Description and Duration -->
				<div class="proposal-public__column-left">
					<div class="proposal-public__field">
						<strong>{{ t('calendar', 'Description') }}</strong>
						<div>{{ storedProposal?.description || t('calendar', 'No Description') }}</div>
					</div>
					<div class="proposal-public__field">
						<strong>{{ t('calendar', 'Location') }}</strong>
						<div>{{ storedProposal?.location || t('calendar', 'No Location') }}</div>
					</div>
					<div class="proposal-public__field">
						<strong>{{ t('calendar', 'Duration') }}</strong>
						<div>{{ storedProposal?.duration ? storedProposal.duration + ' min' : t('calendar', 'No Duration') }}</div>
					</div>
				</div>
				<!-- Right Column: Dates with action buttons -->
				<div class="proposal-public__column-right">
					<div class="proposal-public__dates-list">
						<div v-if="storedProposal?.dates.length">
							<div v-for="date in storedProposal.dates"
								:key="date.id"
								class="proposal-public__date-row">
								<span class="proposal-public__date-time">
									{{ new Date(date.date).toLocaleString() }}</span>
								<div class="proposal-public__date-actions">
									<NcCheckboxRadioSwitch type="radio"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Yes"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Yes" >
										{{ t('calendar','Yes') }}
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch type="radio"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.No"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.No" >
										{{ t('calendar','No') }}
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch type="radio"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Maybe"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Maybe" >
										{{ t('calendar','Maybe') }}
									</NcCheckboxRadioSwitch>
								</div>
							</div>
						</div>
						<div v-else class="proposal-public__no-dates">
							{{ t('calendar', 'No proposed dates') }}
						</div>
					</div>
				</div>
			</div>
			<!-- Row 3: Submit Button -->
			<div class="proposal-public__row proposal-public__row-submit">
				<NcButton type="primary" @click="onSubmit">
					{{ t('calendar', 'Submit') }}
				</NcButton>
			</div>
		</NcGuestContent>
	</div>
</template>

<script lang="ts">
// types, object and stores
import useProposalStore from '@/store/proposalStore'
import { t } from '@nextcloud/l10n'
import { ProposalResponse, ProposalResponseDate } from '@/models/proposals/proposals'
import { ProposalDateVote } from '@/types/proposals/proposalEnums'
// components
import NcGuestContent from '@nextcloud/vue/components/NcGuestContent'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
// icons
import BallotIcon from 'vue-material-design-icons/BallotOutline'
import CheckIcon from 'vue-material-design-icons/Check'

export default {
	name: 'ProposalPublic',

	components: {
		NcGuestContent,
		NcEmptyContent,
		NcButton,
		NcCheckboxRadioSwitch,
		BallotIcon,
		CheckIcon,
	},

	data() {
	   return {
		   proposalStore: useProposalStore(),
		   token: null,
		   contentView: 'loading',
		   storedProposal: null,
		   response: new ProposalResponse(),
		   ProposalDateVote,
	   }
	},

	computed: {
		blankViewLabel() {
			if (this.contentView === 'loading') {
				return t('calendar', 'Loading Meetings Proposal')
			} else {
				return t('calendar', 'No Meeting Proposal Found')
			}
		},

		blankViewDescription() {
			if (this.contentView === 'loading') {
				return t('calendar', 'Please wait while we load the meeting proposal.')
			} else {
				return t('calendar', 'The link you followed may be broken, or the meeting proposal may no longer exist.')
			}
		},
	},

	mounted() {
		const pathParts = window.location.pathname.split('/')
		this.contentView = 'loading'
		this.token = pathParts[pathParts.length - 1]
		this.proposalStore.fetchProposalByToken(this.token)
			.then((proposal) => {
				this.storedProposal = proposal
				this.response.token = this.token
				// Initialize response state for each date
				if (proposal && proposal.dates) {
					proposal.dates.forEach((date) => {
						if (date.id !== null) {
							const responseDate = new ProposalResponseDate()
							responseDate.id = date.id
							responseDate.date = new Date(date.date)
							responseDate.vote = ProposalDateVote.Maybe
							this.$set(this.response.dates, date.id, responseDate)
						}
					})
				}
				this.contentView = 'loaded'
			})
			.catch(() => {
				this.contentView = 'notfound'
			})
	},

	methods: {
		t,

		async onSubmit() {
			try {
				await this.proposalStore.storeResponse(this.response)
				this.contentView = 'responded'
			} catch (e) {
				console.error('Failed to store proposal response', e)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.proposal-public__content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  width: 100%;
}
/* Proposal Public Details View Styles */
.proposal-public__content-details {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.proposal-public__row {
  width: 100%;
  margin-bottom: 0.5rem;
}
.proposal-public__row-title h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0 auto;
  text-align: center;
}
.proposal-public__row-fields {
  display: flex;
  gap: 2rem;
  align-items: stretch;
  margin-bottom: 0;
}
.proposal-public__column-left {
  flex: 1 1 40%;
  max-width: 40%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.proposal-public__column-right {
  flex: 1 1 48%;
  max-width: 48%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}
.proposal-public__dates-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.proposal-public__date-row {
  display: flex;
  align-items: center;
  gap: 1.5em;
  margin-bottom: 0.25em;
  width: 100%;
  flex-wrap: nowrap;
  box-sizing: border-box;
  min-width: 0;
}
.proposal-public__date-time {
  white-space: nowrap;
  min-width: 0;
  flex: 0 1 auto;
  flex-shrink: 1;
}
.proposal-public__date-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
  min-width: 0;
  flex: 1 1 0;
  flex-shrink: 1;
}
.proposal-public__row-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
.proposal-public__no-dates {
  font-style: italic;
}
</style>
