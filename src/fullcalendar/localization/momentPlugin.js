/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import moment from '@nextcloud/moment'
import { createPlugin } from '@fullcalendar/core'
import useSettingsStore from '../../store/settings.js'

// TODO: We don't really need to use a factory pattern here anymore. It was introduced to fix a
//       reactivity bug with Vuex. Since we use Pinia now and don't need to pass the store all the
//       way down it can be refactored/reverted.
//       Ref commit 207b7a13655ae7f1e01ee0e7d40b5109a37c6174

/**
 * Creates a new moment object using the locale from the given Pinia store
 *
 * @param {object[]} data FullCalendar object containing the date etc.
 * @param {number[]} data.array Input data to initialize moment
 * @return {moment.Moment}
 */
const momentFactory = ({ array }) => {
	const settingsStore = useSettingsStore()
	return moment(array).locale(settingsStore.momentLocale)
}

/**
 * Construct a cmdFormatter that can be used to construct a FullCalendar plugin
 *
 * @return {function(string, string):string} cmdFormatter function
 */
const cmdFormatterFactory = () => (cmdStr, arg) => {
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

/**
 * Construct a moment plugin for FullCalendar using the locale from the given Vuex store
 *
 * @return {object} The FullCalendar plugin
 */
export default function momentPluginFactory() {
	return createPlugin({
		name: '@nextcloud/moment-plugin',
		cmdFormatter: cmdFormatterFactory(),
	})
}
