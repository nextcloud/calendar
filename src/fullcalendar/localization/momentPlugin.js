import { createPlugin } from '@fullcalendar/core'
/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import moment from '@nextcloud/moment'
import useSettingsStore from '../../store/settings.js'

/**
 * Creates a new moment object using the locale from the global Pinia store
 *
 * @param {object[]} data FullCalendar object containing the date etc.
 * @param {number[]} data.array Input data to initialize moment
 * @return {moment.Moment}
 */
function momentFactory({ array }) {
	const settingsStore = useSettingsStore()
	return moment(array).locale(settingsStore.momentLocale)
}

/**
 * Formats a date with given cmdStr
 *
 * @param {string} cmdStr The formatting string
 * @param {object} arg An Object containing the date, etc.
 * @return {function(string, string):string} cmdFormatter function
 */
function cmdFormatter(cmdStr, arg) {
	// With our specific DateFormattingConfig,
	// cmdStr will always be a moment parsable string
	// like LT, etc.
	//
	// No need to manually parse it.
	//
	// This is not the case, if you use the standard FC
	// formatting config.

	// If arg.end is defined, this is a time-range
	if (arg.end) {
		const start = momentFactory(arg.start).format(cmdStr)
		const end = momentFactory(arg.end).format(cmdStr)

		if (start === end) {
			return start
		}

		return start + arg.defaultSeparator + end
	}

	return momentFactory(arg.start).format(cmdStr)
}

export default createPlugin({
	name: '@nextcloud/moment-plugin',
	cmdFormatter,
})
