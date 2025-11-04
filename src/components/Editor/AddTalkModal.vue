<!--
 - SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 - SPDX-License-Identifier: AGPL-3.0-or-later
 -->

<template>
	<NcModal
		size="small"
		class="modal"
		:name="t('calendar', 'Select a Talk Room')"
		@close="$emit('close', $event)">
		<div class="modal-content">
			<NcEmptyContent
				v-if="loading"
				icon="icon-loading"
				class="modal__content__loading"
				:description="t('calendar', 'Fetching Talk rooms…')" />
			<NcEmptyContent
				v-else-if="talkConversations.length === 0"
				:description="t('calendar', 'No Talk room available')" />
			<NcFormGroup v-else :label="t('calendar', 'Select existing conversation')">
				<NcListItem
					v-for="conversation in sortedTalkConversations"
					:key="conversation.id"
					:class="{ selected: selectedRoom && selectedRoom.id === conversation.id }"
					:name="conversation.displayName"
					class="talk-room-list__item"
					@click="selectRoom(conversation)">
					<template #icon>
						<NcAvatar
							:url="avatarUrl(conversation)"
							:size="28"
							:disable-tooltip="true" />
					</template>
				</NcListItem>
				<NcButton
					variant="secondary"
					class="talk_select-room"
					wide
					:disabled="!selectedRoom"
					@click="selectConversation(selectedRoom)">
					{{ t('calendar', 'Select conversation') }}
				</NcButton>
			</NcFormGroup>
			<div class="spacer" />
			<NcFormGroup :label="t('calendar', 'Or create a new conversation')">
				<NcFormBox>
					<NcFormBoxButton
						v-if="canCreateConversations"
						class="talk_new-room"
						:disabled="creatingTalkRoom"
						wide
						@click="createTalkRoom('public')">
						<template #icon>
							<IconAdd :size="20" />
						</template>
						{{ t('calendar', 'Create public conversation') }}
					</NcFormBoxButton>
					<NcFormBoxButton
						v-if="canCreateConversations"
						class="talk_new-room"
						:disabled="creatingTalkRoom"
						wide
						@click="createTalkRoom('private')">
						<template #icon>
							<IconAdd :size="20" />
						</template>
						{{ t('calendar', 'Create private conversation') }}
					</NcFormBoxButton>
				</NcFormBox>
			</NcFormGroup>
		</div>
	</NcModal>
</template>

<script>
import { showError, showSuccess } from '@nextcloud/dialogs'
import { loadState } from '@nextcloud/initial-state'
import { generateOcsUrl } from '@nextcloud/router'
import {
	NcAvatar,
	NcButton,
	NcEmptyContent,
	NcFormBox,
	NcFormBoxButton,
	NcFormGroup,
	NcListItem,
	NcModal,
} from '@nextcloud/vue'
import md5 from 'md5'
import { mapStores } from 'pinia'
import IconAdd from 'vue-material-design-icons/Plus.vue'
import useCalendarObjectInstanceStore from '../../store/calendarObjectInstance.js'
import { createRoom, generateRoomUrl, listRooms } from '@/services/talkService'

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
		NcFormBox,
		NcFormBoxButton,
		NcListItem,
		NcFormGroup,
	},

	props: {
		calendarObjectInstance: {
			type: Object,
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
				const rooms = await listRooms()
				this.talkConversations = rooms.filter((conversation) => (conversation.participantType === PARTICIPANT_TYPE_OWNER
					|| conversation.participantType === PARTICIPANT_TYPE_MODERATOR)
				&& (conversation.type === CONVERSATION_TYPE_GROUP
					|| (conversation.type === CONVERSATION_TYPE_PUBLIC
						&& conversation.objectType !== CONVERSATION_OBJECT_TYPE_VIDEO_VERIFICATION))
					&& conversation.objectType !== CONVERSATION_OBJECT_TYPE_EVENT)
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
				const url = generateRoomUrl(conversation)

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

		async createTalkRoom(type) {
			const NEW_LINE = '\r\n'
			try {
				this.creatingTalkRoom = true

				const roomType = type === 'private' ? CONVERSATION_TYPE_GROUP : CONVERSATION_TYPE_PUBLIC
				const room = await createRoom({
					roomType,
					roomName: this.calendarObjectInstance.title || this.$t('calendar', 'Talk conversation for event'),
					objectType: 'event',
					objectId: md5(String(Date.now())),
					description: this.calendarObjectInstance.description || '',
				})

				if (!room || !room.token) {
					throw new Error('No token returned from createRoom')
				}

				const url = generateRoomUrl(room)
				if (!url) {
					throw new Error('Failed to generate URL from token')
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
.modal-content {
	margin: calc(var(--default-grid-baseline) * 6);
}

.spacer {
	margin-top: calc(var(--default-grid-baseline) * 6);
}
</style>
