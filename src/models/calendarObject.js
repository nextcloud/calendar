/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getParserManager } from '@nextcloud/calendar-js'
import {
	COMPONENT_NAME_EVENT,
	COMPONENT_NAME_JOURNAL,
	COMPONENT_NAME_VTODO,
} from './consts.js'

/**
 * Creates a complete calendar-object-object based on given props
 *
 * @param {object} props Calendar-object-props already provided
 * @return {object}
 */
const getDefaultCalendarObjectObject = (props = {}) => Object.assign({}, {
	// Id of this calendar-object
	id: null,
	// Id of the associated calendar
	calendarId: null,
	// The cdav-library object storing the calendar-object
	dav: null,
	// The parsed calendar-js object
	calendarComponent: null,
	// The uid of the calendar-object
	uid: null,
	// The uri of the calendar-object
	uri: null,
	// The type of calendar-object
	objectType: null,
	// Whether or not the calendar-object is an event
	isEvent: false,
	// Whether or not the calendar-object is a journal
	isJournal: false,
	// Whether or not the calendar-object is a task
	isTodo: false,
	// Whether or not the calendar-object exists on the server
	existsOnServer: false,
}, props)

/**
 * Maps a calendar-object from c-dav to our calendar-object object
 *
 * @param {VObject} dav The c-dav VObject
 * @param {string} calendarId The calendar-id this object is associated with
 * @return {object}
 */
const mapCDavObjectToCalendarObject = (dav, calendarId) => {
	const parserManager = getParserManager()
	const parser = parserManager.getParserForFileType('text/calendar')

	// This should not be the case, but let's just be on the safe side
	if (typeof dav.data !== 'string' || dav.data.trim() === '') {
		throw new Error('Empty calendar object')
	}

	parser.parse(dav.data)
	const calendarComponentIterator = parser.getItemIterator()
	const calendarComponent = calendarComponentIterator.next().value
	if (!calendarComponent) {
		throw new Error('Empty calendar object')
	}

	const vObjectIterator = calendarComponent.getVObjectIterator()
	const firstVObject = vObjectIterator.next().value

	return getDefaultCalendarObjectObject({
		id: btoa(dav.url),
		calendarId,
		dav,
		calendarComponent,
		uid: firstVObject.uid,
		uri: dav.url,
		objectType: firstVObject.name,
		isEvent: firstVObject.name === COMPONENT_NAME_EVENT,
		isJournal: firstVObject.name === COMPONENT_NAME_JOURNAL,
		isTodo: firstVObject.name === COMPONENT_NAME_VTODO,
		existsOnServer: true,
	})
}

/**
 * Maps a calendar-component from calendar-js to our calendar-object object
 *
 * @param {CalendarComponent} calendarComponent The calendarComponent to create the calendarObject from
 * @param {string=} calendarId The associated calendar if applicable
 * @return {object}
 */
const mapCalendarJsToCalendarObject = (calendarComponent, calendarId = null) => {
	const vObjectIterator = calendarComponent.getVObjectIterator()
	const firstVObject = vObjectIterator.next().value
	if (!firstVObject) {
		throw new Error('Calendar object without vobjects')
	}

	return getDefaultCalendarObjectObject({
		calendarId,
		calendarComponent,
		uid: firstVObject.uid,
		objectType: firstVObject.name,
		isEvent: firstVObject.name === COMPONENT_NAME_EVENT,
		isJournal: firstVObject.name === COMPONENT_NAME_JOURNAL,
		isTodo: firstVObject.name === COMPONENT_NAME_VTODO,
	})
}

export {
	getDefaultCalendarObjectObject,
	mapCDavObjectToCalendarObject,
	mapCalendarJsToCalendarObject,
}
