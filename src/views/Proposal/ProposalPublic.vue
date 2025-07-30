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
					<div>
						<NcTimezonePicker v-model="timezoneId" 
							:aria-label="t('calendar', 'Select a different time zone')" />
					</div>
					<div v-if="storedProposal?.dates.length">
						<div v-for="(dates, dayHeading) in proposalDatesGrouped"
							:key="dayHeading"
							class="proposal-public__content-day-group">
							<h5 class="proposal-public__content-day-heading">{{ dayHeading }}</h5>
							<div v-for="date in dates"
								:key="date.id"
								class="proposal-public__content-date-list">
								<span class="proposal-public__content-date-time">
									{{ dateTimeSpan(date.date, storedProposal.duration) }}
								</span>
								<div class="proposal-public__content-date-actions">
									<NcCheckboxRadioSwitch type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Yes"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Yes" >
										<div class="vote-option">
											<div class="vote-option__content">
												<YesIcon />
												{{ t('calendar','Yes') }}
											</div>
											<div class="vote-option__count">
												<PeopleIcon />
												{{ dateVoteCount(date.id, ProposalDateVote.Yes) }}
											</div>
										</div>
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.No"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.No" >
										<div class="vote-option">
											<div class="vote-option__content">
												<NoIcon />
												{{ t('calendar','No') }}
											</div>
											<div class="vote-option__count">
												<PeopleIcon />
												{{ dateVoteCount(date.id, ProposalDateVote.No) }}
											</div>
										</div>
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Maybe"
										:modelValue="response.dates[date.id].vote"
										@update:modelValue="response.dates[date.id].vote = ProposalDateVote.Maybe" >
										<div class="vote-option">
											<div class="vote-option__content">
												<MaybeIcon />
												{{ t('calendar','Maybe') }}
											</div>
											<div class="vote-option__count">
												<PeopleIcon />
												{{ dateVoteCount(date.id, ProposalDateVote.Maybe) }}
											</div>
										</div>
									</NcCheckboxRadioSwitch>
								</div>
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
import moment from '@nextcloud/moment'
import type { ProposalDateInterface, ProposalVoteInterface } from '@/types/proposals/proposalInterfaces'
import { ProposalResponse, ProposalResponseDate } from '@/models/proposals/proposals'
import { ProposalDateVote } from '@/types/proposals/proposalEnums'
// components
import NcGuestContent from '@nextcloud/vue/components/NcGuestContent'
import NcEmptyContent from '@nextcloud/vue/components/NcEmptyContent'
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import NcTimezonePicker from '@nextcloud/vue/components/NcTimezonePicker'
// icons
import ProposalIcon from 'vue-material-design-icons/BallotOutline'
import RespondedIcon from 'vue-material-design-icons/Check'
import LocationIcon from 'vue-material-design-icons/MapMarkerOutline'
import DurationIcon from 'vue-material-design-icons/ClockOutline'
import YesIcon from 'vue-material-design-icons/Check'
import NoIcon from 'vue-material-design-icons/Close'
import MaybeIcon from 'vue-material-design-icons/Help'
import PeopleIcon from 'vue-material-design-icons/AccountSupervisorOutline'

export default {
	name: 'ProposalPublic',

	components: {
		NcGuestContent,
		NcEmptyContent,
		NcAvatar,
		NcButton,
		NcCheckboxRadioSwitch,
		NcTimezonePicker,
		ProposalIcon,
		RespondedIcon,
		LocationIcon,
		DurationIcon,
		YesIcon,
		NoIcon,
		MaybeIcon,
		PeopleIcon,
	},

	data() {
	   return {
		   proposalStore: useProposalStore(),
		   token: null,
		   contentView: 'loading',
		   storedProposal: null,
		   response: new ProposalResponse(),
		   ProposalDateVote,
		   timezoneId: 'UTC',
		   timezoneOffset: 0,
	   }
	},

	mounted() {
		// determine initial timezone and offset
		this.timezoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
		this.timezoneOffset = this.calculateTimezoneOffset(this.timezoneId)

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

		proposalDatesGrouped() {
			if (!this.storedProposal?.dates) {
				return {}
			}
			// group dates by day
			const groups: Record<string, ProposalDateInterface[]> = {}
			this.storedProposal.dates.forEach((date: ProposalDateInterface) => {
				if (!date.date) {
					return
				}
				const groupLabel: string = moment(date.date).utcOffset(this.timezoneOffset).format('dddd, MMMM Do')

				if (!groups[groupLabel]) {
					groups[groupLabel] = []
				}
				groups[groupLabel].push(date)
			})
			// sort dates within each day by time
			Object.keys(groups).forEach(day => {
				groups[day].sort((a, b) => {
					if (!a.date && !b.date) return 0
					if (!a.date) return 1
					if (!b.date) return -1
					return a.date.getTime() - b.date.getTime()
				})
			})

			return groups
		},
	},

	watch: {
		timezoneId(newValue: string, oldValue: string) {
			this.timezoneOffset = this.calculateTimezoneOffset(newValue)
		},
	},

	methods: {
		t,

		calculateTimezoneOffset(timezoneId: string): number {
			// Get the timezone offset in minutes
			try {
				const now = new Date()
				const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
				const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezoneId }))
				return (utcDate.getTime() - targetDate.getTime()) / (1000 * 60)
			} catch (e) {
				// Fallback to UTC if timezone is invalid
				return 0
			}
		},

		dateVoteCount(dateId: number, voteType: ProposalDateVote): number {
			if (!this.storedProposal?.votes) {
				return 0
			}
			
			return this.storedProposal.votes.filter((vote: ProposalVoteInterface) => {
				return vote.date === dateId && vote.vote === voteType
			}).length
		},

		dateTimeSpan(date: Date, duration: number) {
			const startDate = moment(date).utcOffset(this.timezoneOffset)
			const endDate = moment(date).utcOffset(this.timezoneOffset).add(duration, 'minutes')

			const startTime = startDate.format('LT')
			const endTime = endDate.format('LT')

			return `${startTime} - ${endTime}`
		},

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

.proposal-public__content-day-group {
  margin-bottom: 1.5rem;
}

.proposal-public__content-day-heading {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  padding-bottom: 0.25rem;
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
  padding-left: 0.5rem;
}

.proposal-public__content-date-time {
  white-space: nowrap;
  min-width: 140px;
  flex: 0 0 auto;
  font-family: var(--font-face-monospace);
}

.proposal-public__content-date-actions {
  display: flex;
  gap: calc(var(--default-grid-baseline) * 4);
  flex: 1 1 0;
  
  // Deep CSS to remove default borders from radio switches
  :deep(.checkbox-radio-switch) {
    border: none !important;
  }
}

.vote-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.vote-option__content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.vote-option__count {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.proposal-public__content-date-empty {
  font-style: italic;
  color: var(--color-text-lighter);
}

.proposal-public__row-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
