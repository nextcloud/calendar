/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { t } from '@nextcloud/l10n'
import { NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import { createApp } from 'vue'
import CalendarIcon from 'vue-material-design-icons/CalendarBlank.vue'

/**
 * Adds our standardized emptyContent component if list view is empty
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default function({ el }) {
	const app = createApp(EmptyContent, {
		title: t('calendar', 'No events'),
		description: t('calendar', 'Create a new event or change the visible time-range'),
	})
	const vm = app.mount(el)
	vm.$slots.icon = [vm.$createElement(CalendarIcon)]
}
