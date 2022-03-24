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
	<AppNavigationItem :title="title"
		@click="openUserSettings">
		<AlertCircleIcon slot="icon" :size="20" decorative />
	</AppNavigationItem>
</template>

<script>
import AppNavigationItem from '@nextcloud/vue/dist/Components/AppNavigationItem'
import AlertCircleIcon from 'vue-material-design-icons/AlertCircle'
import { generateUrl } from '@nextcloud/router'

export default {
	name: 'NoEmailAddressWarning',
	components: {
		AppNavigationItem,
		AlertCircleIcon,
	},
	computed: {
		title() {
			return this.t('calendar', 'To configure appointments, add your email address in personal settings.')
		},
	},
	methods: {
		openUserSettings() {
			const url = generateUrl('settings/user')
			window.open(url, '_blank').focus()
		},
	},
}
</script>

<style lang="scss" scoped>
::v-deep {
	.app-navigation-entry-link {
		align-items: center;
		line-height: unset;
		white-space: unset;
	}

	.app-navigation-entry__title {
		overflow: unset !important;
		white-space: unset !important;
		text-overflow: unset !important;
	}
}
</style>
