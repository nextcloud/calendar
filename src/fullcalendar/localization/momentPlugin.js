/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
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
		cmdFormatter: cmdFormatterFactory($store),
	})
}
