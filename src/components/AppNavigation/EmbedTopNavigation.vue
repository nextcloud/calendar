<template>
	<header id="embed-header" role="banner">
		<div class="embed-header__date-section">
			<AppNavigationHeaderDatePicker />
			<AppNavigationHeaderTodayButton />
		</div>
		<div class="embed-header__views-section">
			<AppNavigationHeaderViewButtons />
		</div>
		<!-- TODO have one button per calendar -->
		<div class="embed-header__share-section">
			<Actions>
				<template #icon>
					<Download :size="20" decorative />
				</template>
				<ActionLink v-for="calendar in subscriptions"
					:key="calendar.id"
					target="_blank"
					:href="calendar.url + '?export'">
					<template #icon>
						<Download :size="20" decorative />
					</template>
					{{ $t('calendar', 'Export {name}', { name: calendar.displayName || $t('calendar', 'Untitled calendar') }) }}
				</ActionLink>
			</Actions>
			<Actions>
				<template #icon>
					<CalendarBlank :size="20" decorative />
				</template>
				<ActionButton v-for="calendar in subscriptions"
					:key="calendar.id"
					@click.prevent.stop="copySubscriptionLink(calendar)">
					<template #icon>
						<CalendarBlank :size="20" decorative />
					</template>
					{{ $t('calendar', 'Subscribe to {name}', { name: calendar.displayName || $t('calendar', 'Untitled calendar') }) }}
				</ActionButton>
			</Actions>
		</div>
	</header>
</template>

<script>
import Actions from '@nextcloud/vue/dist/Components/Actions'
import ActionButton from '@nextcloud/vue/dist/Components/ActionButton'
import ActionLink from '@nextcloud/vue/dist/Components/ActionLink'
import {
	mapGetters,
} from 'vuex'
import { generateRemoteUrl } from '@nextcloud/router'
import {
	showSuccess,
	showError,
} from '@nextcloud/dialogs'

import AppNavigationHeaderDatePicker from './AppNavigationHeader/AppNavigationHeaderDatePicker.vue'
import AppNavigationHeaderTodayButton from './EmbedHeader/EmbedHeaderTodayButton.vue'
import AppNavigationHeaderViewButtons from './EmbedHeader/EmbedHeaderViewButtons.vue'

import CalendarBlank from 'vue-material-design-icons/CalendarBlank.vue'
import Download from 'vue-material-design-icons/Download.vue'

export default {
	name: 'EmbedTopNavigation',
	components: {
		AppNavigationHeaderDatePicker,
		AppNavigationHeaderTodayButton,
		AppNavigationHeaderViewButtons,
		Actions,
		ActionButton,
		ActionLink,
		CalendarBlank,
		Download,
	},
	computed: {
		...mapGetters({
			subscriptions: 'sortedSubscriptions',
		}),
	},
	methods: {
		async copySubscriptionLink(calendar) {
			const rootURL = generateRemoteUrl('dav')
			const url = new URL(calendar.url + '?export', rootURL)

			url.protocol = 'webcal:'

			// copy link for calendar to clipboard
			try {
				await this.$copyText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			}
		},
	},
}
</script>
