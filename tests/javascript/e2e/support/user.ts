/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { APIRequestContext, Page } from '@playwright/test'
import type { UserAccount } from './users.ts'

import { login } from './login.ts'

/**
 * A user created for a test, with actions performed as that user.
 */
export class User implements UserAccount {
	readonly userId: string
	readonly password: string

	constructor(
		account: UserAccount,
		private readonly page: Page,
		private readonly request: APIRequestContext,
	) {
		this.userId = account.userId
		this.password = account.password
	}

	/**
	 * Log in as this user in the browser.
	 */
	async login() {
		await login(this.page, this)
	}

	/**
	 * Create a new calendar and publish it.
	 *
	 * @return The token of the public calendar, e.g. for `/apps/calendar/p/{token}`
	 */
	async createPublicCalendar(): Promise<string> {
		const headers = {
			Authorization: `Basic ${Buffer.from(`${this.userId}:${this.password}`).toString('base64')}`,
			'Content-Type': 'application/xml',
		}
		const calendarUrl = `./remote.php/dav/calendars/${this.userId}/public-${crypto.randomUUID()}/`

		const mkcalendar = await this.request.fetch(calendarUrl, {
			method: 'MKCALENDAR',
			headers,
			data: `<?xml version="1.0" encoding="UTF-8"?>
<c:mkcalendar xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
	<d:set><d:prop><d:displayname>Public calendar</d:displayname></d:prop></d:set>
</c:mkcalendar>`,
		})
		if (!mkcalendar.ok()) {
			throw new Error(`Failed to create calendar ${calendarUrl}: ${mkcalendar.status()} ${mkcalendar.statusText()}`)
		}

		const publish = await this.request.post(calendarUrl, {
			headers,
			data: '<?xml version="1.0" encoding="UTF-8"?><cs:publish-calendar xmlns:cs="http://calendarserver.org/ns/"/>',
		})
		if (!publish.ok()) {
			throw new Error(`Failed to publish calendar ${calendarUrl}: ${publish.status()} ${publish.statusText()}`)
		}

		const propfind = await this.request.fetch(calendarUrl, {
			method: 'PROPFIND',
			headers: { ...headers, Depth: '0' },
			data: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<d:prop><cs:publish-url/></d:prop>
</d:propfind>`,
		})
		if (!propfind.ok()) {
			throw new Error(`Failed to get publish URL of ${calendarUrl}: ${propfind.status()} ${propfind.statusText()}`)
		}
		// e.g. <cs:publish-url><d:href>https://localhost/remote.php/dav/public-calendars/TOKEN</d:href></cs:publish-url>
		const body = await propfind.text()
		const publishUrl = body.match(/publish-url>\s*<[^>]*href>([^<]+)</)?.[1]
		if (publishUrl === undefined) {
			throw new Error(`No publish URL for ${calendarUrl} in response: ${body}`)
		}
		return publishUrl.replace(/\/$/, '').split('/').pop()!
	}
}
