<!--
  - @copyright Copyright (c) 2019 Georg Ehrke <oc.list@georgehrke.com>
  -
  - @author Georg Ehrke <oc.list@georgehrke.com>
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
	<NcButton v-shortkey="['c']"
		class="button new-event"
		type="primary"
		@click="newEvent"
		@shortkey="newEvent">
		<template #icon>
			<Plus :size="20" />
		</template>
		{{ $t('calendar', 'New event') }}
	</NcButton>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus.vue'
import NcButton from '@nextcloud/vue/dist/Components/NcButton.js'

export default {
	name: 'AppNavigationHeaderNewEvent',
	components: {
		Plus,
		NcButton,
	},
	methods: {
		/**
		 * Opens the new event dialog
		 */
		newEvent() {
			this.$router.push(`/new/${this.$route.params.view}`)
		},
	},
}
</script>

<style scoped>
.button.primary.new-event {
	display: flex;
	align-items: center;
}
</style>
