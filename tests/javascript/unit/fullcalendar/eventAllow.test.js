/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import eventAllow from "../../../../src/fullcalendar/eventAllow.js";

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
