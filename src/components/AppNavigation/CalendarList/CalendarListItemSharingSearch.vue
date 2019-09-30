<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @author Georg Ehrke <oc.list@georgehrke.com>
  -
  - @license GNU AGPL version 3 or any later version
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
	<li class="app-navigation-entry__multiselect">
		<multiselect
			id="users-groups-search"
			:options="usersOrGroups"
			:searchable="true"
			:internal-search="false"
			:max-height="600"
			:show-no-results="true"
			:placeholder="$t('calendar', 'Share with users or groups')"
			:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
			:user-select="true"
			open-direction="bottom"
			track-by="user"
			label="user"
			@search-change="findSharee"
			@input="shareCalendar">
			<span slot="noResult">{{ $t('calendar', 'No users or groups') }}</span>
		</multiselect>
	</li>
</template>

<script>
import client from '../../../services/caldavService.js'
import debounce from 'debounce'

export default {
	name: 'CalendarListItemSharingSearch',
	props: {
		calendar: {
			type: Object,
			required: true
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			usersOrGroups: []
		}
	},
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
			this.$store.dispatch('shareCalendar', {
				calendar: this.calendar,
				user,
				displayName,
				uri,
				isGroup
			})
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {String} query
		 */
		findSharee: debounce(async function(query) {
			const hiddenPrincipalSchemes = []
			this.calendar.shares.forEach((share) => {
				hiddenPrincipalSchemes.push(share.uri)
			})

			const hiddenUrls = []
			if (this.$store.getters.getCurrentUserPrincipal) {
				hiddenUrls.push(this.$store.getters.getCurrentUserPrincipal.url)
			}
			if (this.calendar.owner) {
				hiddenUrls.push(this.calendar.owner)
			}

			this.isLoading = true
			this.usersOrGroups = []
			if (query.length > 0) {
				const results = await client.principalPropertySearchByDisplayname(query)
				this.usersOrGroups = results.reduce((list, result) => {
					if (hiddenPrincipalSchemes.includes(result.principalScheme)) {
						return list
					}
					if (hiddenUrls.includes(result.url)) {
						return list
					}

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
