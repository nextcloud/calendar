<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
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
	<AppNavigationItem
		:loading="calendar.loading"
		:title="calendar.displayName || $t('calendar', 'Untitled calendar')"
		:menu-open.sync="menuOpen"
		@click.prevent.stop="toggleEnabled">
		<AppNavigationIconBullet
			v-if="calendar.enabled"
			slot="icon"
			:color="calendar.color"
			@click.prevent.stop="toggleEnabled" />

		<template slot="counter">
			<Avatar
				:user="owner"
				:is-guest="true"
				:disable-tooltip="true"
				:disable-menu="true" />
		</template>

		<template slot="actions">
			<ActionButton
				v-if="showCopySubscriptionLinkLabel"
				icon="icon-calendar-dark"
				@click.prevent.stop="copySubscriptionLink">
				{{ $t('calendar', 'Copy subscription link') }}
			</ActionButton>
			<ActionText
				v-if="showCopySubscriptionLinkSpinner"
				icon="icon-loading-small">
				{{ $t('calendar', 'Copying link ...') }}
			</ActionText>
			<ActionText
				v-if="showCopySubscriptionLinkSuccess"
				icon="icon-calendar-dark">
				{{ $t('calendar', 'Copied link') }}
			</ActionText>
			<ActionText
				v-if="showCopySubscriptionLinkError"
				icon="icon-calendar-dark">
				{{ $t('calendar', 'Could not copy link') }}
			</ActionText>

			<ActionLink
				icon="icon-download"
				target="_blank"
				:href="downloadUrl"
				:title="$t('calendar', 'Download')" />
		</template>
	</AppNavigationItem>
</template>

<script>
import {
	Avatar,
	ActionButton,
	ActionLink,
	ActionText,
	AppNavigationIconBullet,
	AppNavigationItem
} from '@nextcloud/vue'
import {
	generateRemoteUrl
} from '@nextcloud/router'

export default {
	name: 'PublicCalendarListItem',
	components: {
		Avatar,
		ActionButton,
		ActionLink,
		ActionText,
		AppNavigationIconBullet,
		AppNavigationItem
	},
	props: {
		calendar: {
			type: Object,
			required: true
		}
	},
	data: function() {
		return {
			// copy subscription link:
			showCopySubscriptionLinkLabel: true,
			showCopySubscriptionLinkSpinner: false,
			showCopySubscriptionLinkSuccess: false,
			showCopySubscriptionLinkError: false,
			// Status of actions menu:
			menuOpen: false
		}
	},
	computed: {
		/**
		 * Download url of the calendar
		 *
		 * @returns {String}
		 */
		downloadUrl() {
			return this.calendar.url + '?export'
		},
		/**
		 * TODO: this should use principals and principal.userId
		 *
		 * @returns {String}
		 */
		owner() {
			const lastIndex = this.calendar.owner.lastIndexOf('dav/principals/users/')
			if (lastIndex === -1) {
				return null
			}

			// 'dav/principals/users/'.length => 21
			let userId = this.calendar.owner.substr(lastIndex + 21)
			if (userId.endsWith('/')) {
				return userId.slice(0, -1)
			}

			return userId
		}
	},
	methods: {
		copySubscriptionLink() {
			this.menuOpen = true
			this.showCopySubscriptionLinkLabel = false
			this.showCopySubscriptionLinkSpinner = true
			this.showCopySubscriptionLinkSuccess = false
			this.showCopySubscriptionLinkError = false

			const rootURL = generateRemoteUrl('dav')
			let url = new URL(this.calendar.url + '?export', rootURL)

			if (url.protocol === 'http:') {
				url.protocol = 'webcal:'
			}
			if (url.protocol === 'https:') {
				url.protocol = 'webcals:'
			}

			// copy link for calendar to clipboard
			this.$copyText(url)
				.then(e => {
					this.menuOpen = true
					this.showCopySubscriptionLinkLabel = false
					this.showCopySubscriptionLinkSpinner = false
					this.showCopySubscriptionLinkSuccess = true
					this.showCopySubscriptionLinkError = false

					this.$toast.success(this.$t('calendar', 'Calendar link copied to clipboard.'))
				})
				.catch(e => {
					this.menuOpen = true
					this.showCopySubscriptionLinkLabel = false
					this.showCopySubscriptionLinkSpinner = false
					this.showCopySubscriptionLinkSuccess = false
					this.showCopySubscriptionLinkError = true

					this.$toast.error(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
				}).then(() => {
					setTimeout(() => {
						this.showCopySubscriptionLinkLabel = true
						this.showCopySubscriptionLinkSpinner = false
						this.showCopySubscriptionLinkSuccess = false
						this.showCopySubscriptionLinkError = false
					}, 2000)
				})
		},
		toggleEnabled() {
			this.$store.commit('toggleCalendarEnabled', {
				calendar: this.calendar
			})
		}
	}
}
</script>
