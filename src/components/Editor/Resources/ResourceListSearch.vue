<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
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
	<Multiselect
		class="resource-search"
		:options="matches"
		:searchable="true"
		:internal-search="false"
		:max-height="600"
		:show-no-results="true"
		:show-no-options="false"
		:placeholder="placeholder"
		:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
		open-direction="bottom"
		track-by="email"
		label="displayName"
		@search-change="findResources"
		@select="addResource">
		<template #option="{ option }">
			<div class="resource-search-list-item">
				<Avatar
					:disable-tooltip="true"
					:display-name="option.displayName" />
				<div class="resource-search-list-item__label resource-search-list-item__label--single-email">
					<div>
						{{ option.displayName }}
					</div>
				</div>
			</div>
		</template>
	</Multiselect>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import debounce from 'debounce'
import logger from '../../../utils/logger'

export default {
	name: 'ResourceListSearch',
	components: {
		Avatar,
		Multiselect,
	},
	props: {
		alreadyInvitedEmails: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			matches: [],
		}
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Search for resources or rooms')
		},
		noResult() {
			return this.$t('calendar', 'No match found')
		},
	},
	methods: {
		findResources: debounce(async function(query) {
			this.isLoading = true
			let matches = []

			if (query.length > 0) {
				matches = await this.findResourcesFromDAV(query)
				this.isLoading = false
				this.inputGiven = true
			} else {
				this.inputGiven = false
				this.isLoading = false
			}

			this.matches = matches
		}, 500),
		addResource(selectedValue) {
			this.$emit('add-resource', selectedValue)
		},
		async findResourcesFromDAV(query) {
			let results
			try {
				results = await principalPropertySearchByDisplaynameOrEmail(query)
			} catch (error) {
				logger.debug('Could not find resources', { error })
				return []
			}

			return results
				.filter(principal => {
					if (!principal.email) {
						return false
					}

					if (this.alreadyInvitedEmails.includes(principal.email)) {
						return false
					}

					// Only include resources and rooms
					if (!['RESOURCE', 'ROOM'].includes(principal.calendarUserType)) {
						return false
					}

					return true
				})
				.map(principal => {
					return {
						commonName: principal.displayname,
						email: principal.email,
						calendarUserType: principal.calendarUserType,
						displayName: principal.displayname ?? principal.email,
					}
				})
		},
	},
}
</script>
