/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'

/**
 * Get the settings provided as initial state by the server.
 *
 * The calendar initial state is not available on every page - the editor can be
 * opened from any app - so every value falls back to the server side default.
 *
 * @return {object} Settings as expected by the `loadSettingsFromServer` action
 */
export function getSettingsFromInitialState() {
	const defaultReminder = loadState('calendar', 'default_reminder', 'none')

	return {
		appVersion: loadState('calendar', 'app_version', ''),
		eventLimit: loadState('calendar', 'event_limit', true),
		firstRun: loadState('calendar', 'first_run', false),
		showWeekends: loadState('calendar', 'show_weekends', true),
		showWeekNumbers: loadState('calendar', 'show_week_numbers', false),
		skipPopover: loadState('calendar', 'skip_popover', false),
		slotDuration: loadState('calendar', 'slot_duration', '00:30:00'),
		defaultReminder,
		defaultReminderPartDay: loadState('calendar', 'default_reminder_part_day', defaultReminder),
		defaultReminderFullDay: loadState('calendar', 'default_reminder_full_day', defaultReminder),
		talkEnabled: loadState('calendar', 'talk_enabled', false),
		tasksEnabled: loadState('calendar', 'tasks_enabled', false),
		timezone: loadState('calendar', 'timezone', 'automatic'),
		showTasks: loadState('calendar', 'show_tasks', false),
		hideEventExport: loadState('calendar', 'hide_event_export', false),
		forceEventAlarmType: loadState('calendar', 'force_event_alarm_type', false),
		disableAppointments: loadState('calendar', 'disable_appointments', false),
		canSubscribeLink: loadState('calendar', 'can_subscribe_link', false),
		attachmentsFolder: loadState('calendar', 'attachments_folder', '/Calendar'),
		showResources: loadState('calendar', 'show_resources', true),
		publicCalendars: loadState('calendar', 'publicCalendars', []),
		tasksSidebar: loadState('calendar', 'tasks_sidebar', true),
	}
}

/**
 * Get URL to modify config-key
 *
 * @param {string} key URL of config-key to modify
 * @return {string}
 */
export function getLinkToConfig(key) {
	return [
		linkTo('calendar', 'index.php'),
		'v1/config',
		key,
	].join('/')
}
