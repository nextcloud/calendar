<!--
  - @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @author Richard Steinmetz <richard@steinmetz.cloud>
  -
  - @license AGPL-3.0-or-later
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
		<NcSelect class="resource-search__multiselect"
			:options="matches"
			:searchable="true"
			:max-height="600"
			:placeholder="placeholder"
			:class="{ 'showContent': inputGiven, 'icon-loading': isLoading }"
			input-id="email"
			label="displayName"
			:clearable="false"
			@search="findResources"
			@input="addResource">
			<template #option="option">
				<div class="resource-search-list-item">
					<Avatar :disable-tooltip="true"
						:display-name="option.displayName" />
					<div class="resource-search-list-item__label resource-search-list-item__label--single-email">
						<div>
							{{ option.displayName }}
							<span v-if="!isAvailable"
								class="resource-search-list-item__label__availability">
								({{ formatAvailability(option.isAvailable) }})
							</span>
						</div>
						<div :name="option.subLine">
							{{ option.subLine }}
						</div>
					</div>
				</div>
			</template>
		</NcSelect>

		<template>
			<div class="resource-search__capacity">
				<ResourceSeatingCapacity :value.sync="capacity" />
				<Actions class="resource-search__capacity__actions">
					<ActionCheckbox :checked.sync="isAvailable">
						<!-- Translators room or resource is not yet booked -->
						{{ $t('calendar', 'Available') }}
					</ActionCheckbox>
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
			<ResourceRoomType :value.sync="roomType" />
		</template>
	</div>
</template>

<script>
import {
	NcAvatar as Avatar,
	NcActions as Actions,
	NcActionCheckbox as ActionCheckbox,
	NcSelect,
} from '@nextcloud/vue'
import { checkResourceAvailability } from '../../../services/freeBusyService.js'
import debounce from 'debounce'
import logger from '../../../utils/logger.js'
import { advancedPrincipalPropertySearch } from '../../../services/caldavService.js'
import ResourceSeatingCapacity from './ResourceSeatingCapacity.vue'
import ResourceRoomType from './ResourceRoomType.vue'

export default {
	name: 'ResourceListSearch',
	components: {
		Avatar,
		NcSelect,
		ResourceSeatingCapacity,
		Actions,
		ActionCheckbox,
		ResourceRoomType,
	},
	props: {
		alreadyInvitedEmails: {
			type: Array,
			required: true,
		},
		calendarObjectInstance: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			isLoading: false,
			inputGiven: false,
			matches: [],
			capacity: NaN,
			roomType: '',
			isAvailable: true,
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
				query.capacity = this.capacity
				query.features = this.features
				query.roomType = this.roomType
				results = await advancedPrincipalPropertySearch(query)
			} catch (error) {
				logger.debug('Could not find resources', { error })
				return []
			}

			// Build options
			let options = results
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
					const subLineData = []
					if (principal.roomSeatingCapacity) {
						subLineData.push(this.$n('calendar', '{seatingCapacity} seat', '{seatingCapacity} seats', principal.roomSeatingCapacity, {
							seatingCapacity: principal.roomSeatingCapacity,
						}))
					}
					if (principal.roomAddress) {
						subLineData.push(principal.roomAddress)
					}

					return {
						commonName: principal.displayname,
						email: principal.email,
						calendarUserType: principal.calendarUserType,
						displayName: principal.displayname ?? principal.email,
						subLine: subLineData.join(' - '),
						isAvailable: true,
						roomAddress: principal.roomAddress,
					}
				})

			// Check resource availability
			await checkResourceAvailability(
				options,
				this.$store.getters.getCurrentUserPrincipalEmail,
				this.calendarObjectInstance.eventComponent.startDate,
				this.calendarObjectInstance.eventComponent.endDate,
			)

			// Filter by availability
			if (this.isAvailable) {
				options = options.filter(option => option.isAvailable)
			}

			return options
		},
		/**
		 * Format availability of a search result
		 *
		 * @param {boolean} isAvailable The availability state
		 * @return {string} Human readable and localized availability
		 */
		formatAvailability(isAvailable) {
			if (isAvailable) {
				// TRANSLATORS room or resource is available due to not being booked yet
				return this.$t('calendar', 'available')
			}

			// TRANSLATORS room or resource is unavailable due to it being already booked
			return this.$t('calendar', 'unavailable')
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-search__multiselect {
	padding-bottom: 5px !important;
}
</style>
