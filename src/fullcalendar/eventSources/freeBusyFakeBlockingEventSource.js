/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Returns an event source for free-busy
 *
 * @param {string} id Identification for this source
 * @param {string[]} resources List of resources
 * @param {Date} eventStart Start of the event being edited / created
 * @param {Date} eventEnd End of the event being edited / created
 * @return {{startEditable: boolean, resourceEditable: boolean, editable: boolean, id: string, durationEditable: boolean, events: events}}
 */
export default function(id, resources, eventStart, eventEnd) {
	const resourceIds = resources.map((resource) => resource.id)

	return {
		id: 'free-busy-fake-blocking-event-source-' + id,
		editable: false,
		startEditable: false,
		durationEditable: false,
		resourceEditable: false,
		events: async ({ start, end, timeZone }, successCallback, failureCallback) => {
			if (resources.length === 1) {
				successCallback([{
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					display: 'background',
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
					display: 'background',
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
					display: 'background',
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
					display: 'background',
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
					display: 'background',
					classNames: [
						'blocking-event-free-busy',
					],
					resourceIds: resourceIds.slice(1, -1),
				}, {
					id: Math.random().toString(36).substring(7),
					start: eventStart.toISOString(),
					end: eventEnd.toISOString(),
					allDay: false,
					display: 'background',
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
