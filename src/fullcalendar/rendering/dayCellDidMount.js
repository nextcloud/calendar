/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { errorCatch } from '../utils/errors.js'

/**
 * Sets aria-current="date" on the current day cell for accessibility
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default errorCatch(function({ el }) {
	if (el.classList.contains('fc-day-today')) {
		el.setAttribute('aria-current', 'date')
	}
}, 'dayCellDidMount')
