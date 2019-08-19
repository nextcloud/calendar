<template>
	<div class="sharing-section">
		<multiselect
			id="users-groups-search"
			:options="usersOrGroups"
			:searchable="true"
			:internal-search="false"
			:max-height="600"
			:show-no-results="true"
			:placeholder="placeholder"
			:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
			:user-select="true"
			open-direction="bottom"
			track-by="user"
			label="user"
			@search-change="findSharee"
			@input="shareCalendar"
		/>
		<!-- list of user or groups addressbook is shared with -->
		<ul v-if="calendar.shares.length > 0 || calendar.canBePublished" class="shareWithList">
			<calendar-list-item-sharing-publish-item :calendar="calendar " />
			<calendar-list-item-sharing-item v-for="sharee in calendar.shares" :key="sharee.uri"
				:sharee="sharee" :calendar="calendar"
			/>
		</ul>
	</div>
</template>

<script>
import client from '../../services/cdav'
import debounce from 'debounce'

import CalendarListItemSharingPublishItem from './CalendarListItemSharingPublishItem.vue'
import CalendarListItemSharingItem from './CalendarListItemSharingItem.vue'
import { Multiselect } from 'nextcloud-vue'

export default {
	name: 'CalendarListItemSharing',
	components: {
		CalendarListItemSharingItem,
		CalendarListItemSharingPublishItem,
		Multiselect
	},
	props: {
		calendar: {
			type: Object,
			default() {
				return {}
			}
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			usersOrGroups: []
		}
	},
	computed: {
		placeholder() {
			return t('calendar', 'Share with users or groups')
		},
		noResult() {
			return t('calendar', 'No users or groups')
		}
	},
	// mounted() {
	// 	// This ensures that the multiselect input is in focus as soon as the user clicks share
	// 	document.getElementById('users-groups-search').focus()
	// },
	methods: {
		/**
		 * Share calendar
		 *
		 * @param {Object} data destructuring object
		 * @param {string} data.user the userId
		 * @param {string} data.displayName the displayName
		 * @param {string} data.uri the sharing principalScheme uri
		 * @param {Boolean} data.isGroup is this a group ?
		 */
		shareCalendar({ user, displayName, uri, isGroup }) {
			const calendar = this.calendar
			this.$store.dispatch('shareCalendar', { calendar, user, displayName, uri, isGroup })
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {String} query
		 */
		findSharee: debounce(async function(query) {
			this.isLoading = true
			this.usersOrGroups = []
			if (query.length > 0) {
				const results = await client.principalPropertySearchByDisplayname(query)
				this.usersOrGroups = results.reduce((list, result) => {
					if	(['GROUP', 'INDIVIDUAL'].indexOf(result.calendarUserType) > -1) {
						const isGroup = result.calendarUserType === 'GROUP'
						list.push({
							user: result[isGroup ? 'groupId' : 'userId'],
							displayName: result.displayname,
							icon: isGroup ? 'icon-group' : 'icon-user',
							uri: result.principalScheme,
							isGroup
						})
					}
					return list
				}, [])
				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}
		}, 500)
	}
}

</script>
