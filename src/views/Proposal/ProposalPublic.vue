<template>
	<div class="proposal-public__content">
		<NcGuestContent v-if="contentView === 'loading' || contentView === 'notfound'"
			class="proposal-public__content-empty">
			<NcEmptyContent :name="blankViewLabel" :description="blankViewDescription">
				<template #icon>
					<ProposalIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'responded'" class="proposal-public__content-empty">
			<NcEmptyContent :name="respondedViewLabel" :description="respondedViewDescription">
				<template #icon>
					<RespondedIcon />
				</template>
			</NcEmptyContent>
		</NcGuestContent>
		<NcGuestContent v-else-if="contentView === 'loaded'" class="proposal-public__content-details">
			<div class="proposal-public__row-details">
				<div class="proposal-public__content-column-left">
					<div class="proposal-public__content-organizer">
						<NcAvatar :user="storedProposal?.uid" :display-name="storedProposal?.uname" />
						{{ storedProposal?.uname || t('calendar', 'Unknown User') }}
					</div>
					<h4>{{ storedProposal?.title || t('calendar', 'No Title') }}</h4>
					<div class="proposal-public__content-description">
						{{ storedProposal?.description || t('calendar', 'No Description') }}
					</div>
					<div class="proposal-public__content-location">
						<LocationIcon />
						{{ storedProposal?.location || t('calendar', 'No Location') }}
					</div>
					<div class="proposal-public__content-duration">
						<DurationIcon />
						{{ storedProposal?.duration ? storedProposal.duration + ' min' : t('calendar', 'No Duration') }}
					</div>
				</div>
				<div class="proposal-public__content-column-right">
					<h6>
						{{ t('calendar', 'Please select your meeting availability') }}
					</h6>
					<div v-if="storedProposal?.dates.length">
						<div v-for="date in storedProposal.dates"
							:key="date.id"
							class="proposal-public__content-date-list">
							<span class="proposal-public__content-date-time">
								{{ new Date(date.date).toLocaleString() }}</span>
							<div class="proposal-public__content-date-actions">
								<NcCheckboxRadioSwitch type="radio"
									:button-variant="true"
									button-variant-grouped="horizontal"
									:name="'vote-' + date.id"
									:value="ProposalDateVote.Yes"
									:modelValue="response.dates[date.id].vote"
									@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Yes" >
									<YesIcon />
									{{ t('calendar','Yes') }}
								</NcCheckboxRadioSwitch>
								<NcCheckboxRadioSwitch type="radio"
									:button-variant="true"
									button-variant-grouped="horizontal"
									:name="'vote-' + date.id"
									:value="ProposalDateVote.No"
									:modelValue="response.dates[date.id].vote"
									@update:modelValue="response.dates[date.id].vote = ProposalDateVote.No" >
									<NoIcon />
									{{ t('calendar','No') }}
								</NcCheckboxRadioSwitch>
								<NcCheckboxRadioSwitch type="radio"
									:button-variant="true"
									button-variant-grouped="horizontal"
									:name="'vote-' + date.id"
									:value="ProposalDateVote.Maybe"
									:modelValue="response.dates[date.id].vote"
									@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Maybe" >
									<MaybeIcon />
									{{ t('calendar','Maybe') }}
								</NcCheckboxRadioSwitch>
							</div>
						</div>
					</div>
					<div v-else class="proposal-public__content-date-empty">
						{{ t('calendar', 'No proposed dates') }}
					</div>
				</div>
			</div>
			<div class="proposal-public__row-actions">
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
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
// icons
import ProposalIcon from 'vue-material-design-icons/BallotOutline'
import RespondedIcon from 'vue-material-design-icons/Check'
import LocationIcon from 'vue-material-design-icons/MapMarkerOutline'
import DurationIcon from 'vue-material-design-icons/ClockOutline'
import YesIcon from 'vue-material-design-icons/Check'
import NoIcon from 'vue-material-design-icons/Close'
import MaybeIcon from 'vue-material-design-icons/Help'

export default {
	name: 'ProposalPublic',

	components: {
		NcGuestContent,
		NcEmptyContent,
		NcAvatar,
		NcButton,
		NcCheckboxRadioSwitch,
		ProposalIcon,
		RespondedIcon,
		LocationIcon,
		DurationIcon,
		YesIcon,
		NoIcon,
		MaybeIcon,
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

		respondedViewLabel() {
			return t('calendar', 'Thank you for your response!')
		},

		respondedViewDescription() {
			return t('calendar', 'Your vote has been recorded. Thank you for participating!')
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

.proposal-public__content-details {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.proposal-public__row-details {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.proposal-public__content-column-left {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.proposal-public__content-column-right {
  flex: 1 1 70%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.proposal-public__content-organizer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

h6 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.proposal-public__content-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.proposal-public__content-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.proposal-public__content-date-list {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.proposal-public__content-date-time {
  white-space: nowrap;
  min-width: 0;
  flex: 0 1 auto;
}

.proposal-public__content-date-actions {
  display: flex;
  gap: 0;
  flex: 1 1 0;
}

.proposal-public__content-date-empty {
  font-style: italic;
  color: var(--color-text-lighter);
}

.proposal-public__row-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
