<!--
 - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 - SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<template>
	<NcModal size="normal"
		class="modal"
		:name="t('calendar', 'Select a Talk Room')"
		@close="$emit('close', $event)">
		<div class="modal-content">
			<h2>{{ t('calendar', 'Add Talk conversation') }}</h2>
			<div class="talk-room-list">
				<NcEmptyContent v-if="loading"
					icon="icon-loading"
					class="modal__content__loading"
					:description="t('calendar','Fetching Talk rooms…')" />
				<NcEmptyContent v-else-if="talkConversations.length === 0"
					:description="t('calendar','No Talk room available')" />
				<ul v-else>
					<li v-for="conversation in sortedTalkConversations"
						:key="conversation.id"
						:class="{ selected: selectedRoom && selectedRoom.id === conversation.id }"
						class="talk-room-list__item"
						@click="selectRoom(conversation)">
						<NcAvatar :url="avatarUrl(conversation)"
							:size="28"
							:disable-tooltip="true" />
						<span>{{ conversation.displayName }}</span>
					</li>
				</ul>
			</div>
			<div class="sticky-footer">
				<NcButton v-if="canCreateConversations"
					class="talk_new-room"
					:disabled="creatingTalkRoom"
					@click="createTalkRoom">
					<template #icon>
						<IconAdd :size="20" />
					</template>
					{{ t('calendar', 'Create a new conversation') }}
				</NcButton>
				<NcButton type="primary"
					class="talk_select-room"
					:disabled="!selectedRoom"
					@click="selectConversation(selectedRoom)">
					{{ t('calendar', 'Select conversation') }}
				</NcButton>
			</div>
		</div>
	</NcModal>
</template>

<script>
import {
	NcButton,
	NcModal,
	NcAvatar,
	NcEmptyContent,
} from '@nextcloud/vue'
import axios from '@nextcloud/axios'
import { loadState } from '@nextcloud/initial-state'
import { createTalkRoom, generateURLForToken } from '../../services/talkService.js'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { generateOcsUrl } from '@nextcloud/router'
import IconAdd from 'vue-material-design-icons/Plus.vue'
import useCalendarObjectInstanceStore from '../../store/calendarObjectInstance.js'
import { mapStores } from 'pinia'

// Ref https://github.com/nextcloud/spreed/blob/main/docs/constants.md
const CONVERSATION_TYPE_GROUP = 2
const CONVERSATION_TYPE_PUBLIC = 3
const CONVERSATION_OBJECT_TYPE_VIDEO_VERIFICATION = 'share:password'
const CONVERSATION_OBJECT_TYPE_EVENT = 'event'
const PARTICIPANT_TYPE_OWNER = 1
const PARTICIPANT_TYPE_MODERATOR = 2

const canCreateConversations = loadState('core', 'capabilities')?.spreed?.config?.conversations?.['can-create'] ?? false

export default {
	name: 'AddTalkModal',
	components: {
		NcButton,
		NcModal,
		IconAdd,
		NcAvatar,
		NcEmptyContent,
	},
	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
		conversations: {
			type: Array,
			required: true,
		},
	},
	setup() {
		return {
			canCreateConversations,
		}
	},
	data() {
		return {
			talkConversations: [],
			selectedConversation: null,
			creatingTalkRoom: false,
			selectedRoom: false,
			loading: true,
		}
	},
	computed: {
		...mapStores(useCalendarObjectInstanceStore, ['calendarObjectInstance']),
		/**
		 * @return {object[]} Talk conversations sorted by most recent activity
		 */
		sortedTalkConversations() {
			return this.talkConversations.toSorted((a, b) => b.lastActivity - a.lastActivity)
		},
	},
	async mounted() {
		await this.fetchTalkConversations()
	},
	methods: {
		avatarUrl(conversation) {
			return generateOcsUrl('apps/spreed/api/v1/room/{token}/avatar', {
				token: conversation.token,
			})
		},
		async fetchTalkConversations() {
			try {
				const response = await axios.get(generateOcsUrl('apps/spreed/api/v4/room'))
				this.talkConversations = response.data.ocs.data.filter(conversation =>
					(conversation.participantType === PARTICIPANT_TYPE_OWNER
						|| conversation.participantType === PARTICIPANT_TYPE_MODERATOR)
					&& (conversation.type === CONVERSATION_TYPE_GROUP
						|| (conversation.type === CONVERSATION_TYPE_PUBLIC
							&& conversation.objectType !== CONVERSATION_OBJECT_TYPE_VIDEO_VERIFICATION))
					&& conversation.objectType !== CONVERSATION_OBJECT_TYPE_EVENT,
				)
			} catch (error) {
				console.error('Error fetching Talk conversations:', error)
				showError(this.$t('calendar', 'Error fetching Talk conversations.'))
			} finally {
				this.loading = false
			}
		},
		selectRoom(conversation) {
			this.selectedRoom = conversation
		},

		async selectConversation(conversation) {
			try {
				const url = generateURLForToken(conversation.token)

				if (!url) {
					showError(this.$t('calendar', 'Conversation does not have a valid URL.'))
					return
				}

				if ((this.calendarObjectInstance.location ?? '').trim() === '') {
					this.calendarObjectInstanceStore.changeLocation({
						calendarObjectInstance: this.calendarObjectInstance,
						location: url,
					})
					showSuccess(this.$t('calendar', 'Successfully added Talk conversation link to location.'))
				} else {
					const NEW_LINE = '\r\n'
					const updatedDescription = this.calendarObjectInstance.description
						? this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url
						: url

					this.calendarObjectInstanceStore.changeDescription({
						calendarObjectInstance: this.calendarObjectInstance,
						description: updatedDescription,
					})
					showSuccess(this.$t('calendar', 'Successfully added Talk conversation link to description.'))
				}

				this.selectedConversation = conversation
			} catch (error) {
				console.error('Error applying conversation to event:', error)
				showError(this.$t('calendar', 'Failed to apply Talk room.'))
			} finally {
				this.closeModal()
			}
		},

		async createTalkRoom() {
			const NEW_LINE = '\r\n'
			try {
				this.creatingTalkRoom = true
				const url = await createTalkRoom(
					this.calendarObjectInstance.title,
					this.calendarObjectInstance.description,
				)

				if (!url) {
					throw new Error('No URL returned from createTalkRoom')
				}

				if ((this.calendarObjectInstance.location ?? '').trim() === '') {
					this.$emit('update-location', url)
					showSuccess(this.$t('calendar', 'Successfully added Talk conversation link to location.'))
				} else {
					const newDescription = this.calendarObjectInstance.description
						? this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url + NEW_LINE
						: url

					this.$emit('update-description', newDescription)
					showSuccess(this.$t('calendar', 'Successfully added Talk conversation link to description.'))
				}
				this.closeModal()
			} catch (error) {
				console.error('Error creating Talk room:', error)
				showError(this.$t('calendar', 'Error creating Talk conversation'))
			} finally {
				this.creatingTalkRoom = false
			}
		},
		closeModal() {
			this.$emit('close')
		},
	},
}
</script>

<style lang="scss" scoped>
.talk-room-list {
	flex: 1;
	overflow-y: auto;
	padding: 10px;
	font-weight: 600;

	&__item {
		display: flex;
		gap: calc(var(--default-grid-baseline) * 2);
		align-items: center;
		padding: 6px 6px 6px 9px;
		height: 34px;
		&:hover {
			background-color: var(--color-background-hover);
			border-radius: var(--border-radius-large);

		}
		&.selected {
			background-color: var(--color-primary-element);
			border-radius: var(--border-radius-large);
			color: white;
		}
	}
}

.sticky-footer {
	position: sticky;
	bottom: 0;
	padding: 16px;
	text-align: right;
	display: flex;
	background-color: var(--color-main-background);
	border-radius: var(--border-radius-large);
}
.talk_new-room {
	margin-right: auto;
}

.talk_select-room {
	margin-left: auto;
}

h2 {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	height: 30px;
}
</style>
