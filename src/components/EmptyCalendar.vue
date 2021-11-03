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
	<EmptyContent>
		{{ $t('calendar', 'Public calendar does not exist') }}
		<template #icon>
			<CalendarBlank :size="20" decorative />
		</template>
		<template #desc>
			{{ $t('calendar', 'Maybe the share was deleted or has expired?' ) }}
		</template>
	</EmptyContent>
</template>

<script>
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'

export default {
	name: 'EmptyCalendar',
	components: {
		EmptyContent,
		CalendarBlank,
	},
}
</script>
