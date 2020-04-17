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
 * Formats a date with given cmdStr
 *
 * @param {String} cmdStr The formatting string
 * @param {Object} arg An Object containing the date, etc.
 * @returns {String}
 */
const cmdFormatter = (cmdStr, arg) => {
	return formatWithCmdStr(cmdStr, arg)
}

export default createPlugin({
	cmdFormatter,
})

function formatWithCmdStr(cmdStr, arg) {
	console.debug(cmdStr, arg)

	const cmd = parseCmdStr(cmdStr)
	if (arg.end) {
		const startMom = convertToMoment(
			arg.start.array,
			arg.timeZone,
			arg.start.timeZoneOffset,
			store.state.settings.momentLocale
		)
		const endMom = convertToMoment(
			arg.end.array,
			arg.timeZone,
			arg.end.timeZoneOffset,
			store.state.settings.momentLocale
		)
		return formatRange(
			cmd,
			createMomentFormatFunc(startMom),
			createMomentFormatFunc(endMom),
			arg.separator
		)
	}

	return convertToMoment(
		arg.date.array,
		arg.timeZone,
		arg.date.timeZoneOffset,
		store.state.settings.momentLocale
	).format(cmd.whole) // TODO: test for this
}

function createMomentFormatFunc(mom) {
	return function(cmdStr) {
		return cmdStr ? mom.format(cmdStr) : '' // because calling with blank string results in ISO8601 :(
	}
}

function convertToMoment(input, timeZone, timeZoneOffset, locale) {
	let mom

	if (timeZone === 'local') {
		mom = moment(input)

	} else if (timeZone === 'UTC') {
		mom = moment.utc(input)

	} else if ((moment).tz) {
		mom = (moment).tz(input, timeZone)

	} else {
		mom = moment.utc(input)

		if (timeZoneOffset != null) {
			mom.utcOffset(timeZoneOffset)
		}
	}

	mom.locale(locale)

	return mom
}

/* Range Formatting (duplicate code as other date plugins)
---------------------------------------------------------------------------------------------------- */

function parseCmdStr(cmdStr) {
	const parts = cmdStr.match(/^(.*?)\{(.*)\}(.*)$/) // TODO: lookbehinds for escape characters

	if (parts) {
		const middle = parseCmdStr(parts[2])

		return {
			head: parts[1],
			middle,
			tail: parts[3],
			whole: parts[1] + middle.whole + parts[3],
		}
	} else {
		return {
			head: null,
			middle: null,
			tail: null,
			whole: cmdStr,
		}
	}
}

function formatRange(
	cmd,
	formatStart,
	formatEnd,
	separator
) {
	if (cmd.middle) {
		const startHead = formatStart(cmd.head)
		const startMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator)
		const startTail = formatStart(cmd.tail)

		const endHead = formatEnd(cmd.head)
		const endMiddle = formatRange(cmd.middle, formatStart, formatEnd, separator)
		const endTail = formatEnd(cmd.tail)

		if (startHead === endHead && startTail === endTail) {
			return startHead
				+ (startMiddle === endMiddle ? startMiddle : startMiddle + separator + endMiddle)
				+ startTail
		}
	}

	const startWhole = formatStart(cmd.whole)
	const endWhole = formatEnd(cmd.whole)

	if (startWhole === endWhole) {
		return startWhole
	} else {
		return startWhole + separator + endWhole
	}
}
