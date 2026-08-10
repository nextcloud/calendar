/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'
import { getLinkToConfig, getSettingsFromInitialState } from '@/utils/settings.js'
vi.mock('@nextcloud/initial-state')
vi.mock('@nextcloud/router')

describe('utils/settings test suite', () => {
	beforeEach(() => {
		linkTo.mockClear()
		loadState.mockReset()
	})

	it('should generate a link to the config api', () => {
		linkTo.mockImplementation(() => 'baseurl:')

		expect(getLinkToConfig('view')).toEqual('baseurl:/v1/config/view')
		expect(getLinkToConfig('weekends')).toEqual('baseurl:/v1/config/weekends')

		expect(linkTo).toHaveBeenCalledTimes(2)
		expect(linkTo).toHaveBeenNthCalledWith(1, 'calendar', 'index.php')
		expect(linkTo).toHaveBeenNthCalledWith(2, 'calendar', 'index.php')
	})

	it('should read the settings from the initial state', () => {
		const state = {
			app_version: '6.0.0',
			event_limit: false,
			first_run: true,
			show_weekends: false,
			show_week_numbers: true,
			skip_popover: true,
			slot_duration: '01:00:00',
			default_reminder_part_day: '-15',
			default_reminder_full_day: '-540',
			talk_enabled: true,
			tasks_enabled: true,
			timezone: 'Europe/Berlin',
			show_tasks: true,
			show_declined: false,
			hide_event_export: true,
			force_event_alarm_type: 'EMAIL',
			disable_appointments: true,
			can_subscribe_link: true,
			attachments_folder: '/Events',
			show_resources: false,
			publicCalendars: '[{"name":"a public calendar"}]',
			tasks_sidebar: false,
		}
		loadState.mockImplementation((app, key) => state[key])

		expect(getSettingsFromInitialState()).toEqual({
			appVersion: '6.0.0',
			eventLimit: false,
			firstRun: true,
			showWeekends: false,
			showWeekNumbers: true,
			skipPopover: true,
			slotDuration: '01:00:00',
			defaultReminderPartDay: '-15',
			defaultReminderFullDay: '-540',
			talkEnabled: true,
			tasksEnabled: true,
			timezone: 'Europe/Berlin',
			showTasks: true,
			showDeclined: false,
			hideEventExport: true,
			forceEventAlarmType: 'EMAIL',
			disableAppointments: true,
			canSubscribeLink: true,
			attachmentsFolder: '/Events',
			showResources: false,
			publicCalendars: '[{"name":"a public calendar"}]',
			tasksSidebar: false,
		})
	})

	it('should fall back to the server side defaults without initial state', () => {
		// The editor can be opened on pages that do not provide the calendar state
		loadState.mockImplementation((app, key, fallback) => fallback)

		expect(getSettingsFromInitialState()).toEqual({
			appVersion: '',
			eventLimit: true,
			firstRun: false,
			showWeekends: true,
			showWeekNumbers: false,
			skipPopover: false,
			slotDuration: '00:30:00',
			defaultReminderPartDay: 'none',
			defaultReminderFullDay: 'none',
			talkEnabled: false,
			tasksEnabled: false,
			timezone: 'automatic',
			showTasks: false,
			showDeclined: true,
			hideEventExport: false,
			forceEventAlarmType: false,
			disableAppointments: false,
			canSubscribeLink: false,
			attachmentsFolder: '/Calendar',
			showResources: true,
			publicCalendars: [],
			tasksSidebar: true,
		})
	})
})
