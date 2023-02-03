<template>
	<NcActions v-if="isCreateBbbRoomButtonVisible"
		:menu-title="$t('calendar', 'Add video link')"
		force-title
		force-menu
		:disabled="isCreateBbbRoomButtonDisabled"
		@open="getBbbRooms">
		<template #icon>
			<Video :size="20" />
		</template>
		<NcActionButton close-after-click @click="addBbbRoom(null)">
			<template #icon>
				<Plus :size="20" />
			</template>
			{{ $t('calendar', 'Create new room') }}
		</NcActionButton>
		<NcActionSeparator v-if="bbbRoomsList.length > 0" />
		<NcActionButton v-for="room in bbbRoomsList"
			:key="room.uid"
			close-after-click
			@click="addBbbRoom(room.uid)">
			<template #icon>
				<AccountBoxOutline :size="20" />
			</template>
			{{ room.name || $t('calendar', '(unnamed room)') }}
		</NcActionButton>
	</NcActions>
</template>
<script>

import { mapState } from 'vuex'
import NcActions from '@nextcloud/vue/dist/Components/NcActions.js'
import NcActionButton from '@nextcloud/vue/dist/Components/NcActionButton.js'
import NcActionSeparator from '@nextcloud/vue/dist/Components/NcActionSeparator.js'
import Plus from 'vue-material-design-icons/Plus.vue'
import Video from 'vue-material-design-icons/Video.vue'
import AccountBoxOutline from 'vue-material-design-icons/AccountBoxOutline.vue'
import { showSuccess, showError } from '@nextcloud/dialogs'
import { listBbbRooms, createBbbRoom, makeRoomUrlFromToken, doesDescriptionContainBbbLink } from '../../../services/bbbService.js'

export default {
	name: 'BbbAddRoomActions',
	components: {
		NcActions,
		NcActionButton,
		NcActionSeparator,
		Plus,
		// eslint-disable-next-line vue/no-reserved-component-names
		Video,
		AccountBoxOutline,
	},
	props: {
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			creatingBbbRoom: false,
			bbbRoomsList: [],
		}
	},
	computed: {
		...mapState({
			bbbEnabled: state => state.settings.bbbEnabled,
		}),
		isCreateBbbRoomButtonVisible() {
			return this.bbbEnabled
		},
		isCreateBbbRoomButtonDisabled() {
			return this.creatingBbbRoom || doesDescriptionContainBbbLink(this.calendarObjectInstance.description)
		},
	},
	methods: {
		getBbbRooms() {
			if (this.bbbRoomsList.length === 0) {
				listBbbRooms().then(list => {

					list.sort((a, b) => a.name.localeCompare(b.name))

					list.forEach(item => {
						if (item.uid && item.name) {
							this.bbbRoomsList.push({
								uid: item.uid,
								name: item.name.trim(),
							})
						}
					})
				}).catch(err => {
					console.error(err)
					showError(this.$t('calendar', 'Error getting video rooms list'))
				})
			}
		},
		/**
		 * @param {string|null} token room uid, null = create new room
		 */
		async addBbbRoom(token) {
			try {
				this.creatingBbbRoom = true

				let url
				if (!token) {
					url = await createBbbRoom(this.calendarObjectInstance.title)
				} else {
					url = makeRoomUrlFromToken(token)
				}

				const NEW_LINE = '\r\n'
				let newDescription
				if (!this.calendarObjectInstance.description) {
					newDescription = url + NEW_LINE
				} else {
					newDescription = this.calendarObjectInstance.description + NEW_LINE + NEW_LINE + url + NEW_LINE
				}

				this.$store.commit('changeDescription', {
					calendarObjectInstance: this.calendarObjectInstance,
					description: newDescription,
				})

				showSuccess(this.$t('calendar', 'Successfully appended link to description.'))
			} catch (err) {
				console.error(err)
				showError(this.$t('calendar', 'Error creating BBB room'))
			} finally {
				this.creatingBbbRoom = false
			}
		},
	},
}
</script>
