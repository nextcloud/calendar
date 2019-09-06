<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
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
	<div>
		<invitees-list-search />
		<organizer-list-item :organizer="organizer" />
		<invitees-list-item
			v-for="invitee in inviteesWithoutOrganizer"
			:key="invitee.email"
			:attendee="invitee"
			:organizer-display-name="organizerDisplayName"
			@removeAttendee="removeAttendee"
		/>
	</div>
</template>

<script>
import InviteesListSearch from './InviteesListSearch'
import InviteesListItem from './InviteesListItem'
import OrganizerListItem from './OrganizerListItem'

export default {
	name: 'InviteesList',
	components: {
		InviteesListItem,
		InviteesListSearch,
		OrganizerListItem
	},
	props: {
		isReadOnly: {
			type: Boolean,
			required: true
		},
		eventComponent: {
			validator: prop => typeof prop === 'object' || prop === null,
			required: true
		}
	},
	data() {
		return {
			invitees: [],
			organizer: null
		}
	},
	computed: {
		inviteesWithoutOrganizer() {
			if (!this.organizer) {
				return this.invitees
			}

			console.debug(this.organizer.email)
			return this.invitees.filter((i) => i.email !== this.organizer.email)
		},
		organizerDisplayName() {
			if (!this.organizer) {
				return ''
			}

			if (this.organizer.commonName) {
				return this.organizer.commonName
			}

			if (this.organizer.email.startsWith('mailto:')) {
				return this.organizer.email.substr(7)
			}

			return this.organizer.email
		}
	},
	watch: {
		eventComponent() {
			this.initValue()
		}
	},
	methods: {
		initValue() {
			this.organizer = this.eventComponent.getFirstProperty('organizer')
			this.invitees = this.eventComponent.getAttendeeList()
		},
		removeAttendee(attendee) {
			this.eventComponent.removeAttendee(attendee)
			this.invitees = this.eventComponent.getAttendeeList()
		}
	}
}
</script>

<style scoped>

</style>
