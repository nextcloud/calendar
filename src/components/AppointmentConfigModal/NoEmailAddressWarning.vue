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
	<AppNavigationItem :name="title"
		@click="openUserSettings">
		<template #icon>
			<AlertCircleIcon :size="20" />
		</template>
	</AppNavigationItem>
</template>

<script>
import { NcAppNavigationItem as AppNavigationItem } from '@nextcloud/vue'
import AlertCircleIcon from 'vue-material-design-icons/AlertCircle.vue'
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
:deep {
	.app-navigation-entry-link {
		align-items: center;
		line-height: unset !important;
		white-space: unset !important;
	}

	.app-navigation-entry__name {
		overflow: unset !important;
		white-space: unset !important;
		text-overflow: unset !important;
	}
}
</style>
