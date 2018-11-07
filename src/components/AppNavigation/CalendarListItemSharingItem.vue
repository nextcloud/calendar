<template>
	<li>
		<div v-if="isGroup" class="avatar icon-group" />
		<avatar v-else :user="userId" :display-name="displayName" />
		<span class="username">{{ displayName }}</span>
		<div class="sharingOptionsGroup">
			<span>
				<input :id="uid" :checked="writeable" :disabled="updatingSharee"
					type="checkbox" class="checkbox" @change="updatePermission">
				<label :for="uid">{{ label }}</label>
			</span>
			<a href="#" class="icon icon-delete" @click="unshare" />
		</div>
	</li>
</template>

<script>
import { Avatar } from 'nextcloud-vue'

export default {
	name: 'CalendarListItemSharingItem',
	components: {
		Avatar
	},
	props: {
		calendar: {
			type: Object,
			required: true
		},
		sharee: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			updatingSharee: false,
		}
	},
	computed: {
		label() {
			return t('calendar', 'Can edit')
		},
		displayName() {
			return this.sharee.displayName
		},
		isGroup() {
			return this.sharee.isGroup
		},
		userId() {
			return this.sharee.id
		},
		writeable() {
			return this.sharee.writeable
		},
		// generated id for this sharee
		uid() {
			return this.sharee.id + this.calendar.id + Math.floor(Math.random() * 1000)
		}
	},
	methods: {
		async unshare() {
			if (this.updatingSharee) {
				return false
			}

			this.updatingSharee = true
			this.$store.dispatch('unshareCalendar', { calendar: this.calendar, uri: this.sharee.uri })
				.then(() => {
					this.updatingSharee = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to change the unshare the calendar.'))

					this.updatingSharee = false
				})
		},
		async updatePermission() {
			if (this.updatingSharee) {
				return false
			}

			this.updatingSharee = true
			this.$store.dispatch('toggleCalendarShareWritable', { calendar: this.calendar, uri: this.sharee.uri })
				.then(() => {
					this.updatingSharee = false
				})
				.catch((error) => {
					console.error(error)
					OC.Notification.showTemporary(t('calendar', 'An error occurred, unable to change the permission of the share.'))

					this.updatingSharee = false
				})
		}
	}
}
</script>
