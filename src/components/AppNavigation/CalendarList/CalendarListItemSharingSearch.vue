<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  - @copyright Copyright (c) 2019 Jakob Röhrl <jakob.roehrl@web.de>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
  - @author Jakob Röhrl <jakob.roehrl@web.de>
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
			@change="shareCalendar">
			<span slot="noResult">{{ $t('calendar', 'No users or groups') }}</span>
		</multiselect>
	</li>
</template>

<script>
import client from '../../../services/caldavService.js'
import HttpClient from '@nextcloud/axios'
import debounce from 'debounce'
import { generateOcsUrl } from '@nextcloud/router'

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
		 * @param {Boolean} data.isCircle is this a circle-group ?
		 */
		shareCalendar({ user, displayName, uri, isGroup, isCircle }) {
			this.$store.dispatch('shareCalendar', {
				calendar: this.calendar,
				user,
				displayName,
				uri,
				isGroup,
				isCircle
			})
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {String} query
		 */
		findSharee: debounce(async function(query) {
			const hiddenPrincipalSchemes = []
			const hiddenUrls = []
			this.calendar.shares.forEach((share) => {
				hiddenPrincipalSchemes.push(share.uri)
			})
			if (this.$store.getters.getCurrentUserPrincipal) {
				hiddenUrls.push(this.$store.getters.getCurrentUserPrincipal.url)
			}
			if (this.calendar.owner) {
				hiddenUrls.push(this.calendar.owner)
			}

			this.isLoading = true
			this.usersOrGroups = []

			if (query.length > 0) {
				const davPromise = this.findShareesFromDav(query, hiddenPrincipalSchemes, hiddenUrls)
				const ocsPromise = this.findShareesFromCircles(query, hiddenPrincipalSchemes, hiddenUrls)

				return Promise.all([davPromise, ocsPromise]).then(([davResults, ocsResults]) => {
					this.usersOrGroups = [
						...davResults,
						...ocsResults
					]

					this.isLoading = false
					this.inputGiven = true
				})
			} else {
				this.inputGiven = false
				this.isLoading = false
			}
		}, 500),
		/**
		 *
		 * @param {String} query The search query
		 * @param {String[]} hiddenPrincipals A list of principals to exclude from search results
		 * @param {String[]} hiddenUrls A list of urls to exclude from search results
		 * @returns {Promise<Object[]>}
		 */
		async findShareesFromDav(query, hiddenPrincipals, hiddenUrls) {
			return client.principalPropertySearchByDisplayname(query)
				.then(results => {
					return results.reduce((list, result) => {
						if (hiddenPrincipals.includes(result.principalScheme)) {
							return list
						}
						if (hiddenUrls.includes(result.url)) {
							return list
						}

						// Don't show resources and rooms
						if (!['GROUP', 'INDIVIDUAL'].includes(result.calendarUserType)) {
							return list
						}

						const isGroup = result.calendarUserType === 'GROUP'
						list.push({
							user: result[isGroup ? 'groupId' : 'userId'],
							displayName: result.displayname,
							icon: isGroup ? 'icon-group' : 'icon-user',
							uri: result.principalScheme,
							isGroup,
							isCircle: false,
							isNoUser: isGroup,
							search: query
						})
						return list
					}, [])
				})
		},
		/**
		 *
		 * @param {String} query The search query
		 * @param {String[]} hiddenPrincipals A list of principals to exclude from search results
		 * @param {String[]} hiddenUrls A list of urls to exclude from search results
		 * @returns {Promise<Object[]>}
		 */
		async findShareesFromCircles(query, hiddenPrincipals, hiddenUrls) {
			return HttpClient.get(generateOcsUrl('apps/files_sharing/api/v1') + 'sharees', {
				params: {
					format: 'json',
					search: query,
					perPage: 200,
					itemType: 'principals'
				}
			})
				.catch(() => [])
				.then(results => results.data.ocs.data.circles)
				.then(circles => {
					return circles.filter((circle) => {
						return !hiddenPrincipals.includes('principal:principals/circles/' + circle.value.shareWith)
					})
				})
				.then(circles => {
					return circles.map(circle => ({
						user: circle.label,
						displayName: circle.label,
						icon: 'icon-circle',
						uri: 'principal:principals/circles/' + circle.value.shareWith,
						isGroup: false,
						isCircle: true,
						isNoUser: true,
						search: query
					}))
				})

		}
	}
}
</script>
