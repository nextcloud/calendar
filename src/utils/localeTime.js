/**
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { getCanonicalLocale } from '@nextcloud/l10n'

const locale = [getCanonicalLocale(), undefined].find(locale => {
	try {
		(new Date()).toLocaleString(locale)
	} catch (e) {
		return false
	}

	return true
})

/**
 * Format a time stamp as local time
 *
 * @param timeStamp {Number} unix times stamp in seconds
 * @param timeZoneId {string} IANA time zone identifier
 * @return {string} the formatted time
 */
export function timeStampToLocaleTime(timeStamp, timeZoneId) {
	return (new Date(timeStamp * 1000)).toLocaleString(locale, {
		timeZone: timeZoneId,
		hour: 'numeric',
		minute: 'numeric',
	})
}

/**
 * Format a time stamp as local date
 *
 * @param timeStamp {Number} unix times stamp in seconds
 * @param timeZoneId {string} IANA time zone identifier
 * @return {string} the formatted date
 */
export function timeStampToLocaleDate(timeStamp, timeZoneId) {
	return (new Date(timeStamp * 1000)).toLocaleDateString(locale, {
		timeZone: timeZoneId,
	})
}
