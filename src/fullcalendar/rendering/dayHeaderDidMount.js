/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Adjusts the colSpan attribute of day-headers in the list view
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default function({ el }) {
	if (el.classList.contains('fc-list-day')) {
		el.firstChild.colSpan = 5
	}
}
