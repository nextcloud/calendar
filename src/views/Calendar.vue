<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div v-if="isWidget" class="calendar-Widget">
		<EmbedTopNavigation v-if="!showEmptyCalendarScreen" :is-widget="true" />

		<CalendarGrid v-if="!showEmptyCalendarScreen"
			ref="calendarGridWidget"
			:is-widget="isWidget"
			:url="url"
			:is-authenticated-user="isAuthenticatedUser" />
		<EmptyCalendar v-else />

		<EditSimple v-if="showWidgetEventDetails" :is-widget="true" />
	</div>

	<NcContent v-else app-name="calendar" :class="classNames">
		<AppNavigation v-if="!isWidget &&!isEmbedded && !showEmptyCalendarScreen">
			<!-- Date Picker, View Buttons, Today Button -->
			<AppNavigationHeader :is-public="!isAuthenticatedUser" />
			<template #list>
				<AppNavigationSpacer />

				<!-- Calendar / Subscription List -->
				<CalendarList :is-public="!isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
				<CalendarListNew v-if="!loadingCalendars && isAuthenticatedUser"
					:disabled="loadingCalendars" />
				<EditCalendarModal />

				<!-- Appointment Configuration List -->
				<template v-if="!disableAppointments && isAuthenticatedUser">
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
	</NcContent>
</template>

<script>
// Import vue components
import {
	NcAppNavigation as AppNavigation,
	NcAppNavigationSpacer as AppNavigationSpacer,
	NcAppContent as AppContent,
	NcContent,
} from '@nextcloud/vue'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import CalendarListNew from '../components/AppNavigation/CalendarList/CalendarListNew.vue'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import EditCalendarModal from '../components/AppNavigation/EditCalendarModal.vue'
import EditSimple from './EditSimple.vue'

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
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import logger from '../utils/logger.js'
import {
	mapGetters,
	mapState,
} from 'vuex'
import loadMomentLocalization from '../utils/moment.js'
import { loadState } from '@nextcloud/initial-state'
import {
	showWarning,
} from '@nextcloud/dialogs'
import '@nextcloud/dialogs/style.css'
import Trashbin from '../components/AppNavigation/CalendarList/Trashbin.vue'
import AppointmentConfigList from '../components/AppNavigation/AppointmentConfigList.vue'

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
		NcContent,
		AppContent,
		AppNavigation,
		AppNavigationSpacer,
		CalendarListNew,
		Trashbin,
		EditCalendarModal,
		EditSimple,
	},
	props: {
		// Is the calendar in a widget ?
		isWidget: {
			type: Boolean,
			default: false,
		},
		// The reference token for the widget for public share calendars
		referenceToken: {
			type: String,
			required: false,
		},
		// Is public share ?
		isPublic: {
			type: Boolean,
			required: false,
		},
		// Url of private calendar
		url: {
			type: String,
			required: false,
		},
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
			currentUserPrincipal: 'getCurrentUserPrincipal',
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
			attachmentsFolder: state => state.settings.attachmentsFolder,
		}),
		defaultDate() {
			return getYYYYMMDDFromFirstdayParam(this.$route?.params?.firstDay ?? 'now')
		},
		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return !this.isPublicShare
				&& !this.isEmbedded
				&& !this.isWidget
				&& this.$route?.name !== 'EditPopoverView'
				&& this.$route?.name !== 'EditSidebarView'
		},
		isSelectable() {
			return !this.isPublicShare && !this.isEmbedded && !this.isWidget
		},
		isAuthenticatedUser() {
			return !this.isPublicShare && !this.isEmbedded && !this.isWidget
		},
		isPublicShare() {
			if (this.isWidget) {
				return false
			}
			return this.$route.name.startsWith('Public')
		},
		isEmbedded() {
			if (this.isWidget) {
				return false
			}
			return this.$route.name.startsWith('Embed')
		},
		showWidgetEventDetails() {
			return this.$store.getters.widgetEventDetailsOpen && this.$refs.calendarGridWidget.$el === this.$store.getters.widgetRef
		},
		showHeader() {
			return this.isPublicShare && this.isEmbedded && this.isWidget
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
			defaultReminder: loadState('calendar', 'default_reminder'),
			talkEnabled: loadState('calendar', 'talk_enabled'),
			tasksEnabled: loadState('calendar', 'tasks_enabled'),
			timezone: loadState('calendar', 'timezone'),
			showTasks: loadState('calendar', 'show_tasks'),
			hideEventExport: loadState('calendar', 'hide_event_export'),
			forceEventAlarmType: loadState('calendar', 'force_event_alarm_type', false),
			disableAppointments: loadState('calendar', 'disable_appointments', false),
			canSubscribeLink: loadState('calendar', 'can_subscribe_link', false),
			attachmentsFolder: loadState('calendar', 'attachments_folder', false),
			showResources: loadState('calendar', 'show_resources', true),
			publicCalendars: loadState('calendar', 'publicCalendars', []),
		})
		this.$store.dispatch('initializeCalendarJsConfig')

		if (this.$route?.name.startsWith('Public') || this.$route?.name.startsWith('Embed') || this.isPublic) {
			await initializeClientForPublicView()
			const tokens = this.isWidget ? [this.referenceToken] : this.$route.params.tokens.split('-')
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
<style lang="scss">
.calendar-Widget {
	width: 100%;
}
</style>
```
