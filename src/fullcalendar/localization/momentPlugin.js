/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
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
import store from './../../store'

/**
 * Creates a new moment object
 *
 * @param {Object} data The fullcalendar data
 * @param {Number[]} data.array Input data to initialize moment
 * @returns {moment}
 */
const momentFactory = ({ array }) => {
	return moment(array).locale(store.state.settings.momentLocale)
}

/**
 * Formats a date with given cmdStr
 *
 * @param {String} cmdStr The formatting string
 * @param {Object} arg An Object containing the date, etc.
 * @returns {String}
 */
const cmdFormatter = (cmdStr, arg) => {
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
	cmdFormatter,
})
