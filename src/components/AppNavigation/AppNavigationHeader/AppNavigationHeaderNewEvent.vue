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
	<button v-shortkey="['c']"
		class="button primary new-event"
		@click="newEvent"
		@shortkey="newEvent">
		<Plus :size="20" />
		{{ $t('calendar', 'New event') }}
	</button>
</template>

<script>
import Plus from 'vue-material-design-icons/Plus.vue'
export default {
	name: 'AppNavigationHeaderNewEvent',
	components: {
		Plus,
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
