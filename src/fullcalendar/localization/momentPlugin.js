/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import moment from '@nextcloud/moment'
import { createPlugin } from '@fullcalendar/core'

/**
 * Creates a new moment object using the locale from the given Vuex store
 *
 * @param {object} $store The Vuex store
 * @param {object[]} data FullCalendar object containing the date etc.
 * @param {number[]} data.array Input data to initialize moment
 * @return {moment}
 */
const momentFactory = ($store, { array }) => {
	return moment(array).locale($store.state.settings.momentLocale)
}

/**
 * Construct a cmdFormatter that can be used to construct a FullCalendar plugin
 *
 * @param $store
 * @return {function(string, string):string} cmdFormatter function
 */
const cmdFormatterFactory = ($store) => (cmdStr, arg) => {
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
		const start = momentFactory($store, arg.start).format(cmdStr)
		const end = momentFactory($store, arg.end).format(cmdStr)

		if (start === end) {
			return start
		}

		return start + arg.defaultSeparator + end
	}

	return momentFactory($store, arg.start).format(cmdStr)
}

/**
 * Construct a moment plugin for FullCalendar using the locale from the given Vuex store
 *
 * @param {object} $store The Vuex store
 * @return {object} The FullCalendar plugin
 */
export default function momentPluginFactory($store) {
	return createPlugin({
		name: '@nextcloud/moment-plugin',
		cmdFormatter: cmdFormatterFactory($store),
	})
}
