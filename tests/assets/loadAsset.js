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
import ICAL from 'ical.js'
import { AlarmComponent, AttendeeProperty, RecurValue, getParserManager } from '@nextcloud/calendar-js'

const fs = require('fs')

/**
 * global helper function to load an ics asset by name
 *
 * @param {string} assetName
 * @returns {string}
 */
global.loadICS = (assetName) => {
	return fs.readFileSync('tests/assets/ics/' + assetName + '.ics', 'UTF8')
}

/**
 * Loads an AlarmComponent from an asset
 *
 * @param {String} assetName Name of the asset
 * @returns {AlarmComponent}
 */
global.getAlarmComponentFromAsset = (assetName) => {
	const ics = loadICS(assetName)
	const jCal = ICAL.parse(ics.trim())
	const iCalComp = new ICAL.Component(jCal)

	return AlarmComponent.fromICALJs(iCalComp)
}

/**
 * Loads an AttendeeProperty from an asset
 *
 * @param {String} assetName Name of the asset
 * @returns {AttendeeProperty}
 */
global.getAttendeePropertyFromAsset = (assetName) => {
	const ics = loadICS(assetName)
	const iCalProp = ICAL.Property.fromString(ics.trim())

	return AttendeeProperty.fromICALJs(iCalProp)
}

/**
 * Loads a RecurValue from an asset
 *
 * @param {String} assetName Name of the asset
 * @returns {RecurValue}
 */
global.getRecurValueFromAsset = (assetName) => {
	const ics = loadICS(assetName)
	const iCalValue = ICAL.Recur.fromString(ics.trim())

	return RecurValue.fromICALJs(iCalValue)
}

/**
 * Loads an eventComponent from an asset
 *
 * @param {String} assetName Name of the asset
 * @param {DateTimeValue} recurrenceId RecurrenceId of instance
 */
global.getEventComponentFromAsset = (assetName, recurrenceId) => {
	const ics = loadICS(assetName)
	const parser = getParserManager().getParserForFileType('text/calendar')
	parser.parse(ics)

	const calendarComponent = parser.getAllItems()[0]
	const firstVObject = Array.from(calendarComponent.getVObjectIterator())[0]
	return firstVObject.recurrenceManager.getOccurrenceAtExactly(recurrenceId)
}
