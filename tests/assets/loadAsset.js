/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
