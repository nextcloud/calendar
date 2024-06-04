/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
		if (el.classList.contains('fc-list-event')) {
			// List view
			const dotElement = el.querySelector('.fc-list-event-dot')
			dotElement.classList.remove('fc-list-event-dot')
			dotElement.classList.add('fc-list-event-checkbox')
			dotElement.style.color = dotElement.style.borderColor

			if (event.extendedProps.percent === 100) {
				dotElement.classList.add('calendar-grid-checkbox-checked')
			} else {
				dotElement.classList.add('calendar-grid-checkbox')
			}
		} else if (el.classList.contains('fc-daygrid-dot-event')) {
			// Dot event in day grid view
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
			// AgendaView and all-day grid view
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
