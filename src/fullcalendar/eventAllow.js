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
 * Figure out whether or not an event can be dropped at a certain place
 *
 * This mostly enforces the policy that all events of a recurrence-set
 * must be of the same date-type
 *
 * @param {Object} dropInfo Info about location where event will be dropped
 * @param {EventApi} draggedEvent The fullcalendar event object
 * @returns {boolean}
 */
export default function(dropInfo, draggedEvent) {
	if (draggedEvent.extendedProps.canModifyAllDay) {
		return true
	}

	return dropInfo.allDay === draggedEvent.allDay
}
