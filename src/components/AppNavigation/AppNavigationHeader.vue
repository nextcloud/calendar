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
	<header class="app-navigation-header">
		<AppNavigationHeaderDatePicker />
		<div class="new-event-today-view-section">
			<AppNavigationHeaderNewEvent v-if="!isPublic" />
			<AppNavigationHeaderTodayButton />
			<AppNavigationHeaderViewMenu />
		</div>
	</header>
</template>

<script>
import AppNavigationHeaderDatePicker from './AppNavigationHeader/AppNavigationHeaderDatePicker.vue'
import AppNavigationHeaderTodayButton from './AppNavigationHeader/AppNavigationHeaderTodayButton.vue'
import AppNavigationHeaderNewEvent from './AppNavigationHeader/AppNavigationHeaderNewEvent.vue'
import AppNavigationHeaderViewMenu from './AppNavigationHeader/AppNavigationHeaderViewMenu.vue'

export default {
	name: 'AppNavigationHeader',
	components: {
		AppNavigationHeaderDatePicker,
		AppNavigationHeaderTodayButton,
		AppNavigationHeaderNewEvent,
		AppNavigationHeaderViewMenu,
	},
	props: {
		isPublic: {
			type: Boolean,
			required: true,
		},
	},
}
</script>
