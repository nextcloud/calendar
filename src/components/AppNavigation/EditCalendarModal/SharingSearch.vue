<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- eslint-disable @nextcloud/vue/no-deprecated-props -->
<!-- FIXME: Using `user-select` is deprecated - use `NcSelectUsers` component instead -->

<template>
	<div class="sharing-search">
		<NcSelect
			:options="usersOrGroups"
			:searchable="true"
			:internal-search="false"
			:max-height="600"
			:placeholder="$t('calendar', 'Share with users or groups')"
			class="sharing-search__select"
			:class="{ showContent: inputGiven, 'icon-loading': isLoading }"
			:user-select="true"
			:filter-by="filterResults"
			:clearable="false"
			open-direction="above"
			track-by="user"
			label="displayName"
			@search="findSharee"
			@option:selected="shareCalendar">
			<template #no-options>
				<span>{{ $t('calendar', 'No users or groups') }}</span>
			</template>
			<template #option="sharee">
				<div class="share-item">
					<AccountMultiple v-if="sharee.isGroup" :size="20" class="share-item__group-icon" />
					<AccountGroupIcon v-else-if="sharee.isCircle" :size="20" class="share-item__team-icon" />
					<NcAvatar v-else :user="sharee.userId" :display-name="sharee.displayName" />

					<div class="share-item__label">
						{{ sharee.displayName }}
						<p>
							{{ sharee.email }}
						</p>
					</div>
				</div>
			</template>
		</NcSelect>
	</div>
</template>

<script>
import HttpClient from '@nextcloud/axios'
import { loadState } from '@nextcloud/initial-state'
import { generateOcsUrl } from '@nextcloud/router'
import { NcAvatar, NcSelect } from '@nextcloud/vue'
import debounce from 'debounce'
import { mapStores } from 'pinia'
import AccountGroupIcon from 'vue-material-design-icons/AccountGroup.vue'
import AccountMultiple from 'vue-material-design-icons/AccountMultiple.vue'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import useCalendarsStore from '../../../store/calendars.js'
import usePrincipalsStore from '../../../store/principals.js'
import { urldecode } from '../../../utils/url.js'

export default {
	name: 'SharingSearch',
	components: {
		NcAvatar,
		AccountGroupIcon,
		AccountMultiple,
		NcSelect,
	},

	props: {
		calendar: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			isLoading: false,
			inputGiven: false,
			usersOrGroups: [],
		}
	},

	computed: {
		...mapStores(usePrincipalsStore, useCalendarsStore),

		/**
		 * True, if federated calendar shares are enabled on this server.
		 *
		 * @return {boolean}
		 */
		supportsFederatedCalendars() {
			return loadState('calendar', 'calendar_federation_enabled')
		},
	},

	methods: {
		/**
		 * Share calendar
		 *
		 * @param {object} data destructuring object
		 * @param {string} data.user the userId
		 * @param {string} data.displayName the displayName
		 * @param {string} data.uri the sharing principalScheme uri
		 * @param {boolean} data.isGroup is this a group ?
		 * @param {boolean} data.isCircle is this a circle-group ?
		 * @param {boolean} data.isRemoteUser is this a remote user (on a federated instance)?
		 */
		shareCalendar({ user, displayName, uri, isGroup, isCircle, isRemoteUser }) {
			this.calendarsStore.shareCalendar({
				calendar: this.calendar,
				user,
				displayName,
				uri,
				isGroup,
				isCircle,
				isRemoteUser,
			})
		},

		/**
		 * Function to filter results in NcSelect
		 *
		 * @param {object} option The option object returned by the remote search
		 * @param {string} label The label value (displayName) for the option
		 * @param {string} search The current search string entered by the user
		 */
		filterResults(option, label, search) {
			// Allow all when no search text (NcSelect already restricts remote query)
			if (!search) {
				return true
			}
			const term = search.toLowerCase()
			// Match against provided label, email, or user identifier
			return (label && label.toLowerCase().includes(term))
				|| (option.email && option.email.toLowerCase().includes(term))
				|| (option.user && option.user.toLowerCase().includes(term))
		},

		/**
		 * Use the cdav client call to find matches to the query from the existing Users & Groups
		 *
		 * @param {string} query
		 */
		findSharee: debounce(async function(query) {
			const hiddenPrincipalSchemes = []
			const hiddenUrls = []
			this.calendar.shares.forEach((share) => {
				hiddenPrincipalSchemes.push(share.uri)
			})
			if (this.principalsStore.getCurrentUserPrincipal) {
				hiddenUrls.push(this.principalsStore.getCurrentUserPrincipal.url)
			}
			if (this.calendar.owner) {
				hiddenUrls.push(this.calendar.owner)
			}

			this.isLoading = true
			this.usersOrGroups = []

			if (query.length > 0) {
				const davPromise = this.findShareesFromDav(query, hiddenPrincipalSchemes, hiddenUrls)
				const ocsPromise = this.findShareesFromCircles(query, hiddenPrincipalSchemes)
				const remotePromise = this.findRemoteSharees(query)

				const [davResults, ocsResults, remoteResults] = await Promise.all([davPromise, ocsPromise, remotePromise])
				this.usersOrGroups = [
					...davResults,
					...ocsResults,
					...remoteResults,
				]

				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}
		}, 500),

		/**
		 *
		 * @param {string} query The search query
		 * @param {string[]} hiddenPrincipals A list of principals to exclude from search results
		 * @param {string[]} hiddenUrls A list of urls to exclude from search results
		 * @return {Promise<object[]>}
		 */
		async findShareesFromDav(query, hiddenPrincipals, hiddenUrls) {
			let results
			try {
				results = await principalPropertySearchByDisplaynameOrEmail(query)
			} catch (error) {
				return []
			}

			return results.reduce((list, result) => {
				if (['ROOM', 'RESOURCE'].includes(result.calendarUserType)) {
					return list
				}

				const isGroup = result.calendarUserType === 'GROUP'

				// TODO: Why do we have to decode those two values?
				const user = urldecode(result[isGroup ? 'groupId' : 'userId'])
				const decodedPrincipalScheme = urldecode(result.principalScheme)

				if (hiddenPrincipals.includes(decodedPrincipalScheme)) {
					return list
				}
				if (hiddenUrls.includes(result.url)) {
					return list
				}

				// Don't show resources and rooms
				if (!['GROUP', 'INDIVIDUAL'].includes(result.calendarUserType)) {
					return list
				}

				list.push({
					user,
					displayName: result.displayname,
					uri: decodedPrincipalScheme,
					isGroup,
					isCircle: false,
					isRemoteUser: false,
					isNoUser: isGroup,
					search: query,
					email: result.email,
				})
				return list
			}, [])
		},

		/**
		 * Search for circles (teams) matching the query.
		 *
		 * @param {string} query The search query
		 * @param {string[]} hiddenPrincipals A list of principals to exclude from search results
		 * @return {Promise<object[]>}
		 */
		async findShareesFromCircles(query, hiddenPrincipals) {
			let results
			try {
				results = await HttpClient.get(generateOcsUrl('apps/files_sharing/api/v1/') + 'sharees', {
					params: {
						format: 'json',
						search: query,
						perPage: 200,
						itemType: 'principals',
					},
				})
			} catch (error) {
				return []
			}

			if (results.data.ocs.meta.status === 'failure') {
				return []
			}

			let circles = []
			if (Array.isArray(results.data.ocs.data.circles)) {
				circles = circles.concat(results.data.ocs.data.circles)
			}
			if (Array.isArray(results.data.ocs.data.exact.circles)) {
				circles = circles.concat(results.data.ocs.data.exact.circles)
			}

			if (circles.length === 0) {
				return []
			}

			return circles.filter((circle) => {
				return !hiddenPrincipals.includes('principal:principals/circles/' + circle.value.shareWith)
			}).map((circle) => ({
				user: circle.label,
				displayName: circle.label,
				icon: 'icon-circle',
				uri: 'principal:principals/circles/' + circle.value.shareWith,
				isGroup: false,
				isCircle: true,
				isRemoteUser: false,
				isNoUser: true,
				search: query,
			}))
		},

		/**
		 *
		 * @param {string} query The search query
		 * @return {Promise<object[]>}
		 */
		async findRemoteSharees(query) {
			if (!this.supportsFederatedCalendars) {
				return []
			}

			let results
			try {
				results = await HttpClient.get(generateOcsUrl('apps/files_sharing/api/v1/') + 'sharees', {
					params: {
						format: 'json',
						search: query,
						perPage: 200,
						itemType: 'calendar',
						shareType: [4, 6, 9],
						lookup: false,
					},
				})
			} catch (error) {
				return []
			}

			if (results.data.ocs.meta.status === 'failure') {
				return []
			}

			const remoteUsers = []
			if (Array.isArray(results.data.ocs.data.remotes)) {
				remoteUsers.push(...results.data.ocs.data.remotes)
			}
			if (Array.isArray(results.data.ocs.data.exact.remotes)) {
				remoteUsers.push(...results.data.ocs.data.exact.remotes)
			}
			return remoteUsers.map((user) => ({
				user: user.uuid,
				displayName: `${user.name}@${user.value.server}`,
				icon: 'icon-circle',
				uri: `principal:principals/remote-users/${btoa(user.value.shareWith)}`,
				isGroup: false,
				isCircle: false,
				isRemoteUser: true,
				isNoUser: false,
				search: query,
			}))
		},
	},
}
</script>

<style lang="scss" scoped>
.sharing-search {
	display: flex;

	&__select {
		flex: 1 auto;
	}
}

.share-item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;

&__group-icon,
&__team-icon {
		width: 32px;
		height: 32px;
		border-radius: 16px;
		color: white;
		background-color: var(--color-text-maxcontrast);
	}

	&__label {
		flex: 1 auto;
		flex-direction: column;

		p {
			color: var(--color-text-lighter);
			line-height: 1;
		}
	}
}
</style>
