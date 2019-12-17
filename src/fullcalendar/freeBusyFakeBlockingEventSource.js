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
 * Returns an event source for free-busy
 *
 * @param {String} id Identification for this source
 * @param {String[]} resources List of resources
 * @param {Date} eventStart Start of the event being edited / created
 * @param {Date} eventEnd End of the event being edited / created
 * @returns {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(id, resources, eventStart, eventEnd) {
	const resourceIds = resources.map((resource) => resource.id)

	return {
		id: 'free-busy-fake-blocking-event-source-' + id,
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async({ start, end, timeZone }, successCallback, failureCallback) => {

			if (resources.length === 1) {
				successCallback([{
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
						'blocking-event-free-busy--first-row',
						'blocking-event-free-busy--last-row',
					],
					resourceId: resourceIds[0],
				}])
			} else if (resources.length === 2) {
				successCallback([{
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
						'blocking-event-free-busy--first-row',
					],
					resourceId: resourceIds[0],
				}, {
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
						'blocking-event-free-busy--last-row',
					],
					resourceId: resourceIds[1],
				}])
			} else {
				successCallback([{
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
						'blocking-event-free-busy--first-row',
					],
					resourceIds: resourceIds.slice(0, 1),
				}, {
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
					],
					resourceIds: resourceIds.slice(1, -1),
				}, {
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					rendering: 'background',
					classNames: [
						'blocking-event-free-busy',
						'blocking-event-free-busy--last-row',
					],
					resourceIds: resourceIds.slice(-1),
				}])
			}
		},
	}
}
