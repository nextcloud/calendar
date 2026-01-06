<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div
		class="invitation-response-buttons"
		:class="{ 'invitation-response-buttons--grow': growHorizontally }">
		<NcButton
			v-if="!isAccepted"
			variant="primary"
			class="invitation-response-buttons__button"
			@click="accept">
			{{ t('calendar', 'Accept') }}
		</NcButton>
		<NcButton
			v-if="!isDeclined"
			variant="error"
			class="invitation-response-buttons__button"
			@click="decline">
			{{ t('calendar', 'Decline') }}
		</NcButton>
		<template v-if="!isTentative">
			<NcButton
				v-if="!narrow"
				class="invitation-response-buttons__button"
				@click="tentative">
				{{ t('calendar', 'Tentative') }}
			</NcButton>
			<Actions v-else>
				<ActionButton
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
	NcActionButton as ActionButton,
	NcActions as Actions,
	NcButton,
} from '@nextcloud/vue'
import CalendarQuestionIcon from 'vue-material-design-icons/CalendarQuestionOutline.vue'

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
		accept() {
			this.$emit('respond', 'ACCEPTED')
		},

		decline() {
			this.$emit('respond', 'DECLINED')
		},

		tentative() {
			this.$emit('respond', 'TENTATIVE')
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
