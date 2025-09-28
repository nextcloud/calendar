<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-list-item">
		<AvatarParticipationStatus
			:attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="true"
			:is-suggestion="isSuggestion"
			:avatar-link="commonName"
			:participation-status="participationStatus"
			:schedule-status="scheduleStatus"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName" />
		<div class="resource-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="resource-list-item__actions">
			<NcActions v-if="isViewedByOrganizer && isSuggestion">
				<NcActionButton @click="addSuggestion">
					<template #icon>
						<Plus :size="20" decorative />
					</template>
					{{ $t('calendar', 'Add resource') }}
				</NcActionButton>
			</NcActions>
			<NcActions v-else-if="isViewedByOrganizer">
				<NcActionCaption
					v-if="seatingCapacity"
					:name="seatingCapacity" />
				<NcActionCaption
					v-if="roomType"
					:name="roomType" />
				<NcActionCaption
					v-if="hasProjector"
					:name="$t('calendar', 'Has a projector')" />
				<NcActionCaption
					v-if="hasWhiteboard"
					:name="$t('calendar', 'Has a whiteboard')" />
				<NcActionCaption
					v-if="isAccessible"
					:name="$t('calendar', 'Wheelchair accessible')" />
				<NcActionSeparator v-if="seatingCapacity || roomType || hasProjector || hasWhiteboard || isAccessible" />
				<NcActionButton @click="removeResource">
					<template #icon>
						<Delete :size="20" decorative />
					</template>
					{{ $t('calendar', 'Remove resource') }}
				</NcActionButton>
			</NcActions>
		</div>
	</div>
</template>

<script>
import {
	NcActionButton,
	NcActionCaption,
	NcActions,
	NcActionSeparator,
} from '@nextcloud/vue'
import Plus from 'vue-material-design-icons/Plus.vue'
import Delete from 'vue-material-design-icons/TrashCanOutline.vue'
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import { formatRoomType } from '../../../models/resourceProps.js'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import { removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'

export default {
	name: 'ResourceListItem',
	components: {
		AvatarParticipationStatus,
		NcActionButton,
		NcActionCaption,
		NcActionSeparator,
		NcActions,
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

		isViewedByOrganizer: {
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
				seatingCapacity,
				{
					seatingCapacity,
				},
			)
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

		scheduleStatus() {
			return this.resource.attendeeProperty?.getParameterFirstValue('SCHEDULE-STATUS') ?? ''
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
			return !!features.find((featureToCheck) => featureToCheck === feature)
		},

		/**
		 * Try to fetch the principal belonging to this resource
		 */
		async fetchPrincipal() {
			const uri = removeMailtoPrefix(this.resource.uri)
			let principals = await principalPropertySearchByDisplaynameOrEmail(uri)
			principals = principals.filter((principal) => removeMailtoPrefix(principal.email) === uri)
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
