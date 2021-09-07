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
	<div class="resource-search">
		<div
			v-if="hasAdvancedFilters"
			class="resource-search__filter">
			<ResourceSeatingCapacity :value.sync="capacity" />
			<Actions class="resource-search__filter__actions">
				<ActionCheckbox :checked.sync="hasProjector">
					{{ $t('calendar', 'Projector') }}
				</ActionCheckbox>
				<ActionCheckbox :checked.sync="hasWhiteboard">
					{{ $t('calendar', 'Whiteboard') }}
				</ActionCheckbox>
				<ActionCheckbox :checked.sync="isAccessible">
					{{ $t('calendar', 'Wheelchair accessible') }}
				</ActionCheckbox>
			</Actions>
		</div>

		<Multiselect
			class="resource-search__multiselect"
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
	</div>
</template>

<script>
import Avatar from '@nextcloud/vue/dist/Components/Avatar'
import Multiselect from '@nextcloud/vue/dist/Components/Multiselect'
import debounce from 'debounce'
import logger from '../../../utils/logger'
import { principalPropertySearchByDisplaynameAndCapacityAndFeatures } from '../../../services/caldavService'
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionCheckbox from '@nextcloud/vue/dist/Components/ActionCheckbox'
import ResourceSeatingCapacity from './ResourceSeatingCapacity'

export default {
	name: 'ResourceListSearch',
	components: {
		Avatar,
		Multiselect,
		ResourceSeatingCapacity,
		Actions,
		ActionCheckbox,
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
			capacity: NaN,
			isAccessible: false,
			hasProjector: false,
			hasWhiteboard: false,
		}
	},
	computed: {
		placeholder() {
			return this.$t('calendar', 'Search for resources or rooms')
		},
		noResult() {
			return this.$t('calendar', 'No match found')
		},
		hasAdvancedFilters() {
			// TODO: Remove me when Calendar doesn't support server < 23
			return parseInt(OC.config.version.split('.')[0]) >= 23
		},
		features() {
			const features = []
			if (this.isAccessible) {
				features.push('WHEELCHAIR-ACCESSIBLE')
			}
			if (this.hasProjector) {
				features.push('PROJECTOR')
			}
			if (this.hasWhiteboard) {
				features.push('WHITEBOARD')
			}
			return features
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
		async findResourcesFromDAV(input) {
			let results
			try {
				const query = { displayName: input }
				if (this.hasAdvancedFilters) {
					query.capacity = this.capacity
					query.features = this.features
				}
				results = await principalPropertySearchByDisplaynameAndCapacityAndFeatures(query)
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
