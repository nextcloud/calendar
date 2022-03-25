/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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

/**
 * Adds data to the html element representing the event in the fullcalendar grid.
 * This is used to later on position the popover
 *
 * @param {object} data The destructuring object
 * @param {EventApi} data.event The fullcalendar event object
 * @param {Node} data.el The HTML element
 */
export default function({ event, el }) {
	if (el.classList.contains('fc-event-nc-task')) {
		if (el.classList.contains('fc-list-event')) {
			// List view
			const dotElement = el.querySelector('.fc-list-event-dot')
			dotElement.classList.remove('fc-list-event-dot')
			dotElement.classList.add('fc-list-event-checkbox')
			dotElement.style.color = dotElement.style.borderColor
		} else if (el.classList.contains('fc-daygrid-dot-event')) {
			// Dot event in day grid view
			const dotElement = el.querySelector('.fc-daygrid-event-dot')
			dotElement.classList.remove('fc-daygrid-event-dot')
			dotElement.classList.add('fc-daygrid-event-checkbox')
			dotElement.style.color = dotElement.style.borderColor
		} else {
			// AgendaView and all-day grid view
			const titleContainer = el.querySelector('.fc-event-title-container')
			const checkboxElement = document.createElement('div')
			checkboxElement.classList.add('fc-event-title-checkbox')
			titleContainer.prepend(checkboxElement)
		}
	}

	if (event.source === null) {
		el.dataset.isNew = 'yes'
	} else {
		el.dataset.objectId = event.extendedProps.objectId
		el.dataset.recurrenceId = event.extendedProps.recurrenceId
	}

	if (el.classList.contains('fc-list-event')) {
		const locationContainer = document.createElement('td')
		locationContainer.classList.add('fc-list-event-location')
		const descriptionContainer = document.createElement('td')
		descriptionContainer.classList.add('fc-list-event-description')

		el.appendChild(locationContainer)
		el.appendChild(descriptionContainer)

		if (event.extendedProps.location) {
			const location = document.createElement('span')
			location.appendChild(document.createTextNode(event.extendedProps.location))
			locationContainer.appendChild(location)
		}

		if (event.extendedProps.description) {
			const description = document.createElement('span')
			description.appendChild(document.createTextNode(event.extendedProps.description))
			descriptionContainer.appendChild(description)
		}
	}
}
