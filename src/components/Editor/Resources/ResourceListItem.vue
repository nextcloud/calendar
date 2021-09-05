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
		<AvatarParticipationStatus
			:attendee-is-organizer="false"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:is-resource="true"
			:avatar-link="commonName"
			:participation-status="resource.participationStatus"
			:organizer-display-name="organizerDisplayName"
			:common-name="commonName" />
		<div class="resource-list-item__displayname">
			{{ commonName }}
		</div>
		<div class="resource-list-item__actions">
			<Actions v-if="isViewedByOrganizer">
				<ActionButton
					icon="icon-delete"
					@click="removeResource">
					{{ $t('calendar', 'Remove resource') }}
				</ActionButton>
			</Actions>
		</div>
	</div>
</template>

<script>
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import AvatarParticipationStatus from '../AvatarParticipationStatus'
import { removeMailtoPrefix } from '../../../utils/attendee'

export default {
	name: 'ResourceListItem',
	components: {
		AvatarParticipationStatus,
		ActionButton,
		Actions,
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
	},
	methods: {
		/**
		 * Removes a resource from the event
		 */
		removeResource() {
			this.$emit('remove-resource', this.resource)
		},
	},
}
</script>

<style lang="scss" scoped>
.resource-list-item__displayname {
	margin-bottom: 17px;
}

.avatar-participation-status {
	margin-top: 5px;
}
</style>
