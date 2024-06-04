<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
	<EmptyContent :name="$t('calendar', 'Public calendar does not exist')"
		:description="$t('calendar', 'Maybe the share was deleted or has expired?' )">
		<template #icon>
			<CalendarBlank :size="20" decorative />
		</template>
	</EmptyContent>
</template>

<script>
import { NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'

export default {
	name: 'EmptyCalendar',
	components: {
		EmptyContent,
		CalendarBlank,
	},
}
</script>
