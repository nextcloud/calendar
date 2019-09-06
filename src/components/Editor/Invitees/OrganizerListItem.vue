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
	<div class="organizer-row">
		<avatar-participation-status
			:attendee-is-organizer="true"
			:avatar-link="avatarLink"
			:is-viewed-by-organizer="isViewedByOrganizer"
			:common-name="commonName"
			:organizer-display-name="commonName"
			participation-status="ACCEPTED"
		/>
		<div class="displayname">
			{{ commonName }}
		</div>
		<div class="organizer-hint">
			{{ organizerHint }}
		</div>
	</div>
</template>

<script>
import AvatarParticipationStatus from './AvatarParticipationStatus'

export default {
	name: 'OrganizerListItem',
	components: {
		AvatarParticipationStatus
	},
	props: {
		organizer: {
			required: true,
			validator: (p) => (typeof p === 'object' || p === null)
		}
	},
	data() {
		return {
			cn: null,
			uri: ''
		}
	},
	watch: {
		organizer: {
			handler(newOrganizer, oldOrganizer) {
				if (oldOrganizer) {
					oldOrganizer.unsubscribe(this.handler)
				}

				if (newOrganizer) {
					this.handler = () => this.updateValuesFromOrganizer()
					newOrganizer.subscribe(this.handler)
					this.handler()
				}
			},
			immediate: true
		}
	},
	computed: {
		avatarLink() {
			// return this.$store.getters.getAvatarForContact(this.uri) || this.commonName
			return this.commonName
		},
		commonName() {
			if (this.cn) {
				return this.cn
			}

			if (this.uri && this.uri.startsWith('mailto:')) {
				return this.uri.substr(7)
			}

			return this.uri
		},
		isViewedByOrganizer() {
			return true
		},
		organizerHint() {
			return t('calendar', '(organizer)')
		},
	},
	methods: {
		updateValuesFromOrganizer() {
			setTimeout(() => {
				console.debug('Settings values')
				this.cn = this.organizer.commonName
				this.uri = this.organizer.email
			}, 50)
		}
	}
}
</script>

<style>
.organizer-row {
	display: flex;
	align-items: center;
}

.displayname {
	margin-left: 8px;
}

.organizer-hint {
	color: var(--color-text-maxcontrast);
	font-weight: 300;
}
</style>
