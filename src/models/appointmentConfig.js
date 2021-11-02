/**
 * @copyright Copyright (c) 2021 Richard Steinmetz <richard@steinmetz.cloud>
 *
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

/** @class */
export default class AppointmentConfig {

	/** @member {?number} */
	id

	/** @member {string} */
	name

	/** @member {string} */
	description

	/** @member {string} */
	location

	/** @member {string} */
	visibility

	/** @member {string} */
	targetCalendarUri

	/** @member {string} */
	availability

	/** @member {number} */
	length

	/** @member {number} */
	increment

	/** @member {number} */
	preparationDuration

	/** @member {number} */
	followupDuration

	/** @member {number} */
	buffer

	/** @member {?number} */
	dailyMax

	/** @member {?string} */
	freebusyUris

	/**
	 * Create a new AppointmentConfig from the given plain object data
	 *
	 * @param {{dailyMax: ?number, visibility: string, preparationDuration: number, length: number, description: string, increment: number, availability: string, followupDuration: number, name: string, location: string, id: ?number, buffer: number, targetCalendarUri: string, freebusyUris: ?string}} data The plain object containing the data from this instance
	 */
	constructor(data) {
		data ??= {}
		this.id = data.id
		this.name = data.name
		this.description = data.description
		this.location = data.location
		this.visibility = data.visibility
		this.targetCalendarUri = data.targetCalendarUri
		this.availability = data.availability
		this.length = tryParseInt(data.length) ?? 0
		this.increment = tryParseInt(data.increment) ?? 0
		this.preparationDuration = tryParseInt(data.preparationDuration)
		this.followupDuration = tryParseInt(data.followupDuration)
		this.buffer = tryParseInt(data.buffer)
		this.dailyMax = tryParseInt(data.dailyMax)
		this.freebusyUris = data.freebusyUris
	}

	/**
	 * Create a default appointment config instance from the given vuex store
	 *
	 * @param {object} store The vuex store object (e.g. this.$store)
	 * @return {AppointmentConfig} Default appointment config instance
	 */
	static createDefault(store) {
		return new AppointmentConfig({
			name: '',
			description: '',
			location: '',
			targetCalendarUri: store.getters.sortedCalendars[0].url,
			availability: '',
			visibility: 'PUBLIC',
			length: 5 * 60,
			increment: 15 * 60,
			preparationDuration: 0,
			followupDuration: 0,
			buffer: 0,
			freebusyUris: [],
		})

	}

	/**
	 * Clone this instance
	 *
	 * @return {AppointmentConfig} A cloned version of this instance
	 */
	clone() {
		return AppointmentConfig.fromJSON(JSON.stringify(this))
	}

	/**
	 * Parse a JSON string into a new AppointmentConfig instance
	 *
	 * @param {string} jsonString The JSON string to parse
	 * @return {AppointmentConfig} New instance parsed from given JSON string
	 */
	static fromJSON(jsonString) {
		return new AppointmentConfig(JSON.parse(jsonString))
	}

}

/**
 * Try to parse an int from the given value or return undefined
 *
 * @param {string|null|undefined} value The value to parse
 * @return {number|undefined} Parsed number or undefined
 */
function tryParseInt(value) {
	if (value === null || value === undefined) {
		return undefined
	}

	return parseInt(value)
}
