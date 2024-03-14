/**
 * @copyright 2024 Grigory Vodyanov <scratchx@gmx.com>
 *
 * @author 2024 Grigory Vodyanov <scratchx@gmx.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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

		expect(result[0].start).toEqual(new Date('2024-01-01T10:30:00Z'))
		expect(result[0].end).toEqual(new Date('2024-01-01T11:30:00Z'))
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

		expect(result[3].start).toEqual(new Date('2024-01-02T19:30:00Z'))
		expect(result[3].end).toEqual(new Date('2024-01-02T20:15:00Z'))
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

		expect(result[2].start).toEqual(new Date('2024-01-02T19:30:00Z'))
		expect(result[2].end).toEqual(new Date('2024-01-02T20:15:00Z'))
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

		expect(result[0].start).toEqual(new Date('2024-01-01T16:30:00Z'))
	})

})
