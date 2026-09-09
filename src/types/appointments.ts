// SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Info about the appointment config owner.
 */
export interface AppointmentUserInfo {
	uid: string
	displayName: string | null
}

/**
 * Info about the visitor booking an appointment, prefilled from the
 * currently logged in user if any.
 */
export interface AppointmentVisitorInfo {
	displayName: string
	email: string
}

/**
 * A public appointment config as consumed by the booking and overview pages.
 */
export interface PublicAppointmentConfig {
	id: number
	token: string
	name: string
	description: string
	location: string
	visibility: string
	userId: string
	targetCalendarUri: string
	calendarFreeBusyUris: string[]
	availability: object | null
	start: number | null
	end: number | null
	length: number
	increment: number
	preparationDuration: number
	followupDuration: number
	totalLength: number
	timeBeforeNextSlot: number
	dailyMax: number | null
	futureLimit: number | null
	createTalkRoom: boolean
}

/**
 * A single bookable time slot.
 */
export interface AppointmentSlot {
	start: number
	end: number
}

/**
 * Payload emitted by `AppointmentDetails` when the visitor confirms the booking form.
 */
export interface AppointmentSavePayload {
	slot: AppointmentSlot
	description: string
	email: string
	displayName: string
	timeZone: string
}

/**
 * A booked appointment
 */
export interface AppointmentBooking {
	id: number
	created_at: number
	apptConfigId: number
	token: string
	displayName: string
	description: string
	email: string
	start: number
	end: number
	timezone: string
	confirmed: boolean
}
