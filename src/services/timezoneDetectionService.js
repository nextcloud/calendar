/**
 * @copyright Copyright (c) 2019 Georg Ehrke
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
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import jstz from 'jstz'

/**
 * Returns the current timezone of the user
 *
 * @returns {String} Current timezone of user
 */
export default () => {
	if (window.Intl && typeof window.Intl === 'object') {
		const { timeZone } = Intl.DateTimeFormat().resolvedOptions()
		if (timeZone) {
			return timeZone
		}
	}

	const determinedTimezone = jstz.determine()
	if (!determinedTimezone) {
		return 'UTC'
	}

	const timezoneName = determinedTimezone.name()
	if (!timezoneName) {
		return 'UTC'
	}

	return timezoneName
}
