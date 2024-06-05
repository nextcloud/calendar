/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import eventAllow from "../../../../../src/fullcalendar/interaction/eventAllow.js";

describe('fullcalendar/eventAllow test suite', () => {

	it('should always allow to drop an event that does allow modifying all-days', () => {
		expect(eventAllow({ allDay: true }, { allDay: true, extendedProps: { canModifyAllDay: true }})).toEqual(true)
		expect(eventAllow({ allDay: true }, { allDay: false, extendedProps: { canModifyAllDay: true }})).toEqual(true)
		expect(eventAllow({ allDay: false }, { allDay: true, extendedProps: { canModifyAllDay: true }})).toEqual(true)
		expect(eventAllow({ allDay: false }, { allDay: false, extendedProps: { canModifyAllDay: true }})).toEqual(true)
	})

	it('should disallow changing the allday state when prohibited', () => {
		expect(eventAllow({ allDay: true }, { allDay: true, extendedProps: { canModifyAllDay: false }})).toEqual(true)
		expect(eventAllow({ allDay: true }, { allDay: false, extendedProps: { canModifyAllDay: false }})).toEqual(false)
		expect(eventAllow({ allDay: false }, { allDay: true, extendedProps: { canModifyAllDay: false }})).toEqual(false)
		expect(eventAllow({ allDay: false }, { allDay: false, extendedProps: { canModifyAllDay: false }})).toEqual(true)
	})
})
