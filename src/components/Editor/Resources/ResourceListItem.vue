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
	<div class="resource-list-item">
		<AvatarParticipationStatus :attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="true"
			:is-suggestion="isSuggestion"
			:avatar-link="commonName"
			:participation-status="participationStatus"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName" />
		<div class="resource-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="resource-list-item__actions">
			<Actions v-if="isViewedByOrganizer && isSuggestion">
				<ActionButton @click="addSuggestion">
					<template #icon>
						<Plus :size="20" decorative />
					</template>
					{{ $t('calendar', 'Add resource') }}
				</ActionButton>
			</actions>
			<Actions v-else-if="isViewedByOrganizer">
				<ActionCaption v-if="seatingCapacity"
					:title="seatingCapacity" />
				<ActionCaption v-if="roomType"
					:title="roomType" />
				<ActionCaption v-if="hasProjector"
					:title="$t('calendar', 'Has a projector')" />
				<ActionCaption v-if="hasWhiteboard"
					:title="$t('calendar', 'Has a whiteboard')" />
				<ActionCaption v-if="isAccessible"
					:title="$t('calendar', 'Wheelchair accessible')" />
				<ActionSeparator v-if="seatingCapacity || roomType || hasProjector || hasWhiteboard || isAccessible" />
				<ActionButton @click="removeResource">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ $t('calendar', 'Remove resource') }}
				</ActionButton>
			</actions>
		</div>
	</div>
</template>

<script>
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionCaption from '@nextcloud/vue/dist/Components/ActionCaption'
import ActionSeparator from '@nextcloud/vue/dist/Components/ActionSeparator'
import AvatarParticipationStatus from '../AvatarParticipationStatus'
import { removeMailtoPrefix } from '../../../utils/attendee'
import logger from '../../../utils/logger'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService'
import { formatRoomType } from '../../../models/resourceProps'

import Delete from 'vue-material-design-icons/Delete.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

export default {
	name: 'ResourceListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		ActionCaption,
		ActionSeparator,
		Actions,
		Delete,
		Plus,
	},
	props: {
		resource: {
			type: Object,
			required: true,
		},
		organizerDisplayName: {
			type: String,
			required: true,
		},
		isReadOnly: {
			type: Boolean,
			required: true,
		},
		isSuggestion: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			principal: null,
		}
	},
	computed: {
		commonName() {
			if (this.resource.commonName) {
				return this.resource.commonName
			}

			if (this.resource.uri) {
				return removeMailtoPrefix(this.resource.uri)
			}

			return this.resource.uri
		},
		isViewedByOrganizer() {
			// TODO: check if also viewed by organizer
			return !this.isReadOnly
		},
		isAccessible() {
			return this.hasFeature('WHEELCHAIR-ACCESSIBLE')
		},
		hasProjector() {
			return this.hasFeature('PROJECTOR')
		},
		hasWhiteboard() {
			return this.hasFeature('WHITEBOARD')
		},
		seatingCapacity() {
			const seatingCapacity = this.principal?.roomSeatingCapacity
			if (!seatingCapacity) {
				return null
			}

			return this.$n(
				'calendar',
				'{seatingCapacity} seat',
				'{seatingCapacity} seats',
				seatingCapacity, {
					seatingCapacity,
				})
		},
		roomType() {
			const roomType = this.principal?.roomType
			return formatRoomType(roomType) ?? roomType
		},
		participationStatus() {
			if (this.isSuggestion) {
				return ''
			}

			return this.resource.participationStatus
		},
	},
	watch: {
		async resource() {
			await this.fetchPrincipal()
		},
	},
	async mounted() {
		await this.fetchPrincipal()
	},
	methods: {
		/**
		 * Add this suggestions to the event
		 */
		addSuggestion() {
			this.$emit('add-suggestion', this.resource)
		},
		/**
		 * Removes a resource from the event
		 */
		removeResource() {
			this.$emit('remove-resource', this.resource)
		},
		/**
		 * Check if this resource has a feature
		 *
		 * @param {string} feature The name of the feature
		 * @return {boolean} True if this resource has the given feature
		 */
		hasFeature(feature) {
			const features = this.principal?.roomFeatures?.split(',') ?? []
			return !!features.find(featureToCheck => featureToCheck === feature)
		},
		/**
		 * Try to fetch the principal belonging to this resource
		 */
		async fetchPrincipal() {
			const uri = removeMailtoPrefix(this.resource.uri)
			let principals = await principalPropertySearchByDisplaynameOrEmail(uri)
			principals = principals.filter(principal => removeMailtoPrefix(principal.email) === uri)
			if (principals.length === 0) {
				logger.debug('No principal for resource found', {
					uri: this.resource.uri,
				})
				this.principal = null
				return
			} else if (principals.length > 1) {
				logger.debug('More than one principal for resource found', {
					uri: this.resource.uri,
					principals,
				})
			}

			this.principal = principals[0]
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-list-item__displayname {
	margin-bottom: 17px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.avatar-participation-status {
	margin-top: 5px;
}
</style>
