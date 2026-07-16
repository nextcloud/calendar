// SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Represents a single share entry of a calendar (a sharee).
 *
 * Mirrors the object produced by `getDefaultCalendarShareObject()` in
 * `src/models/calendarShare.js`.
 */
export interface CalendarShareInterface {
	/** Unique identifier of the share (base64 of the encoded href) */
	id: string | null
	/** Display name of the sharee */
	displayName: string | null
	/** Whether the share grants write access */
	writeable: boolean
	/** Whether the sharee is an individual user */
	isUser: boolean
	/** Whether the sharee is an admin-defined group */
	isGroup: boolean
	/** Whether the sharee is a user-defined group (circle) */
	isCircle: boolean
	/** Whether the sharee is a remote user on a federated instance */
	isRemoteUser: boolean
	/** URI necessary for deleting / updating the share */
	uri: string | null
}

/**
 * Scheduling transparency of a calendar.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6638#section-9.1
 */
export type CalendarTransparency = 'opaque' | 'transparent'

export type DefaultCalendarAlarmAction = 'DISPLAY' | 'EMAIL'

export type DefaultCalendarAlarm = {
	trigger: number
	action: DefaultCalendarAlarmAction
}

/**
 * Represents a calendar collection as used throughout the calendar app.
 *
 * Mirrors the object produced by `getDefaultCalendarObject()` /
 * `mapDavCollectionToCalendar()` in `src/models/calendar.js`.
 */
export interface CalendarInterface {
	/** Id of the calendar (base64 of the url) */
	id: string
	/** Visible display name */
	displayName: string
	/** Color of the calendar as a hex string */
	color: string
	/** Whether the calendar is visible in the grid */
	enabled: boolean
	/** Whether the calendar is currently loading events */
	loading: boolean
	/** Whether this calendar supports VEvents */
	supportsEvents: boolean
	/** Whether this calendar supports VJournals */
	supportsJournals: boolean
	/** Whether this calendar supports VTodos */
	supportsTasks: boolean
	/** The principal uri of the owner */
	owner: string
	/** Timezone set for this calendar, or null if none */
	timezone: string | null
	/** List of shares */
	shares: CalendarShareInterface[]
	/** Published url, or null if not published */
	publishURL: string | null
	/** Internal CalDAV url of this calendar */
	url: string
	/** Whether this calendar is read-only */
	readOnly: boolean
	/** The order of this calendar in the calendar-list */
	order: number
	/** Whether the calendar is shared with the current user */
	isSharedWithMe: boolean
	/** Whether the calendar belongs to a user who delegated to the current user */
	isDelegated: boolean
	/**
	 * Principal URL of the delegator whose home this calendar was fetched from
	 * (may differ from `owner` when the delegator only has access via a share).
	 */
	delegatorUrl: string
	/** Whether the calendar can be shared by the current user */
	canBeShared: boolean
	/** Whether the calendar can be published by the current user */
	canBePublished: boolean
	/** Whether the current user can create objects in this calendar */
	canCreateObject: boolean
	/** Whether the current user can modify objects in this calendar */
	canModifyObject: boolean
	/** Whether the current user can delete objects in this calendar */
	canDeleteObject: boolean
	/** Reference to the underlying cdav-lib object (false before it is loaded) */
	dav: object | false
	/** All calendar-objects from this calendar that have already been fetched */
	calendarObjects: string[]
	/** Time-ranges that have already been fetched for this calendar */
	fetchedTimeRanges: string[]
	/** Scheduling transparency */
	transparency: CalendarTransparency
	/** Default alarm/reminder for part-day events in seconds (null if disabled) */
	defaultAlarmPartDay: number | null
	/** Default alarm/reminder for full-day events in seconds (null if disabled) */
	defaultAlarmFullDay: number | null
	/** Default alarms for part-day events (NC35+ plural CalDAV props) */
	defaultAlarmsPartDay: DefaultCalendarAlarm[]
	/** Default alarms for full-day events (NC35+ plural CalDAV props) */
	defaultAlarmsFullDay: DefaultCalendarAlarm[]
}

/**
 * Represents an attendee from a calendar event component
 */
export type CalendarAttendee = {
	/** The email address of the attendee */
	email: string
	/** The common/display name of the attendee */
	commonName?: string
	/** The type of attendee (INDIVIDUAL, GROUP, RESOURCE, ROOM, etc.) */
	userType: string
}
