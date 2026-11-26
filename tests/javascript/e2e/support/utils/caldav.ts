/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type ICAL from 'ical.js'
import type { UserApi } from './api.ts'
import type { Occurrence } from './icalendar.ts'
import type { UserAccount } from './users.ts'

import { buildEvent, getEventComponents, getOccurrences } from './icalendar.ts'

/**
 * An event resource in a calendar, created with `Calendar.createEvent`.
 */
export class CalendarEvent {
	constructor(
		private readonly api: UserApi,
		/** CalDAV URL of the event */
		readonly url: string,
	) {}

	/**
	 * Fetch the saved iCalendar data of the event.
	 */
	async getData(): Promise<string> {
		const response = await this.api.send(this.url, 'get event')
		return response.text()
	}

	/**
	 * Fetch the saved events of the resource: the event or the series, and the exceptions of the series.
	 */
	async getComponents(): Promise<ICAL.Component[]> {
		return getEventComponents(await this.getData())
	}

	/**
	 * Fetch the start of each occurrence of the saved event.
	 * A recurring event needs to end, e.g. with `COUNT`.
	 *
	 * @return The starts, in the order of the occurrences
	 */
	async getOccurrenceStarts(): Promise<Date[]> {
		return getOccurrences(await this.getData(), 'summary').map(({ start }) => start)
	}
}

/**
 * A calendar of a user, created with `UserApi.createCalendar`.
 */
export class Calendar {
	private constructor(
		private readonly api: UserApi,
		/** CalDAV URL of the calendar */
		readonly url: string,
		/** URI of the calendar, the last segment of its CalDAV URL, e.g. `calendar-<uuid>` */
		readonly uri: string,
	) {}

	/**
	 * Create a new calendar of the user.
	 *
	 * @param api The API of the user owning the calendar
	 * @param displayName Name of the calendar shown in the app
	 */
	static async create(api: UserApi, displayName: string): Promise<Calendar> {
		const uri = `calendar-${crypto.randomUUID()}`
		const url = `./remote.php/dav/calendars/${api.user.userId}/${uri}/`
		await api.send(url, 'create calendar', {
			method: 'MKCALENDAR',
			headers: { 'Content-Type': 'application/xml' },
			data: `<?xml version="1.0" encoding="UTF-8"?>
<c:mkcalendar xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
	<d:set><d:prop><d:displayname>${displayName}</d:displayname></d:prop></d:set>
</c:mkcalendar>`,
		})
		return new Calendar(api, url, uri)
	}

	/** The user owning the calendar */
	get owner(): UserAccount {
		return this.api.user
	}

	/**
	 * Create an event today from 10:00 to 11:00 UTC.
	 *
	 * @param title Title of the event
	 * @param options Scheduling and recurrence of the event
	 * @param options.organizerEmail Email of the organizer of the event
	 * @param options.attendeeEmails Emails of the attendees of the event
	 * @param options.recurrenceRule iCalendar recurrence rule, e.g. `FREQ=DAILY;COUNT=3`
	 */
	async createEvent(
		title: string,
		{ organizerEmail, attendeeEmails, recurrenceRule }: { organizerEmail?: string, attendeeEmails?: string[], recurrenceRule?: string } = {},
	): Promise<CalendarEvent> {
		const uid = crypto.randomUUID()
		const start = new Date()
		start.setUTCHours(10, 0, 0, 0)
		const end = new Date(start.getTime() + 60 * 60 * 1000)

		const event = new CalendarEvent(this.api, `${this.url}${uid}.ics`)
		await this.api.send(event.url, 'create event', {
			method: 'PUT',
			headers: { 'Content-Type': 'text/calendar' },
			data: buildEvent({ uid, title, start, end, recurrenceRule, organizerEmail, attendeeEmails }),
		})
		return event
	}

	/**
	 * Share the calendar with another user, who can only read it.
	 *
	 * @param sharee The user to share the calendar with
	 */
	async shareReadOnlyWith(sharee: UserAccount): Promise<void> {
		// Without `<o:read-write/>`, the calendar is shared read-only.
		await this.api.send(this.url, `share calendar with ${sharee.userId}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/xml' },
			data: `<?xml version="1.0" encoding="UTF-8"?>
<o:share xmlns:d="DAV:" xmlns:o="http://owncloud.org/ns">
	<o:set><d:href>principal:principals/users/${sharee.userId}</d:href></o:set>
</o:share>`,
		})
	}

	/**
	 * Publish the calendar, so that anyone with the link can view it.
	 *
	 * @return Token of the public calendar, e.g. for `/apps/calendar/p/{token}`
	 */
	async publish(): Promise<string> {
		await this.api.send(this.url, 'publish calendar', {
			method: 'POST',
			headers: { 'Content-Type': 'application/xml' },
			data: '<?xml version="1.0" encoding="UTF-8"?><cs:publish-calendar xmlns:cs="http://calendarserver.org/ns/"/>',
		})

		const response = await this.api.send(this.url, 'get publish URL', {
			method: 'PROPFIND',
			headers: { 'Content-Type': 'application/xml', Depth: '0' },
			data: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<d:prop><cs:publish-url/></d:prop>
</d:propfind>`,
		})
		// e.g. <cs:publish-url><d:href>https://localhost/remote.php/dav/public-calendars/TOKEN</d:href></cs:publish-url>
		const body = await response.text()
		const publishUrl = body.match(/publish-url>\s*<[^>]*href>([^<]+)</)?.[1]
		if (publishUrl === undefined) {
			throw new Error(`No publish URL for ${this.url} in response: ${body}`)
		}
		return publishUrl.replace(/\/$/, '').split('/').pop()!
	}

	/**
	 * Fetch the occurrences of all saved events in the calendar, with the value of a property for each.
	 * Shows how a change was saved: exceptions change single occurrences,
	 * while changing this and future occurrences splits a series into two event resources.
	 *
	 * @param propertyName Name of the property to get the value of for each occurrence
	 * @return The number of event resources and the occurrences of all of them, ordered by their start
	 */
	async getOccurrences(propertyName: string): Promise<{ resourceCount: number, occurrences: Occurrence[] }> {
		const events = await this.getEvents()
		const occurrences = (await Promise.all(events.map((event) => event.getData())))
			.flatMap((calendarData) => getOccurrences(calendarData, propertyName))
			.sort((a, b) => a.start.getTime() - b.start.getTime())
		return { resourceCount: events.length, occurrences }
	}

	/**
	 * Fetch all event resources in the calendar, including the ones a series was split into.
	 */
	private async getEvents(): Promise<CalendarEvent[]> {
		const response = await this.api.send(this.url, 'list events', {
			method: 'PROPFIND',
			headers: { 'Content-Type': 'application/xml', Depth: '1' },
			data: '<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:getcontenttype/></d:prop></d:propfind>',
		})
		const body = await response.text()
		return [...body.matchAll(/<[^>]*href>([^<]+\.ics)</g)]
			.map((match) => new CalendarEvent(this.api, new URL(match[1], response.url()).href))
	}
}
