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
		<AppNavigation v-if="!isEmbedded && !showEmptyCalendarScreen">
			<!-- Date Picker, View Buttons, Today Button -->
			<AppNavigationHeader :is-public="!isAuthenticatedUser" />
			<template #list>
				<AppNavigationSpacer />

				<!-- Calendar / Subscription List -->
				<CalendarList :is-public="!isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
				<CalendarListNew v-if="!loadingCalendars && isAuthenticatedUser"
					:disabled="loadingCalendars" />

				<!-- Appointment Configuration List -->
				<template v-if="hasAppointmentsFeature && isAuthenticatedUser">
					<AppNavigationSpacer />
					<AppointmentConfigList />
				</template>

				<!-- Trashbin -->
				<Trashbin v-if="hasTrashBin" />
			</template>
			<!-- Settings and import -->
			<template #footer>
				<Settings v-if="isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
			</template>
		</AppNavigation>
		<EmbedTopNavigation v-if="isEmbedded" />
		<AppContent>
			<CalendarGrid v-if="!showEmptyCalendarScreen"
				:is-authenticated-user="isAuthenticatedUser" />
			<EmptyCalendar v-else />
		</AppContent>
		<!-- Edit modal -->
		<router-view />
	</Content>
</template>

<script>
// Import vue components
import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationSpacer from '@nextcloud/vue/dist/Components/AppNavigationSpacer'
import AppContent from '@nextcloud/vue/dist/Components/AppContent'
import Content from '@nextcloud/vue/dist/Components/Content'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import CalendarListNew from '../components/AppNavigation/CalendarList/CalendarListNew.vue'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'
import CalendarGrid from '../components/CalendarGrid.vue'

// Import CalDAV related methods
import {
	initializeClientForPublicView,
	initializeClientForUserView,
} from '../services/caldavService.js'

// Import others
import { uidToHexColor } from '../utils/color.js'
import {
	dateFactory,
	getUnixTimestampFromDate,
	getYYYYMMDDFromFirstdayParam,
} from '../utils/date.js'
import getTimezoneManager from '../services/timezoneDataProviderService'
import logger from '../utils/logger'
import {
	mapGetters,
	mapState,
} from 'vuex'
import loadMomentLocalization from '../utils/moment.js'
import { loadState } from '@nextcloud/initial-state'
import {
	showWarning,
} from '@nextcloud/dialogs'
import '@nextcloud/dialogs/styles/toast.scss'
import Trashbin from '../components/AppNavigation/CalendarList/Trashbin'
import AppointmentConfigList from '../components/AppNavigation/AppointmentConfigList'

export default {
	name: 'Calendar',
	components: {
		AppointmentConfigList,
		CalendarGrid,
		EmptyCalendar,
		EmbedTopNavigation,
		Settings,
		CalendarList,
		AppNavigationHeader,
		Content,
		AppContent,
		AppNavigation,
		AppNavigationSpacer,
		CalendarListNew,
		Trashbin,
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
			hasTrashBin: 'hasTrashBin',
		},
		),
		...mapState({
			eventLimit: state => state.settings.eventLimit,
			skipPopover: state => state.settings.skipPopover,
			showWeekends: state => state.settings.showWeekends,
			showWeekNumbers: state => state.settings.showWeekNumbers,
			slotDuration: state => state.settings.slotDuration,
			defaultReminder: state => state.settings.defaultReminder,
			showTasks: state => state.settings.showTasks,
			timezone: state => state.settings.timezone,
			modificationCount: state => state.calendarObjects.modificationCount,
			disableAppointments: state => state.settings.disableAppointments,
		}),
		defaultDate() {
			return getYYYYMMDDFromFirstdayParam(this.$route.params?.firstDay ?? 'now')
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return !this.isPublicShare
				&& !this.isEmbedded
				&& this.$route.name !== 'EditPopoverView'
				&& this.$route.name !== 'EditSidebarView'
		},
		isSelectable() {
			return !this.isPublicShare && !this.isEmbedded
		},
		isAuthenticatedUser() {
			return !this.isPublicShare && !this.isEmbedded
		},
		isPublicShare() {
			return this.$route.name.startsWith('Public')
		},
		isEmbedded() {
			return this.$route.name.startsWith('Embed')
		},
		showHeader() {
			return this.isPublicShare && this.isEmbedded
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
		hasAppointmentsFeature() {
			// TODO: Remove the end condition when Calendar doesn't support server < 23
			return !this.disableAppointments && parseInt(OC.config.version.split('.')[0]) >= 23
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
			defaultReminder: loadState('calendar', 'default_reminder'),
			talkEnabled: loadState('calendar', 'talk_enabled'),
			tasksEnabled: loadState('calendar', 'tasks_enabled'),
			timezone: loadState('calendar', 'timezone'),
			showTasks: loadState('calendar', 'show_tasks'),
			hideEventExport: loadState('calendar', 'hide_event_export'),
			forceEventAlarmType: loadState('calendar', 'force_event_alarm_type', false),
			disableAppointments: loadState('calendar', 'disable_appointments', false),
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
			const { calendars, trashBin } = await this.$store.dispatch('loadCollections')
			logger.debug('calendars and trash bin loaded', { calendars, trashBin })
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
				logger.info('User has no writable calendar, a new personal calendar will be created')
				this.loadingCalendars = true
				await this.$store.dispatch('appendCalendar', {
					displayName: this.$t('calendar', 'Personal'),
					color: uidToHexColor(this.$t('calendar', 'Personal')),
					order: 0,
				})
			}

			this.loadingCalendars = false
		}
	},
	async mounted() {
		if (this.timezone === 'automatic' && this.timezoneId === 'UTC') {
			const { toastElement }
				= showWarning(this.$t('calendar', 'The automatic time zone detection determined your time zone to be UTC.\nThis is most likely the result of security measures of your web browser.\nPlease set your time zone manually in the calendar settings.'), { timeout: 60000 })

			toastElement.classList.add('toast-calendar-multiline')
		}
		if (getTimezoneManager().getTimezoneForId(this.timezoneId) === null) {
			const { toastElement }
				= showWarning(this.$t('calendar', 'Your configured time zone ({timezoneId}) was not found. Falling back to UTC.\nPlease change your time zone in the settings and report this issue.', { timezoneId: this.timezoneId }), { timeout: 60000 })

			toastElement.classList.add('toast-calendar-multiline')
		}

		await this.loadMomentLocale()
	},
	methods: {
		/**
		 * Loads the locale data for moment.js
		 *
		 * @return {Promise<void>}
		 */
		async loadMomentLocale() {
			const locale = await loadMomentLocalization()
			this.$store.commit('setMomentLocale', { locale })
		},
	},
}
</script>
