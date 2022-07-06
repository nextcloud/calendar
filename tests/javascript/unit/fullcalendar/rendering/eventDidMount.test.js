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
import eventRender from "../../../../../src/fullcalendar/rendering/eventDidMount.js";

describe('fullcalendar/eventDidMount test suite', () => {

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

	it('should add an alarm bell icon if event has an alarm - dark', () => {
		const fcTime = document.createElement('span')
		fcTime.classList.add('fc-time')
		fcTime.appendChild(document.createTextNode('2pm'))
		const fcTitle = document.createElement('span')
		fcTitle.classList.add('fc-title')
		fcTitle.appendChild(document.createTextNode('Title 123'))

		const fcContent = document.createElement('div')
		fcContent.classList.add('fc-content')
		fcContent.appendChild(fcTime)
		fcContent.appendChild(fcTitle)

		const el = document.createElement('div')
		el.classList.add('fc-event-nc-alarms')
		el.appendChild(fcContent)

		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				darkText: true,
				percent: 100,
			},
		}

		eventRender({ event, el })

		expect(el.outerHTML).toEqual('<div class="fc-event-nc-alarms" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="fc-time">2pm</span><span class="fc-title">Title 123</span><span class="icon-event-reminder icon-event-reminder--dark"></span></div></div>')
	})

	it('should add an alarm bell icon if event has an alarm - light', () => {
		const fcTime = document.createElement('span')
		fcTime.classList.add('fc-time')
		fcTime.appendChild(document.createTextNode('2pm'))
		const fcTitle = document.createElement('span')
		fcTitle.classList.add('fc-title')
		fcTitle.appendChild(document.createTextNode('Title 123'))

		const fcContent = document.createElement('div')
		fcContent.classList.add('fc-content')
		fcContent.appendChild(fcTime)
		fcContent.appendChild(fcTitle)

		const el = document.createElement('div')
		el.classList.add('fc-event-nc-alarms')
		el.appendChild(fcContent)

		const event = {
			source: {},
			extendedProps: {
				objectId: 'object123',
				recurrenceId: 'recurrence456',
				darkText: false,
				percent: 100,
			},
		}

		eventRender({ event, el })

		expect(el.outerHTML).toEqual('<div class="fc-event-nc-alarms" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="fc-time">2pm</span><span class="fc-title">Title 123</span><span class="icon-event-reminder icon-event-reminder--light"></span></div></div>')
	})

	// TODO: fix me later
	// it('should prepend a checkbox before tasks - incomplete', () => {
	// 	const fcTime = document.createElement('span')
	// 	fcTime.classList.add('fc-time')
	// 	fcTime.appendChild(document.createTextNode('2pm'))
	// 	const fcTitle = document.createElement('span')
	// 	fcTitle.classList.add('fc-title')
	// 	fcTitle.appendChild(document.createTextNode('Title 123'))
	//
	// 	const fcContent = document.createElement('div')
	// 	fcContent.classList.add('fc-content')
	// 	fcContent.appendChild(fcTime)
	// 	fcContent.appendChild(fcTitle)
	//
	// 	const el = document.createElement('div')
	// 	el.classList.add('fc-event-nc-task')
	// 	el.appendChild(fcContent)
	//
	// 	const event = {
	// 		source: {},
	// 		extendedProps: {
	// 			objectId: 'object123',
	// 			recurrenceId: 'recurrence456',
	// 			darkText: false,
	// 			percent: 50,
	// 		},
	// 	}
	//
	// 	eventRender({ event, el })
	//
	// 	expect(el.outerHTML).toEqual('<div class="fc-event-nc-task" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="icon-event-task icon-event-task--light"></span><span class="fc-time">2pm</span><span class="fc-title">Title 123</span></div></div>')
	// })
	//
	// it('should prepend a checkbox before tasks - completed', () => {
	// 	const fcTime = document.createElement('span')
	// 	fcTime.classList.add('fc-time')
	// 	fcTime.appendChild(document.createTextNode('2pm'))
	// 	const fcTitle = document.createElement('span')
	// 	fcTitle.classList.add('fc-title')
	// 	fcTitle.appendChild(document.createTextNode('Title 123'))
	//
	// 	const fcContent = document.createElement('div')
	// 	fcContent.classList.add('fc-content')
	// 	fcContent.appendChild(fcTime)
	// 	fcContent.appendChild(fcTitle)
	//
	// 	const el = document.createElement('div')
	// 	el.classList.add('fc-event-nc-task')
	// 	el.appendChild(fcContent)
	//
	// 	const event = {
	// 		source: {},
	// 		extendedProps: {
	// 			objectId: 'object123',
	// 			recurrenceId: 'recurrence456',
	// 			darkText: false,
	// 			percent: 100,
	// 		},
	// 	}
	//
	// 	eventRender({ event, el })
	//
	// 	expect(el.outerHTML).toEqual('<div class="fc-event-nc-task" data-object-id="object123" data-recurrence-id="recurrence456"><div class="fc-content"><span class="icon-event-task icon-event-task--light icon-event-task--checked--light"></span><span class="fc-time">2pm</span><span class="fc-title">Title 123</span></div></div>')
	// })

})
