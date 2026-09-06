/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { generateUrl } from '@nextcloud/router'

/**
 * Generate the Tasks app URL for a calendar task.
 *
 * @param davUrl - The task's DAV URL
 * @return The task URL
 */
export function generateTaskUrl(davUrl: string): string {
	const davUrlParts = davUrl.split('/')
	const taskId = davUrlParts.pop()!
	const calendarId = davUrlParts.pop()!

	return generateUrl(`apps/tasks/calendars/${encodeURIComponent(calendarId)}/tasks/${encodeURIComponent(taskId)}`)
}

/**
 * Works like urldecode() from php
 *
 * @see https://www.php.net/manual/en/function.urldecode.php
 * @param url - The url to be decoded
 * @return The decoded url
 */
export function urldecode(url: string) {
	return decodeURIComponent(url.replace(/\+/g, ' '))
}
