<!--
  - SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="proposal-matrix-wrapper">
		<div v-if="proposal?.participants.length && proposal?.dates.length" class="proposal-matrix__details">
			<table class="proposal-matrix__table" role="table">
				<thead>
					<tr class="proposal-matrix__header">
						<th v-if="mode === 'organizer'" scope="col" class="proposal-matrix__table-header-organizer">
							&nbsp;
						</th>
						<th
							v-if="mode === 'participant'"
							scope="col"
							class="proposal-matrix__table-header-participant"
							colspan="2">
							{{ t('calendar', 'Select your meeting availability') }}
						</th>
						<th
							v-for="participant in proposal.participants"
							:key="'head-' + participant.id"
							scope="col"
							class="proposal-matrix__table-participant-header">
							<div class="proposal-matrix__table-participant-header-avatar">
								<NcAvatar
									:user="participant.name || participant.address"
									:display-name="participant.name || participant.address"
									:disable-tooltip="false"
									:is-no-user="true"
									:size="32" />
								<div class="proposal-matrix__table-participant-header-name">
									{{ participant.name || participant.address }}
								</div>
							</div>
						</th>
						<th v-if="mode === 'organizer'" scope="col" class="proposal-matrix__table-action-header">
							&nbsp;
						</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="group in datesGrouped">
						<tr
							:key="'day-' + group.key"
							class="proposal-matrix__table-row-label">
							<td class="proposal-matrix__table-day-label">
								{{ group.label }}
							</td>
						</tr>
						<tr v-for="date in group.dates" :key="date.id" class="proposal-matrix__table-row">
							<td class="proposal-matrix__table-day-time">
								{{ dateTimeSpan(date.date) }}
							</td>
							<td v-if="mode === 'participant'" class="proposal-matrix__table-actions-participant">
								<div class="voting-options-container">
									<NcCheckboxRadioSwitch
										type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Yes"
										:model-value="dateVoteValue(date)"
										@update:modelValue="$emit('date-vote', { date: date, vote: ProposalDateVote.Yes })">
										<div class="vote-option">
											<VoteYesIcon />
											{{ t('calendar', 'Yes') }}
										</div>
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch
										type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.No"
										:model-value="dateVoteValue(date)"
										@update:modelValue="$emit('date-vote', { date: date, vote: ProposalDateVote.No })">
										<div class="vote-option">
											<VoteNoIcon />
											{{ t('calendar', 'No') }}
										</div>
									</NcCheckboxRadioSwitch>
									<NcCheckboxRadioSwitch
										type="radio"
										:button-variant="true"
										button-variant-grouped="horizontal"
										:name="'vote-' + date.id"
										:value="ProposalDateVote.Maybe"
										:model-value="dateVoteValue(date)"
										@update:modelValue="$emit('date-vote', { date: date, vote: ProposalDateVote.Maybe })">
										<div class="vote-option">
											<VoteMaybeIcon />
											{{ t('calendar', 'Maybe') }}
										</div>
									</NcCheckboxRadioSwitch>
								</div>
							</td>
							<td v-for="participant in proposal.participants" :key="participant.id + '-' + date.id" class="proposal-matrix__table-votes">
								<component
									:is="participantVoteIcon(participant.id, date.id)"
									:title="participantVoteLabel(participant.id, date.id)"
									:size="20" />
							</td>
							<td v-if="mode === 'organizer'" class="proposal-matrix__table-actions-organizer">
								<NcButton
									variant="tertiary"
									:title="t('calendar', 'Create a meeting for this date and time')"
									@click="$emit('date-convert', date)">
									<template #icon>
										<CreateIcon />
									</template>
									{{ t('calendar', 'Create') }}
								</NcButton>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
		<div v-else class="proposal-matrix__empty">
			{{ t('calendar', 'No participants or dates available') }}
		</div>
	</div>
</template>

<script lang="ts">
import type { ProposalDate } from '@/models/proposals/proposals'

import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import CreateIcon from 'vue-material-design-icons/CalendarOutline'
import VoteYesIcon from 'vue-material-design-icons/Check'
import VoteNoIcon from 'vue-material-design-icons/Close'
import VoteMaybeIcon from 'vue-material-design-icons/Help'
import VoteNoneIcon from 'vue-material-design-icons/Minus'
import NcAvatar from '@nextcloud/vue/components/NcAvatar'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcCheckboxRadioSwitch from '@nextcloud/vue/components/NcCheckboxRadioSwitch'
import { Proposal, ProposalResponse } from '@/models/proposals/proposals'
import { ProposalDateVote } from '@/types/proposals/proposalEnums'

export default {
	name: 'ProposalResponseMatrix',

	components: {
		NcButton,
		NcAvatar,
		NcCheckboxRadioSwitch,
		VoteYesIcon,
		VoteNoIcon,
		VoteMaybeIcon,
		VoteNoneIcon,
		CreateIcon,
	},

	props: {
		mode: {
			type: String,
			required: true,
		},

		proposal: {
			type: Proposal,
			required: true,
		},

		response: {
			type: ProposalResponse,
		},

		timezoneId: {
			type: String,
			default: 'UTC',
		},
	},

	emits: [
		'date-convert',
		'date-vote',
	],

	data() {
		return {
			ProposalDateVote,
			timezoneOffset: 0,
		}
	},

	computed: {
		datesGrouped() {
			if (!this.proposal) {
				return []
			}
			// Sort dates for predictable grouping
			const dates = [...this.proposal.dates].sort((a, b) => {
				if (!a.date || !b.date) {
					return 0
				}
				return a.date.getTime() - b.date.getTime()
			})
			const groups = {}
			dates.forEach((d) => {
				// Apply timezone offset for grouping by day
				const key = d.date ? moment(d.date).utcOffset(this.timezoneOffset).format('YYYY-MM-DD') : 'invalid'
				if (!groups[key]) {
					groups[key] = []
				}
				groups[key].push(d)
			})
			return Object.entries(groups).map(([key, grp]: [string, ProposalDate[]]) => ({
				key,
				label: moment(grp[0].date).utcOffset(this.timezoneOffset).format('dddd, MMMM Do'),
				dates: grp,
			}))
		},

		columnCount() {
			// time + participants + action
			const participants = this.proposal?.participants?.length ?? 0
			return 2 + participants
		},

	},

	watch: {
		timezoneId(newZone) {
			if (newZone) {
				this.timezoneOffset = this.calculateTimezoneOffset(newZone)
			}
		},
	},

	created() {
		if (this.timezoneId) {
			this.timezoneOffset = this.calculateTimezoneOffset(this.timezoneId)
		}
	},

	methods: {
		t,

		calculateTimezoneOffset(timezoneId) {
			// Get the timezone offset in minutes
			try {
				const now = new Date()
				const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
				const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezoneId }))
				return ((utcDate.getTime() - targetDate.getTime()) / (1000 * 60)) * -1
			} catch (e) {
				// Fallback to UTC if timezone is invalid
				return 0
			}
		},

		dateTimeSpan(date) {
			const startDate = moment(date).utcOffset(this.timezoneOffset)
			const endDate = moment(date).utcOffset(this.timezoneOffset).add(this.proposal.duration, 'minutes')

			const startTime = startDate.format('LT')
			const endTime = endDate.format('LT')

			return `${startTime} - ${endTime}`
		},

		dateVoteValue(date: ProposalDate): ProposalDateVote {
			if (date.id === null) {
				return ProposalDateVote.Maybe
			}
			if (!this.response || !this.response.dates || !this.response.dates[date.id]) {
				return ProposalDateVote.Maybe
			}
			return this.response.dates[date.id].vote
		},

		formatProposalDateCompact(date) {
			if (!date) {
				return ''
			}
			// Apply timezone offset and format very compact: "7/8 2PM"
			const adjustedDate = moment(date).utcOffset(this.timezoneOffset)
			return adjustedDate.format('M/D LT').replace(':00', '').replace(' ', ' ')
		},

		participantVoteIcon(participantId, dateId) {
			const vote = this.participantVote(participantId, dateId)
			switch (vote) {
				case ProposalDateVote.Yes:
					return 'VoteYesIcon'
				case ProposalDateVote.No:
					return 'VoteNoIcon'
				case ProposalDateVote.Maybe:
					return 'VoteMaybeIcon'
				default:
					return 'VoteNoneIcon'
			}
		},

		participantVoteLabel(participantId, dateId) {
			const vote = this.participantVote(participantId, dateId)
			switch (vote) {
				case ProposalDateVote.Yes:
					return t('calendar', 'Yes')
				case ProposalDateVote.No:
					return t('calendar', 'No')
				case ProposalDateVote.Maybe:
					return t('calendar', 'Maybe')
				default:
					return t('calendar', 'None')
			}
		},

		participantVote(participantId, dateId) {
			if (!this.proposal || !participantId || !dateId) {
				return null // No response / unknown
			}

			// Find the vote for this participant and date combination
			const vote = this.proposal.votes.find((v) => v.participant === participantId && v.date === dateId)

			return vote ? vote.vote : null // null indicates no response
		},
	},
}
</script>

<style lang="scss" scoped>

.proposal-matrix__details {
	max-height: 50vh;
	overflow-y: auto;
}

.proposal-matrix__table {
	border-collapse: separate;
	border-spacing: 0;

	thead {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--color-main-background);
	}

	thead th {
		padding-bottom: calc(var(--default-grid-baseline) * 2);
	}

	tbody {
		border: 1px solid var(--color-border);
	}
}

.proposal-matrix__table-header-participant {
	vertical-align: bottom;
	text-align: start;
	font-weight: 600;
	font-size: calc(var(--default-grid-baseline) * 5);
}

.proposal-matrix__table-participant-header {
	text-align: center;
	padding-inline: calc(var(--default-grid-baseline) * 2);
	width: calc(var(--default-grid-baseline) * 24);
}

.proposal-matrix__table-participant-header-avatar {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 1);
}

.proposal-matrix__table-participant-header-name {
	font-weight: 600;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: calc(var(--default-grid-baseline) * 22);
}

.proposal-matrix__table-row-label {
	pointer-events: none;

	&:hover {
		background-color: transparent !important;
	}
}

.proposal-matrix__table-day-label {
	font-weight: 600;
	font-size: calc(var(--default-grid-baseline) * 4);
	color: var(--color-text-primary);
}

.proposal-matrix__empty {
	text-align: center;
	padding: calc(var(--default-grid-baseline) * 4);
	color: var(--color-text-maxcontrast);
}

.proposal-matrix__table-actions-participant {
	padding: calc(var(--default-grid-baseline) * 1);
	min-width: 250px;
}

.proposal-matrix__table-action-header {
	width: auto;
	white-space: nowrap;
}

.voting-options-container {
	display: flex;
	flex-direction: row;
	gap: 0;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: nowrap;

	:deep(.checkbox-radio-switch--button-variant) {
		border: none !important;
		background-color: var(--color-primary-light) !important;
	}

	:deep(.checkbox-radio-switch--button-variant .checkbox-radio-switch__content) {
		border: none !important;
	}

}

.vote-option {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: calc(var(--default-grid-baseline) * 1);
	white-space: nowrap;

	:deep(.material-design-icon.check-icon svg),
	:deep(.material-design-icon.close-icon svg),
	:deep(.material-design-icon.help-icon svg) {
		stroke: currentColor;
		stroke-width: 1px;
	}

	:deep(.material-design-icon.help-icon svg) {
		height: 18px;
	}
}

.vote-option svg {
	width: 16px;
	height: 16px;
}

.proposal-matrix__table-votes {
	text-align: center;
	padding-inline: calc(var(--default-grid-baseline) * 1);
	padding-block: calc(var(--default-grid-baseline) * 2);

	:deep(.material-design-icon.check-icon) {
		color: #32CD32;
		background-color: rgba(90, 90, 90, 0.1);
		padding: calc(var(--default-grid-baseline) * 2);
		border-radius: calc(var(--default-grid-baseline) * 1);
	}

	:deep(.material-design-icon.close-icon) {
		color: #ff4402;
		background-color: rgba(90, 90, 90, 0.1);
		padding: calc(var(--default-grid-baseline) * 2);
		border-radius: calc(var(--default-grid-baseline) * 1);
	}

	:deep(.material-design-icon.help-icon) {
		color: #ffc107;
		background-color: rgba(90, 90, 90, 0.1);
		padding: calc(var(--default-grid-baseline) * 2);
		border-radius: calc(var(--default-grid-baseline) * 1);
	}

	:deep(.material-design-icon.minus-icon) {
		color: #6B6B6B;
		background-color: rgba(90, 90, 90, 0.1);
		padding: calc(var(--default-grid-baseline) * 2);
		border-radius: calc(var(--default-grid-baseline) * 1);
	}

	:deep(.material-design-icon.check-icon svg),
	:deep(.material-design-icon.close-icon svg),
	:deep(.material-design-icon.help-icon svg),
	:deep(.material-design-icon.minus-icon svg) {
		stroke: currentColor;
		stroke-width: 1.6px;
		stroke-linecap: round;
		stroke-linejoin: round;
		paint-order: stroke fill;
	}

	:deep(.material-design-icon.help-icon svg) {
		height: 18px;
	}
}

</style>
