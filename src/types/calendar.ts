// SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

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
