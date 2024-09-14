/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { getFirstFreeSlot } from "../../../../src/services/freeBusySlotService.js";

describe('services/freeBusySlotService test suite', () => {

	it('should return the first rounded slot after blocking event end', () => {
		const events = [
			{
				start: '2024-01-01T09:00:00Z',
				end: '2024-01-01T10:00:00Z',
			},
		]

		let start = new Date('2024-01-01T08:30:00Z')
		let end = new Date('2024-01-01T09:30:00Z')

		const result = getFirstFreeSlot(start, end, events)

		expect(result[0].start).toEqual(new Date('2024-01-01T10:15:00Z'))
		expect(result[0].end).toEqual(new Date('2024-01-01T11:15:00Z'))
	})

	it('should return the same amount of suggested slots as events plus one if first blocking event starts after searched time', () => {
		// First blocking event starts after the searched time
		const events = [
			{
				start: '2024-01-01T09:00:00Z',
				end: '2024-01-01T10:00:00Z',
			},
			{
				start: '2024-01-01T12:00:00Z',
				end: '2024-01-01T14:00:00Z',
			},
			{
				start: '2024-01-02T18:00:00Z',
				end: '2024-01-02T19:00:00Z',
			},
		]

		let start = new Date('2024-01-01T08:00:00Z')
		let end = new Date('2024-01-01T08:45:00Z')

		const result = getFirstFreeSlot(start, end, events)

		expect(result.length).toEqual(events.length + 1)

		expect(result[3].start).toEqual(new Date('2024-01-02T19:15:00Z'))
		expect(result[3].end).toEqual(new Date('2024-01-02T20:00:00Z'))
	})

	it('should return the same amount of suggested slots as events if first blocking event conflicts with searched time', () => {
		// First blocking event starts before the searched time
		const events = [
			{
				start: '2023-12-31T09:00:00Z',
				end: '2024-01-01T10:00:00Z',
			},
			{
				start: '2024-01-01T12:00:00Z',
				end: '2024-01-01T14:00:00Z',
			},
			{
				start: '2024-01-02T18:00:00Z',
				end: '2024-01-02T19:00:00Z',
			},
		]

		let start = new Date('2024-01-01T08:00:00Z')
		let end = new Date('2024-01-01T08:45:00Z')

		const result = getFirstFreeSlot(start, end, events)

		expect(result.length).toEqual(events.length)

		expect(result[2].start).toEqual(new Date('2024-01-02T19:15:00Z'))
		expect(result[2].end).toEqual(new Date('2024-01-02T20:00:00Z'))
	})

	it('should not give slots between events if the difference is smaller than the searched time duration', () => {
		// First blocking event starts before the searched time
		const events = [
			{
				start: '2024-01-01T12:00:00Z',
				end: '2024-01-01T14:00:00Z',
			},
			{
				start: '2024-01-01T15:30:00Z',
				end: '2024-01-01T16:00:00Z',
			},
		]

		let start = new Date('2024-01-01T11:00:00Z')
		let end = new Date('2024-01-01T12:45:00Z')

		const result = getFirstFreeSlot(start, end, events)

		expect(result[0].start).toEqual(new Date('2024-01-01T16:15:00Z'))
	})

})
