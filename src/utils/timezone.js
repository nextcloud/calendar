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
import { translate as t } from '@nextcloud/l10n'

/**
 *
 * @param {String[]} timezoneList List of Olsen timezones
 * @param {Array} additionalTimezones List of additional timezones
 * @returns {[]}
 */
export function getSortedTimezoneList(timezoneList = [], additionalTimezones = []) {
	const sortedByContinent = {}
	const sortedList = []

	for (const timezoneId of timezoneList) {
		let [continent, name] = timezoneId.split('/', 2)
		if (!name) {
			name = continent
			// TRANSLATORS This refers to global timezones in the timezone picker
			continent = t('calendar', 'Global')
		}

		sortedByContinent[continent] = sortedByContinent[continent] || {
			continent,
			regions: [],
		}

		sortedByContinent[continent].regions.push({
			label: getReadableTimezoneName(name),
			cities: [],
			timezoneId,
		})
	}

	for (const additionalTimezone of additionalTimezones) {
		const { continent, label, timezoneId } = additionalTimezone

		sortedByContinent[continent] = sortedByContinent[continent] || {
			continent,
			regions: [],
		}

		sortedByContinent[continent].regions.push({
			label: label,
			cities: [],
			timezoneId,
		})
	}

	for (const continent in sortedByContinent) {
		if (!Object.prototype.hasOwnProperty.call(sortedByContinent, continent)) {
			continue
		}

		sortedByContinent[continent].regions.sort((a, b) => {
			if (a.label < b.label) {
				return -1
			}

			return 1
		})
		sortedList.push(sortedByContinent[continent])
	}

	// Sort continents by name
	sortedList.sort((a, b) => {
		if (a.continent < b.continent) {
			return -1
		}

		return 1
	})

	return sortedList
}

/**
 * Get human-readable name for timezoneId
 *
 * @param {String} timezoneId TimezoneId to turn human-readable
 * @returns {String}
 */
export function getReadableTimezoneName(timezoneId) {
	return timezoneId
		.split('_')
		.join(' ')
		.replace('St ', 'St. ')
		.split('/')
		.join(' - ')
}
