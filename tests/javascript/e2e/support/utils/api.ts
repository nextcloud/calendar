/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { APIRequestContext, APIResponse } from '@playwright/test'
import type { UserAccount } from './users.ts'

import { Calendar } from './caldav.ts'
import { getAuthorization } from './users.ts'

/**
 * Prepares data on the server as a user, e.g. calendars and events, without going through the UI.
 * Get it with the `api` fixture, e.g. `api(user).createCalendar()`.
 */
export class UserApi {
	constructor(
		private readonly request: APIRequestContext,
		readonly user: UserAccount,
	) {}

	/**
	 * Create a new calendar of the user.
	 *
	 * @param displayName Name of the calendar shown in the app
	 */
	async createCalendar(displayName = 'Calendar'): Promise<Calendar> {
		return Calendar.create(this, displayName)
	}

	/**
	 * Set whether events open in the full editor instead of the popover,
	 * i.e. the inverse of "Enable simplified editor" in the settings of the Calendar app.
	 * Applies to pages loaded afterwards.
	 *
	 * @param skipPopover Whether to skip the popover
	 */
	async setSkipPopover(skipPopover: boolean): Promise<void> {
		await this.send('./index.php/apps/calendar/v1/config/skipPopover', 'set skipPopover', {
			method: 'POST',
			// Passes the CSRF check for requests not using a session
			headers: { 'OCS-APIRequest': 'true' },
			data: { value: skipPopover ? 'yes' : 'no' },
		})
	}

	/**
	 * Send a request authenticated as the user.
	 * Used by the handles this API returns, e.g. `Calendar`.
	 *
	 * @param url URL of the request, relative to the server
	 * @param action What the request does, for the error message, e.g. `create calendar`
	 * @param options The request
	 * @param options.method HTTP method, `GET` by default
	 * @param options.headers Additional headers
	 * @param options.data Body of the request
	 * @return The response
	 * @throws If the server responds with an error
	 */
	async send(
		url: string,
		action: string,
		{ method = 'GET', headers = {}, data }: { method?: string, headers?: Record<string, string>, data?: string | object } = {},
	): Promise<APIResponse> {
		const response = await this.request.fetch(url, {
			method,
			headers: { Authorization: getAuthorization(this.user), ...headers },
			data,
		})
		if (!response.ok()) {
			throw new Error(`Failed to ${action} (${method} ${url}) as ${this.user.userId}: ${response.status()} ${response.statusText()}`)
		}
		return response
	}
}
