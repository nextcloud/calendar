/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

	it('should add an alarm bell icon if event has an alarm', () => {
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
				percent: 100,
			},
		}

		eventRender({ event, el })

		expect(el.outerHTML).toContain('<div class="fc-event-nc-alarms" data-object-id="object123" data-recurrence-id="recurrence456">')
		expect(el.outerHTML).toContain('<span class="icon-event-reminder"><svg viewBox="0 0 24 24">')
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
