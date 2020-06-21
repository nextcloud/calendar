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
		const taskIcon = document.createElement('span')
		taskIcon.type = 'checkbox'
		taskIcon.classList.add('icon-event-task')
		if (event.extendedProps.darkText) {
			taskIcon.classList.add('icon-event-task--dark')
		} else {
			taskIcon.classList.add('icon-event-task--light')
		}
		if (event.extendedProps.percent === 100) {
			if (event.extendedProps.darkText) {
				taskIcon.classList.add('icon-event-task--checked--dark')
			} else {
				taskIcon.classList.add('icon-event-task--checked--light')
			}
		}
		el.firstChild.insertBefore(taskIcon, el.firstChild.firstChild)
	}

	if (event.source === null) {
		el.dataset.isNew = 'yes'
	} else {
		el.dataset.objectId = event.extendedProps.objectId
		el.dataset.recurrenceId = event.extendedProps.recurrenceId
	}
}
