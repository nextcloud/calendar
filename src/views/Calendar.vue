<!--
  - SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->
<template>
	<div v-if="isWidget" class="calendar-Widget">
		<EmbedTopNavigation v-if="!showEmptyCalendarScreen" :is-widget="true" />

		<CalendarGrid
			v-if="!showEmptyCalendarScreen"
			ref="calendarGridWidget"
			:is-widget="isWidget"
			:url="url"
			:is-authenticated-user="isAuthenticatedUser" />
		<EmptyCalendar v-else />

		<EditSimple v-if="showWidgetEventDetails" :is-widget="true" />
	</div>

	<NcContent v-else app-name="calendar" :class="classNames">
		<AppNavigation v-if="!isWidget && !isEmbedded && !showEmptyCalendarScreen">
			<!-- Date Picker, View Buttons, Today Button -->
			<AppNavigationHeader :is-public="!isAuthenticatedUser" />
			<template #list>
				<!-- Calendar / Subscription List -->
				<CalendarList
					:is-public="!isAuthenticatedUser"
					:loading-calendars="loadingCalendars" />
				<EditCalendarModal />

				<!-- Proposals -->
				<template v-if="isAuthenticatedUser">
					<ProposalEditor />
					<ProposalList />
				</template>

				<!-- Appointment Configuration List -->
				<template v-if="!disableAppointments && isAuthenticatedUser">
					<AppointmentConfigList />
				</template>

				<!-- Trashbin -->
				<Trashbin v-if="calendarsStore.hasTrashBin" />
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
			<div class="calendar-wrapper">
				<div v-if="isAuthenticatedUser" v-show="tasksSidebarEnabled" class="app-navigation-toggle-wrapper">
					<NcActions class="toggle-button app-navigation-toggle--prevent-overlap">
						<NcActionButton @click="toggletasksSidebar()">
							<template #icon>
								<PlaylistCheckIcon :size="20" />
							</template>
							{{ t('calendar', 'Show unscheduled tasks') }}
						</NcActionButton>
					</NcActions>
				</div>

				<CalendarGrid
					v-if="!showEmptyCalendarScreen"
					ref="CalendarGrid"
					:is-authenticated-user="isAuthenticatedUser" />
				<EmptyCalendar v-else />
			</div>
		</AppContent>

		<NcAppSidebar
			v-if="isAuthenticatedUser"
			v-show="tasksSidebar && tasksSidebarEnabled"
			:name="t('calendar', 'Unscheduled tasks')"
			@close="toggletasksSidebar()">
			<NcAppSidebarTab id="settings-tab" name="Settings">
				<!-- Task without End Date List -->
				<template>
					<UnscheduledTasksList
						@tasks-empty="handleTasksEmpty"
						@task-clicked="handleTaskClick" />
				</template>
			</NcAppSidebarTab>
		</NcAppSidebar>
		<!-- Edit modal -->
		<div ref="simpleEditorAnchor" class="simple-editor-anchor">
			<router-view />
		</div>
	</NcContent>
</template>

<script>
import {
	showWarning,
} from '@nextcloud/dialogs'
import { loadState } from '@nextcloud/initial-state'
// Import vue components
import {
	NcAppContent as AppContent,
	NcAppNavigation as AppNavigation,
	NcActionButton,
	NcActions,
	NcAppSidebar,
	NcAppSidebarTab,
	NcContent,
} from '@nextcloud/vue'
import { mapState, mapStores } from 'pinia'
import PlaylistCheckIcon from 'vue-material-design-icons/PlaylistCheck.vue'
import AppNavigationHeader from '../components/AppNavigation/AppNavigationHeader.vue'
import AppointmentConfigList from '../components/AppNavigation/AppointmentConfigList.vue'
import CalendarList from '../components/AppNavigation/CalendarList.vue'
import Trashbin from '../components/AppNavigation/CalendarList/Trashbin.vue'
import EditCalendarModal from '../components/AppNavigation/EditCalendarModal.vue'
import EmbedTopNavigation from '../components/AppNavigation/EmbedTopNavigation.vue'
import ProposalList from '../components/AppNavigation/Proposal/ProposalList.vue'
import Settings from '../components/AppNavigation/Settings.vue'
import UnscheduledTasksList from '../components/AppNavigation/UnscheduledTasksList.vue'
import CalendarGrid from '../components/CalendarGrid.vue'
import EmptyCalendar from '../components/EmptyCalendar.vue'
import EditSimple from './EditSimple.vue'
import ProposalEditor from './Proposal/ProposalEditor.vue'
import eventClick from '../fullcalendar/interaction/eventClick.js'
import { mapDavCollectionToCalendar } from '../models/calendar.js'
// Import CalDAV related methods
import {
	findAllCalendars,
	initializeClientForPublicView,
	initializeClientForUserView,
} from '../services/caldavService.js'
import { isNotifyPushAvailable, registerNotifyPushSyncListener } from '../services/notifyService.ts'
import getTimezoneManager from '../services/timezoneDataProviderService.js'
import useCalendarObjectsStore from '../store/calendarObjects.js'
import useCalendarsStore from '../store/calendars.js'
import useFetchedTimeRangesStore from '../store/fetchedTimeRanges.js'
import usePrincipalsStore from '../store/principals.js'
import useSettingsStore from '../store/settings.js'
import useWidgetStore from '../store/widget.js'
// Import others
import { uidToHexColor } from '../utils/color.js'
import {
	dateFactory,
	getUnixTimestampFromDate,
	getYYYYMMDDFromFirstdayParam,
} from '../utils/date.js'
import logger from '../utils/logger.js'
import loadMomentLocalization from '../utils/moment.js'

import '@nextcloud/dialogs/style.css'

export default {
	name: 'Calendar',
	components: {
		AppointmentConfigList,
		UnscheduledTasksList,
		CalendarGrid,
		EmptyCalendar,
		EmbedTopNavigation,
		Settings,
		CalendarList,
		AppNavigationHeader,
		NcContent,
		AppContent,
		AppNavigation,
		Trashbin,
		EditCalendarModal,
		EditSimple,
		NcActions,
		NcActionButton,
		PlaylistCheckIcon,
		NcAppSidebar,
		NcAppSidebarTab,
		ProposalEditor,
		ProposalList,
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
			backgroundSyncJob: null,
			timeFrameCacheExpiryJob: null,
			showEmptyCalendarScreen: false,
			tasksSidebarEnabled: false,
		}
	},

	computed: {
		...mapStores(
			useFetchedTimeRangesStore,
			useCalendarsStore,
			useCalendarObjectsStore,
			usePrincipalsStore,
			useSettingsStore,
			useWidgetStore,
		),

		...mapState(useSettingsStore, {
			timezoneId: 'getResolvedTimezone',
		}),

		...mapState(useSettingsStore, [
			'timezone',
			'disableAppointments',
			'tasksSidebar',
		]),

		defaultDate() {
			return getYYYYMMDDFromFirstdayParam(this.$route?.params?.firstDay ?? 'now')
		},

		isEditable() {
			// We do not allow drag and drop when the editor is open.
			return !this.isPublicShare
				&& !this.isEmbedded
				&& !this.isWidget
				&& this.$route?.name !== 'EditPopoverView'
				&& this.$route?.name !== 'EditFullView'
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
			return this.widgetStore.widgetEventDetailsOpen && this.$refs.calendarGridWidget.$el === this.widgetStore.widgetRef
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
		if (isNotifyPushAvailable() && registerNotifyPushSyncListener()) {
			logger.info('Using notify_push sync')
		} else {
			logger.info('Using periodic background sync')
			this.backgroundSyncJob = setInterval(async () => {
				const currentUserPrincipal = this.principalsStore.getCurrentUserPrincipal
				const calendars = (await findAllCalendars())
					.map((calendar) => mapDavCollectionToCalendar(calendar, currentUserPrincipal))
				for (const calendar of calendars) {
					this.calendarsStore.syncCalendar({ calendar, skipIfUnchangedSyncToken: true })
				}
			}, 1000 * 60)
		}

		this.timeFrameCacheExpiryJob = setInterval(() => {
			const timestamp = (getUnixTimestampFromDate(dateFactory()) - 60 * 10)
			const timeRanges = this.fetchedTimeRangesStore.getAllTimeRangesOlderThan(timestamp)

			for (const timeRange of timeRanges) {
				this.fetchedTimeRangesStore.removeTimeRange({
					timeRangeId: timeRange.id,
				})
				this.calendarsStore.deleteFetchedTimeRangeFromCalendarMutation({
					calendar: {
						id: timeRange.calendarId,
					},
					fetchedTimeRangeId: timeRange.id,
				})
			}
		}, 1000 * 60)
	},

	async beforeMount() {
		this.settingsStore.loadSettingsFromServer({
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
			tasksSidebar: loadState('calendar', 'tasks_sidebar', true),
		})
		this.settingsStore.initializeCalendarJsConfig()

		if (this.$route?.name.startsWith('Public') || this.$route?.name.startsWith('Embed') || this.isPublic) {
			await initializeClientForPublicView()
			const tokens = this.isWidget ? [this.referenceToken] : this.$route.params.tokens.split('-')
			const calendars = await this.calendarsStore.getPublicCalendars({ tokens })
			this.loadingCalendars = false

			if (calendars.length === 0) {
				this.showEmptyCalendarScreen = true
			}
		} else {
			await initializeClientForUserView()
			await this.principalsStore.fetchCurrentUserPrincipal()
			const { calendars, trashBin } = await this.calendarsStore.loadCollections()
			logger.debug('calendars and trash bin loaded', { calendars, trashBin })
			const owners = []
			calendars.forEach((calendar) => {
				if (owners.indexOf(calendar.owner) === -1) {
					owners.push(calendar.owner)
				}
			})
			owners.forEach((owner) => {
				this.principalsStore.fetchPrincipalByUrl({ url: owner })
			})

			const writeableCalendarIndex = calendars.findIndex((calendar) => {
				return !calendar.readOnly
			})

			// No writeable calendars? Create a new one!
			if (writeableCalendarIndex === -1) {
				logger.info('User has no writable calendar, a new personal calendar will be created')
				this.loadingCalendars = true
				await this.calendarsStore.appendCalendar({
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

		await this.principalsStore.fetchRoomAndResourcePrincipals()
		logger.debug('Fetched rooms and resources', {
			rooms: this.principalsStore.getRoomPrincipals,
			resources: this.principalsStore.getResourcePrincipals,
		})
	},

	methods: {
		/**
		 * Loads the locale data for moment.js
		 *
		 * @return {Promise<void>}
		 */
		async loadMomentLocale() {
			const locale = await loadMomentLocalization()
			this.settingsStore.setMomentLocale({ locale })
		},

		toggletasksSidebar() {
			this.settingsStore.toggleTasksSidebar()
		},

		handleTasksEmpty(isEmpty) {
			this.tasksSidebarEnabled = !isEmpty
		},

		handleTaskClick(task) {
			const grid = this.$refs.CalendarGrid
			eventClick(task, grid.$route, window)({ event: task })
		},

	},
}
</script>

<style lang="scss">
.app-navigation-toggle-wrapper {
	position: absolute;
	top: var(--app-navigation-padding);
	inset-inline-end: calc(0px - var(--app-navigation-padding));
	margin-inline-end: calc(-1 * var(--default-clickable-area));
}

.calendar-wrapper {
	position: relative;
	height: 100%;
	width: 100%;
}

.toggle-button {
	position: absolute;
	top: 2px;
	inset-inline-end: 50px;
	z-index: 1000;
}

.calendar-Widget {
	width: 100%;
}

.simple-editor-anchor {
	position: relative;
}
</style>
```
