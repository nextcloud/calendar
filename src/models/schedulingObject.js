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
import { getParserManager } from 'calendar-js'
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
 * @param {Object} props Scheduling-object-props already provided
 * @returns {Object}
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
 * @returns {Object}
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
 * @returns {Object}
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
 * @returns {any} First VEvent / VJournal / VTodo / VFreeBusy
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
