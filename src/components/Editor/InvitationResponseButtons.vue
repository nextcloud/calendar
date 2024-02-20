<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<div class="invitation-response-buttons"
		:class="{ 'invitation-response-buttons--grow': growHorizontally }">
		<NcButton v-if="!isAccepted"
			type="primary"
			class="invitation-response-buttons__button"
			:disabled="loading"
			@click="accept">
			{{ t('calendar', 'Accept') }}
		</NcButton>
		<NcButton v-if="!isDeclined"
			type="error"
			class="invitation-response-buttons__button"
			:disabled="loading"
			@click="decline">
			{{ t('calendar', 'Decline') }}
		</NcButton>
		<template v-if="!isTentative">
			<NcButton v-if="!narrow"
				class="invitation-response-buttons__button"
				:disabled="loading"
				@click="tentative">
				{{ t('calendar', 'Tentative') }}
			</NcButton>
			<Actions v-else>
				<ActionButton :disabled="loading"
					@click="tentative">
					<template #icon>
						<CalendarQuestionIcon :size="20" />
					</template>
					{{ t('calendar', 'Tentative') }}
				</ActionButton>
			</Actions>
		</template>
	</div>
</template>

<script>
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
	NcButton,
} from '@nextcloud/vue'
import CalendarQuestionIcon from 'vue-material-design-icons/CalendarQuestion.vue'
import { showError, showSuccess } from '@nextcloud/dialogs'
import logger from '../../utils/logger.js'

export default {
	name: 'InvitationResponseButtons',
	components: {
		Actions,
		ActionButton,
		NcButton,
		CalendarQuestionIcon,
	},
	props: {
		attendee: {
			type: Object,
			required: true,
		},
		calendarId: {
			type: String,
			required: true,
		},
		narrow: {
			type: Boolean,
			default: false,
		},
		growHorizontally: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			loading: false,
		}
	},
	computed: {
		isAccepted() {
			return this.attendee.participationStatus === 'ACCEPTED'
		},
		isDeclined() {
			return this.attendee.participationStatus === 'DECLINED'
		},
		isTentative() {
			return this.attendee.participationStatus === 'TENTATIVE'
		},
	},
	methods: {
		async accept() {
			try {
				await this.setParticipationStatus('ACCEPTED')
				showSuccess(this.t('calendar', 'The invitation has been accepted successfully.'))
				this.$emit('close')
			} catch (e) {
				showError(this.t('calendar', 'Failed to accept the invitation.'))
			}
		},
		async decline() {
			try {
				await this.setParticipationStatus('DECLINED')
				showSuccess(this.t('calendar', 'The invitation has been declined successfully.'))
				this.$emit('close')
			} catch (e) {
				showError(this.t('calendar', 'Failed to decline the invitation.'))
			}
		},
		async tentative() {
			try {
				await this.setParticipationStatus('TENTATIVE')
				showSuccess(this.t('calendar', 'Your participation has been marked as tentative.'))
				this.$emit('close')
			} catch (e) {
				showError(this.t('calendar', 'Failed to set the participation status to tentative.'))
			}
		},
		/**
		 * Set the participation status and save the event
		 *
		 * @param {string} participationStatus The new participation status
		 * @return {Promise<void>}
		 */
		async setParticipationStatus(participationStatus) {
			this.loading = true
			try {
				this.$store.commit('changeAttendeesParticipationStatus', {
					attendee: this.attendee,
					participationStatus,
				})
				// TODO: What about recurring events? Add new buttons like "Accept this and all future"?
				// Currently, this will only accept a single occurrence.
				await this.$store.dispatch('saveCalendarObjectInstance', {
					thisAndAllFuture: false,
					calendarId: this.calendarId,
				})
			} catch (error) {
				logger.error('Failed to set participation status', { error, participationStatus })
				throw error
			} finally {
				this.loading = false
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.invitation-response-buttons {
	display: flex;
	justify-content: flex-end;
	gap: 5px;
	margin-bottom: 8px;

	&--grow {
		width: 100%;

		.invitation-response-buttons__button {
			flex: 1 auto;
		}
	}
}
</style>
