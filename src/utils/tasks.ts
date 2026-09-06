/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateUrl } from '@nextcloud/router'

/**
 * Get the calendar ID and task ID from a task DAV URL.
 *
 * @param davUrl - The task DAV URL
 * @return The calendar ID and task ID
 */
export function parseTaskDavUrl(davUrl: string): { calendarId: string, taskId: string } {
	const davUrlParts = davUrl.split('/')
	const taskId = davUrlParts.pop()!
	const calendarId = davUrlParts.pop()!

	return { calendarId, taskId }
}

/**
 * Generate the Tasks app URL for a calendar task.
 *
 * @param davUrl - The task DAV URL
 * @return The task URL
 */
export function generateTaskUrl(davUrl: string): string {
	const { calendarId, taskId } = parseTaskDavUrl(davUrl)

	return generateUrl(`apps/tasks/calendars/${encodeURIComponent(calendarId)}/tasks/${encodeURIComponent(taskId)}`)
}
