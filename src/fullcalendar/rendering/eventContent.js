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

/**
 * Adds data to the html element representing the event in the fullcalendar grid.
 * This is used to later on position the popover
 *
 * @param {Object} data The destructuring object
 * @param {EventApi} event The fullcalendar event object
 * @param {Node} el The HTML element
 */
export default function({ event, el }) {
	if (el.classList.contains('fc-event-nc-alarms')) {
		const notificationIcon = document.createElement('span')
		notificationIcon.classList.add('icon-event-reminder')
		if (event.extendedProps.darkText) {
			notificationIcon.classList.add('icon-event-reminder--dark')
		} else {
			notificationIcon.classList.add('icon-event-reminder--light')
		}
		el.firstChild.appendChild(notificationIcon)
	}

	if (el.classList.contains('fc-event-nc-task')) {
		// Is this a dot event in day-grid view
		if (el.classList.contains('fc-daygrid-dot-event')) {
			const dotElement = el.querySelector('.fc-daygrid-event-dot')
			dotElement.classList.remove('fc-daygrid-event-dot')
			dotElement.classList.add('fc-daygrid-event-checkbox')
			dotElement.style.color = dotElement.style.borderColor

			if (event.extendedProps.percent === 100) {
				dotElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				dotElement.classList.add('calendar-grid-checkbox')
			}
		} else {
			const titleContainer = el.querySelector('.fc-event-title-container')
			const checkboxElement = document.createElement('div')
			checkboxElement.classList.add('fc-event-title-checkbox')
			if (event.extendedProps.percent === 100) {
				checkboxElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				checkboxElement.classList.add('calendar-grid-checkbox')
			}

			titleContainer.prepend(checkboxElement)
		}
	}

	if (event.source === null) {
		el.dataset.isNew = 'yes'
	} else {
		el.dataset.objectId = event.extendedProps.objectId
		el.dataset.recurrenceId = event.extendedProps.recurrenceId
	}

	if (event.extendedProps.location != null && el.classList.contains('fc-list-event')) {
		const location = document.createElement('span')
		location.appendChild(document.createTextNode(' (' + event.extendedProps.location + ')'))
		el.lastChild.appendChild(location)
	}

	if (event.extendedProps.description != null && el.classList.contains('fc-list-event')) {
		const description = document.createElement('p')
		const descriptionLines = event.extendedProps.description.split('\n')
		const nbLines = Math.min(2, descriptionLines.length)
		for (let i = 0; i < nbLines; i++) {
			description.appendChild(document.createTextNode(descriptionLines[i]))
			if (i < nbLines - 1) {
				description.appendChild(document.createElement('br'))
			}
		}
		if (descriptionLines.length > 2) {
			description.appendChild(document.createElement('br'))
			description.appendChild(document.createTextNode('...'))
		}
		el.lastChild.appendChild(description)
	}
}
