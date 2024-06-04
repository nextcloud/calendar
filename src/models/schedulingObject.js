/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getParserManager } from '@nextcloud/calendar-js'
import { getDateFromDateTimeValue } from '../utils/date.js'
import {
	ITIP_MESSAGE_ADD,
	ITIP_MESSAGE_CANCEL,
	ITIP_MESSAGE_COUNTER,
	ITIP_MESSAGE_DECLINECOUNTER,
	ITIP_MESSAGE_PUBLISH,
	ITIP_MESSAGE_REFRESH,
	ITIP_MESSAGE_REPLY,
	ITIP_MESSAGE_REQUEST,
} from './consts.js'

/**
 * Creates a complete scheduling-object-object based on given props
 *
 * @param {object} props Scheduling-object-props already provided
 * @return {object}
 */
const getDefaultSchedulingObject = (props = {}) => Object.assign({}, {
	// Id of the scheduling-object
	id: null,
	// The cdav-library object storing the scheduling-object
	dav: null,
	// The parsed calendar-js object
	calendarComponent: null,
	// The uid of the scheduling-object
	uid: null,
	// Recurrence-id of the scheduling-object
	recurrenceId: null,
	// The uri of the scheduling-object
	uri: null,
	// The scheduling method
	method: null,
	// Whether or not the method is PUBLISH
	isPublish: false,
	// Whether or not the method is REQUEST
	isRequest: false,
	// Whether or not the method is REPLY
	isReply: false,
	// Whether or not the method is ADD
	isAdd: false,
	// Whether or not the method is CANCEL
	isCancel: false,
	// Whether or not the method is REFRESH
	isRefresh: false,
	// Whether or not the method is COUNTER
	isCounter: false,
	// Whether or not the method is DECLINECOUNTER
	isDeclineCounter: false,
	// Whether or not the scheduling-object exists on the server
	existsOnServer: false,
}, props)

/**
 * Maps a calendar-object from c-dav to our calendar-object object
 *
 * @param {VObject} dav The c-dav VObject
 * @return {object}
 */
const mapCDavObjectToSchedulingObject = (dav) => {
	const parserManager = getParserManager()
	const parser = parserManager.getParserForFileType('text/calendar', {
		preserveMethod: true,
		processFreeBusy: true,
	})

	// This should not be the case, but let's just be on the safe side
	if (typeof dav.data !== 'string' || dav.data.trim() === '') {
		throw new Error('Empty scheduling object')
	}

	parser.parse(dav.data)
	const calendarComponentIterator = parser.getItemIterator()
	const calendarComponent = calendarComponentIterator.next().value
	if (!calendarComponent) {
		throw new Error('Empty scheduling object')
	}

	const firstVObject = getFirstObjectFromCalendarComponent(calendarComponent)

	let recurrenceId = null
	if (firstVObject.recurrenceId) {
		recurrenceId = getDateFromDateTimeValue(firstVObject.recurrenceId)
	}

	if (!calendarComponent.method) {
		throw new Error('Scheduling-object does not have method')
	}

	return getDefaultSchedulingObject({
		id: btoa(dav.url),
		dav,
		calendarComponent,
		uid: firstVObject.uid,
		uri: dav.url,
		recurrenceId,
		method: calendarComponent.method,
		isPublish: calendarComponent.method === ITIP_MESSAGE_PUBLISH,
		isRequest: calendarComponent.method === ITIP_MESSAGE_REQUEST,
		isReply: calendarComponent.method === ITIP_MESSAGE_REPLY,
		isAdd: calendarComponent.method === ITIP_MESSAGE_ADD,
		isCancel: calendarComponent.method === ITIP_MESSAGE_CANCEL,
		isRefresh: calendarComponent.method === ITIP_MESSAGE_REFRESH,
		isCounter: calendarComponent.method === ITIP_MESSAGE_COUNTER,
		isDeclineCounter: calendarComponent.method === ITIP_MESSAGE_DECLINECOUNTER,
		existsOnServer: true,
	})
}

/**
 * Maps a calendar-component from calendar-js to our calendar-object object
 *
 * @param {CalendarComponent} calendarComponent The calendarComponent to create the calendarObject from
 * @return {object}
 */
const mapCalendarJsToSchedulingObject = (calendarComponent) => {
	const firstVObject = getFirstObjectFromCalendarComponent(calendarComponent)

	let recurrenceId = null
	if (firstVObject.recurrenceId) {
		recurrenceId = getDateFromDateTimeValue(firstVObject.recurrenceId)
	}

	if (!calendarComponent.method) {
		throw new Error('Scheduling-object does not have method')
	}

	return getDefaultSchedulingObject({
		calendarComponent,
		uid: firstVObject.uid,
		recurrenceId,
		method: calendarComponent.method,
		isPublish: calendarComponent.method === ITIP_MESSAGE_PUBLISH,
		isRequest: calendarComponent.method === ITIP_MESSAGE_REQUEST,
		isReply: calendarComponent.method === ITIP_MESSAGE_REPLY,
		isAdd: calendarComponent.method === ITIP_MESSAGE_ADD,
		isCancel: calendarComponent.method === ITIP_MESSAGE_CANCEL,
		isRefresh: calendarComponent.method === ITIP_MESSAGE_REFRESH,
		isCounter: calendarComponent.method === ITIP_MESSAGE_COUNTER,
		isDeclineCounter: calendarComponent.method === ITIP_MESSAGE_DECLINECOUNTER,
	})
}

/**
 * Extracts the first object from the calendar-component
 *
 * @param {CalendarComponent} calendarComponent The calendar-component
 * @return {any} First VEvent / VJournal / VTodo / VFreeBusy
 */
const getFirstObjectFromCalendarComponent = (calendarComponent) => {
	const vObjectIterator = calendarComponent.getVObjectIterator()
	const firstVObject = vObjectIterator.next().value
	if (firstVObject) {
		return firstVObject
	}

	const vFreeBusyIterator = calendarComponent.getFreebusyIterator()
	return vFreeBusyIterator.next().value
}

export {
	getDefaultSchedulingObject,
	mapCDavObjectToSchedulingObject,
	mapCalendarJsToSchedulingObject,
}
