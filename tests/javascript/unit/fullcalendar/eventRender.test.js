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
import eventRender from "../../../../src/fullcalendar/eventRender.js";

describe('fullcalendar/eventRender test suite', () => {

	it('should add extended properties from the event to the dataset of the dom element - existing event', () => {
		const el = document.createElement('div')
		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
			},
		}

		eventRender({ event, el })

		expect(el.dataset.isNew).toEqual(undefined)
		expect(el.dataset.objectId).toEqual('object123')
		expect(el.dataset.recurrenceId).toEqual('recurrence456')
	})

	it('should add extended properties from the event to the dataset of the dom element - new event', () => {
		const el = document.createElement('div')
		const event = {
			source: null,
			extendedProps: {},
		}

		eventRender({ event, el })

		expect(el.dataset.isNew).toEqual('yes')
		expect(el.dataset.objectId).toEqual(undefined)
		expect(el.dataset.recurrenceId).toEqual(undefined)
	})

})
