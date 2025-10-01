<!--
  - SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<header :id="isWidget ? 'widget-header' : 'embed-header'" role="banner">
		<div :class="isWidget ? 'widget-header__date-section' : 'embed-header__date-section'">
			<AppNavigationHeaderDatePicker :is-widget="isWidget" />
			<AppNavigationHeaderTodayButton v-if="!isWidget" />
		</div>
		<div :class="isWidget ? 'widget-header__views-section' : 'embed-header__views-section'">
			<AppNavigationHeaderViewButtons :is-widget="isWidget" />
		</div>
		<!-- TODO have one button per calendar -->
		<div v-if="!isWidget" class="embed-header__share-section">
			<Actions>
				<template #icon>
					<Download :size="20" decorative />
				</template>
				<ActionLink
					v-for="calendar in calendarsStore.sortedSubscriptions"
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
				<ActionButton
					v-for="calendar in calendarsStore.sortedSubscriptions"
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
import {
	showError,
	showSuccess,
} from '@nextcloud/dialogs'
import { generateRemoteUrl } from '@nextcloud/router'
import {
	NcActionButton as ActionButton,
	NcActionLink as ActionLink,
	NcActions as Actions,
} from '@nextcloud/vue'
import { mapStores } from 'pinia'
import CalendarBlank from 'vue-material-design-icons/CalendarBlankOutline.vue'
import Download from 'vue-material-design-icons/TrayArrowDown.vue'
import AppNavigationHeaderDatePicker from './AppNavigationHeader/AppNavigationHeaderDatePicker.vue'
import AppNavigationHeaderTodayButton from './EmbedHeader/EmbedHeaderTodayButton.vue'
import AppNavigationHeaderViewButtons from './EmbedHeader/EmbedHeaderViewButtons.vue'
import useCalendarsStore from '../../store/calendars.js'

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

	props: {
		isWidget: {
			type: Boolean,
			default: false,
		},
	},

	computed: {
		...mapStores(useCalendarsStore),
	},

	methods: {
		async copySubscriptionLink(calendar) {
			const rootURL = generateRemoteUrl('dav')
			const url = new URL(calendar.url + '?export', rootURL)

			url.protocol = 'webcal:'

			// copy link for calendar to clipboard
			try {
				await navigator.clipboard.writeText(url)
				showSuccess(this.$t('calendar', 'Calendar link copied to clipboard.'))
			} catch (error) {
				console.debug(error)
				showError(this.$t('calendar', 'Calendar link could not be copied to clipboard.'))
			}
		},
	},
}
</script>

<style lang="scss">
#widget-header {
	top: 0;
	inset-inline-start: 0;
	height: 50px;
	width: 100%;
	box-sizing: border-box;
	background-color: var(--color-main-background);
	border-bottom: 1px solid var(--color-border);
	overflow: visible;
	z-index: 2000;
	display: flex;

	.widget-header__date-section{
		display: flex;
		gap: 5px;
	}

	.view-button-section {
		display: flex;

	}

	.datepicker-button-section {
		display: flex;
		&__datepicker-label {
			min-width: 150px;
		}
	}
}
</style>
