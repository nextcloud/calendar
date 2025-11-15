/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translate as t } from '@nextcloud/l10n'
import { NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import { createApp, h } from 'vue'
import CalendarIcon from 'vue-material-design-icons/CalendarBlank.vue'
import { errorCatch } from '../utils/errors.js'

/**
 * Adds our standardized emptyContent component if list view is empty
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default errorCatch(function({ el }) {
	const mountTarget = document.createElement('div')
	el.appendChild(mountTarget)

	const app = createApp({
		render() {
			return h(EmptyContent, {
				title: t('calendar', 'No events'),
				description: t('calendar', 'Create a new event or change the visible time-range'),
			}, {
				icon: () => h(CalendarIcon),
			})
		},
	})

	app.mount(mountTarget)
}, 'noEventsDidMount')
