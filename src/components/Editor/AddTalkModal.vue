<template>
	<NcModal size="normal"
		class="modal"
		:name="t('calendar', 'Select a Talk Room')"
		@open="fetchTalkConversations">
		<div class="modal-content">
			<h2>{{ t('calendar', 'Select a talk room from the list') }}</h2>
			<ul>
				<li v-for="conversation in talkConversations" :key="conversation.id">
					<NcButton @click="selectConversation(conversation)">
						{{ t('calendar', 'Select') }}
					</NcButton>
				</li>
			</ul>
			<h2>{{ t('calendar', 'Create a new talk room') }}</h2>
			<NcButton @click="createTalkRoom">
				{{ t('calendar', 'Create a new talk room') }}
			</NcButton>
		</div>
	</NcModal>
</template>

<script>
import {
	NcButton,
	NcModal,
} from '@nextcloud/vue'
import axios from '@nextcloud/axios'
import { createTalkRoom } from '../../services/talkService.js'
import { showError, showSuccess } from '@nextcloud/dialogs'
import { generateOcsUrl } from '@nextcloud/router'

export default {
	name: 'AddTalkModal',
	components: {
		NcButton,
		NcModal,
	},
	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			talkConversations: [],
			selectedConversation: null,
			creatingTalkRoom: false,
		}
	},
	methods: {
		async fetchTalkConversations() {
			try {
				const response = await axios.get(generateOcsUrl('apps/spreed/api/v1/room'))
				this.talkConversations = response.data.ocs.data.filter(conversation =>
					conversation.joinable || conversation.is_moderator,
				)
			} catch (error) {
				console.error('Error fetching Talk conversations:', error)
			}
		},
		selectConversation(conversation) {
			this.selectedConversation = conversation
			this.applyConversationToEvent(conversation)
			this.closeModal()
		},
		applyConversationToEvent(conversation) {
			console.debug('Applying conversation to event:', conversation)
			this.$emit('update-event', { talkRoom: conversation })
		},
		async createTalkRoom() {
			const NEW_LINE = '\r\n'
			try {
				this.creatingTalkRoom = true
				const url = await createTalkRoom(
					this.calendarObjectInstance.title,
					this.calendarObjectInstance.description,
				)

				// Store in LOCATION property if it's missing/empty. Append to description otherwise.
				if ((this.calendarObjectInstance.location ?? '').trim() === '') {
					this.calendarObjectInstanceStore.changeLocation({
						calendarObjectInstance: this.calendarObjectInstance,
						location: url,
					})
					showSuccess(this.$t('calendar', 'Successfully appended link to talk room to location.'))
				} else {
					if (!this.calendarObjectInstance.description) {
						this.calendarObjectInstanceStore.changeDescription({
							calendarObjectInstance: this.calendarObjectInstance,
							description: url,
						})
					} else {
						this.calendarObjectInstanceStore.changeDescription({
							calendarObjectInstance: this.calendarObjectInstance,
							description: this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url + NEW_LINE,
						})
					}
					showSuccess(this.$t('calendar', 'Successfully appended link to talk room to description.'))
				}
			} catch (error) {
				showError(this.$t('calendar', 'Error creating Talk room'))
			} finally {
				this.creatingTalkRoom = false
			}
		},
	},
}
</script>

<style scoped>
</style>
