<!--
  - @copyright Copyright (c) 2020 Georg Ehrke <oc.list@georgehrke.com>
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
	<Content app-name="calendar" :class="classNames">
		<AppNavigation v-if="!isEmbedded">
			<!-- Date Picker, View Buttons, Today Button -->
			<AppNavigationHeader :is-public="!isAuthenticatedUser" />
			<template #list>
				<AppNavigationSpacer />
				<!-- Calendar / Subscription List -->
				<CalendarList
					:is-public="!isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
				<CalendarListNew
					v-if="!loadingCalendars"
					:disabled="loadingCalendars" />
			</template>
			<!-- Settings and import -->
			<template #footer>
				<Settings
					v-if="isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
			</template>
		</AppNavigation>
		<EmbedTopNavigation v-if="isEmbedded" />
		<AppContent>
			<CalendarGrid
				:is-public="!isAuthenticatedUser" />
			<EmptyCalendar
				v-if="showEmptyCalendarScreen" />
		</AppContent>
		<!-- Edit modal -->
		<router-view v-if="!loadingCalendars" />
	</Content>
</template>

<script>
import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationSpacer from '@nextcloud/vue/dist/Components/AppNavigationSpacer'
import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import Content from '@nextcloud/vue/dist/Components/Content'
import { uidToHexColor } from '../utils/color.js'
import {
	initializeClientForPublicView,
	initializeClientForUserView,
} from '../services/caldavService.js'
import {
	dateFactory,
	getUnixTimestampFromDate,
} from '../utils/date.js'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import CalendarListNew from '../components/AppNavigation/CalendarList/CalendarListNew.vue'
import getTimezoneManager from '../services/timezoneDataProviderService'
import {
	mapGetters,
} from 'vuex'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'
import loadMomentLocalization from '../utils/moment.js'
import { loadState } from '@nextcloud/initial-state'
import CalendarGrid from '../components/CalendarGrid.vue'
import {
	showWarning,
} from '@nextcloud/dialogs'
import '@nextcloud/dialogs/styles/toast.scss'

export default {
	name: 'Calendar',
	components: {
		AppContent,
		AppNavigation,
		AppNavigationHeader,
		CalendarGrid,
		CalendarList,
		Content,
		EmptyCalendar,
		EmbedTopNavigation,
		Settings,
		AppNavigationSpacer,
		CalendarListNew,
	},
	data() {
		return {
			loadingCalendars: true,
			timeFrameCacheExpiryJob: null,
			showEmptyCalendarScreen: false,
		}
	},
	computed: {
		...mapGetters({
			timezoneId: 'getResolvedTimezone',
		}),
		isAuthenticatedUser() {
			return !this.isPublicShare && !this.isEmbedded
		},
		isPublicShare() {
			return this.$route.name.startsWith('Public')
		},
		isEmbedded() {
			return this.$route.name.startsWith('Embed')
		},
		classNames() {
			if (this.isEmbedded) {
				return 'app-calendar-public-embedded'
			}
			if (this.isPublicShare) {
				return 'app-calendar-public'
			}

			return null
		},
	},
	created() {
		this.timeFrameCacheExpiryJob = setInterval(() => {
			const timestamp = (getUnixTimestampFromDate(dateFactory()) - 60 * 10)
			const timeRanges = this.$store.getters.getAllTimeRangesOlderThan(timestamp)

			for (const timeRange of timeRanges) {
				this.$store.commit('removeTimeRange', {
					timeRangeId: timeRange.id,
				})
				this.$store.commit('deleteFetchedTimeRangeFromCalendar', {
					calendar: {
						id: timeRange.calendarId,
					},
					fetchedTimeRangeId: timeRange.id,
				})
			}
		}, 1000 * 60)
	},
	async beforeMount() {
		this.$store.commit('loadSettingsFromServer', {
			appVersion: loadState('calendar', 'app_version'),
			eventLimit: loadState('calendar', 'event_limit'),
			firstRun: loadState('calendar', 'first_run'),
			showWeekends: loadState('calendar', 'show_weekends'),
			showWeekNumbers: loadState('calendar', 'show_week_numbers'),
			skipPopover: loadState('calendar', 'skip_popover'),
			slotDuration: loadState('calendar', 'slot_duration'),
			talkEnabled: loadState('calendar', 'talk_enabled'),
			tasksEnabled: loadState('calendar', 'tasks_enabled'),
			timezone: loadState('calendar', 'timezone'),
			showTasks: loadState('calendar', 'show_tasks'),
		})
		this.$store.dispatch('initializeCalendarJsConfig')

		if (this.$route.name.startsWith('Public') || this.$route.name.startsWith('Embed')) {
			await initializeClientForPublicView()
			const tokens = this.$route.params.tokens.split('-')
			const calendars = await this.$store.dispatch('getPublicCalendars', { tokens })
			this.loadingCalendars = false

			if (calendars.length === 0) {
				this.showEmptyCalendarScreen = true
			}
		} else {
			await initializeClientForUserView()
			await this.$store.dispatch('fetchCurrentUserPrincipal')
			const calendars = await this.$store.dispatch('getCalendars')
			const owners = []
			calendars.forEach((calendar) => {
				if (owners.indexOf(calendar.owner) === -1) {
					owners.push(calendar.owner)
				}
			})
			owners.forEach((owner) => {
				this.$store.dispatch('fetchPrincipalByUrl', {
					url: owner,
				})
			})

			const writeableCalendarIndex = calendars.findIndex((calendar) => {
				return !calendar.readOnly
			})

			// No writeable calendars? Create a new one!
			if (writeableCalendarIndex === -1) {
				this.loadingCalendars = true
				await this.$store.dispatch('appendCalendar', {
					displayName: this.$t('calendars', 'Personal'),
					color: uidToHexColor(this.$t('calendars', 'Personal')),
					order: 0,
				})
			}

			this.loadingCalendars = false
		}
	},
	async mounted() {
		if (this.timezone === 'automatic' && this.timezoneId === 'UTC') {
			const { toastElement }
				= showWarning(this.$t('calendar', 'The automatic timezone detection determined your timezone to be UTC.\nThis is most likely the result of security measures of your web browser.\nPlease set your timezone manually in the calendar settings.'), { timeout: 60 })

			toastElement.classList.add('toast-calendar-multiline')
		}
		if (getTimezoneManager().getTimezoneForId(this.timezoneId) === null) {
			const { toastElement }
				= showWarning(this.$t('calendar', 'Your configured timezone ({timezoneId}) was not found. Falling back to UTC.\nPlease change your timezone in the settings and report this issue.', { timezoneId: this.timezoneId }), { timeout: 60 })

			toastElement.classList.add('toast-calendar-multiline')
		}

		this.loadMomentLocale()
	},
	methods: {
		/**
		 * Loads the locale data for moment.js
		 *
		 * @returns {Promise<void>}
		 */
		async loadMomentLocale() {
			const locale = await loadMomentLocalization()
			this.$store.commit('setMomentLocale', { locale })
		},
	},
}
</script>
