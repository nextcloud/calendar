<!--
  - SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<div class="resource-list-item">
		<AvatarParticipationStatus :attendee-is-organizer="false"
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
					:name="seatingCapacity" />
				<ActionCaption v-if="roomType"
					:name="roomType" />
				<ActionCaption v-if="hasProjector"
					:name="$t('calendar', 'Has a projector')" />
				<ActionCaption v-if="hasWhiteboard"
					:name="$t('calendar', 'Has a whiteboard')" />
				<ActionCaption v-if="isAccessible"
					:name="$t('calendar', 'Wheelchair accessible')" />
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
import {
	NcActions as Actions,
	NcActionButton as ActionButton,
	NcActionCaption as ActionCaption,
	NcActionSeparator as ActionSeparator,
} from '@nextcloud/vue'
import AvatarParticipationStatus from '../AvatarParticipationStatus.vue'
import { removeMailtoPrefix } from '../../../utils/attendee.js'
import logger from '../../../utils/logger.js'
import { principalPropertySearchByDisplaynameOrEmail } from '../../../services/caldavService.js'
import { formatRoomType } from '../../../models/resourceProps.js'

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
