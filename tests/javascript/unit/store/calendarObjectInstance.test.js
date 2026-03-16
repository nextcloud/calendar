/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { AttendeeProperty } from '@nextcloud/calendar-js'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useCalendarObjectInstanceStore from '../../../../src/store/calendarObjectInstance.js'

// Mock the talkService
vi.mock('@/services/talkService', () => ({
	updateRoomParticipantsFromEvent: vi.fn(),
}))

// Mock the timezone provider used internally by the store.
vi.mock('../../../../src/services/timezoneDataProviderService.js', () => ({
	default: vi.fn(() => ({
		getTimezoneForId: vi.fn((id) => ({ timezoneId: id })),
	})),
}))

/**
 * Builds a minimal calendarObjectInstance
 *
 * @return {object}
 */
function createMinimalCalendarObjectInstance() {
	return {
		eventComponent: {
			addProperty: vi.fn(),
			// setOrganizerFromNameAndEMail is called when organizer is passed
			setOrganizerFromNameAndEMail: vi.fn(),
			getFirstProperty: vi.fn(() => null),
		},
		attendees: [],
		organizer: null,
	}
}

describe('store/calendarObjects test suite', () => {
	it('should be true', () => {
		expect(true).toEqual(true)
	})
})

describe('store/calendarObjectInstance — addAttendee', () => {
	beforeEach(() => {
		// Create and activate a fresh Pinia instance before each test
		setActivePinia(createPinia())
	})

	it('should add an external attendee with SCHEDULE-AGENT=CLIENT on the AttendeeProperty', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'External User',
			uri: 'external@gmail.com',
			scheduleAgent: 'CLIENT',
		})

		expect(calendarObjectInstance.attendees).toHaveLength(1)

		const attendee = calendarObjectInstance.attendees[0]

		// The store object itself must carry the flag so other parts of the
		// UI (e.g. free/busy requests) can check it without re-reading the ICS.
		expect(attendee.scheduleAgent).toBe('CLIENT')

		// The SCHEDULE-AGENT=CLIENT, which tells the CalDAV server not to attempt
		// server-side iTIP scheduling for this address. Without this the PUT request is rejected for external users.
		expect(attendee.attendeeProperty.getParameterFirstValue('SCHEDULE-AGENT')).toBe('CLIENT')
	})

	it('should add an internal attendee WITHOUT setting SCHEDULE-AGENT', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'Internal User',
			uri: 'internal@mynextcloud.org',
			// scheduleAgent intentionally omitted — must default to null so
			// the server retains control of iTIP scheduling for local users.
		})

		expect(calendarObjectInstance.attendees).toHaveLength(1)

		const attendee = calendarObjectInstance.attendees[0]

		expect(attendee.scheduleAgent).toBeNull()
		// The parameter must be absent from the AttendeeProperty entirely so
		// the server applies its default (SERVER) scheduling behaviour.
		expect(attendee.attendeeProperty.getParameterFirstValue('SCHEDULE-AGENT')).toBeNull()
	})

	it('should add the attendee to eventComponent.addProperty', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'External User',
			uri: 'external@gmail.com',
			scheduleAgent: 'CLIENT',
		})

		// addProperty must be called exactly once with an AttendeeProperty
		expect(calendarObjectInstance.eventComponent.addProperty).toHaveBeenCalledOnce()
		const [passedProperty] = calendarObjectInstance.eventComponent.addProperty.mock.calls[0]
		expect(passedProperty).toBeInstanceOf(AttendeeProperty)
	})

	it('should set the organizer when one is passed and no organizer exists yet', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		const organizer = {
			displayname: 'Organizer Name',
			emailAddress: 'organizer@mynextcloud.org',
		}

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'External User',
			uri: 'external@gmail.com',
			scheduleAgent: 'CLIENT',
			organizer,
		})

		expect(calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail)
			.toHaveBeenCalledWith('Organizer Name', 'organizer@mynextcloud.org')
	})

	it('should NOT override an existing organizer when one is already set', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		// Pre-set an organizer to simulate an existing event
		calendarObjectInstance.organizer = {
			commonName: 'Existing Organizer',
			uri: 'existing@mynextcloud.org',
		}

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'External User',
			uri: 'external@gmail.com',
			scheduleAgent: 'CLIENT',
			organizer: {
				displayname: 'New Organizer',
				emailAddress: 'new@mynextcloud.org',
			},
		})

		// setOrganizerFromNameAndEMail must NOT have been called because an
		// organizer was already present
		expect(calendarObjectInstance.eventComponent.setOrganizerFromNameAndEMail)
			.not.toHaveBeenCalled()
	})

	it('should support adding multiple attendees independently', () => {
		const store = useCalendarObjectInstanceStore()
		const calendarObjectInstance = createMinimalCalendarObjectInstance()

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'Internal User',
			uri: 'internal@mynextcloud.org',
		})

		store.addAttendee({
			calendarObjectInstance,
			commonName: 'External User',
			uri: 'external@gmail.com',
			scheduleAgent: 'CLIENT',
		})

		expect(calendarObjectInstance.attendees).toHaveLength(2)

		const [internalAttendee, externalAttendee] = calendarObjectInstance.attendees

		expect(internalAttendee.scheduleAgent).toBeNull()
		expect(internalAttendee.attendeeProperty.getParameterFirstValue('SCHEDULE-AGENT')).toBeNull()

		expect(externalAttendee.scheduleAgent).toBe('CLIENT')
		expect(externalAttendee.attendeeProperty.getParameterFirstValue('SCHEDULE-AGENT')).toBe('CLIENT')
	})
})
