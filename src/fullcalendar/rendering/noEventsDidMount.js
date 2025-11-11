/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { translate as t } from '@nextcloud/l10n'
import { NcEmptyContent as EmptyContent } from '@nextcloud/vue'
import Vue from 'vue'
import CalendarIcon from 'vue-material-design-icons/CalendarBlank.vue'
import { errorCatch } from '../utils/errors.js'

/**
 * Adds our standardized emptyContent component if list view is empty
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default errorCatch(function({ el }) {
	const EmptyContentClass = Vue.extend(EmptyContent)
	const instance = new EmptyContentClass({
		propsData: {
			title: t('calendar', 'No events'),
			description: t('calendar', 'Create a new event or change the visible time-range'),
		},
	})
	instance.$slots.icon = [instance.$createElement(CalendarIcon)]
	instance.$mount()
	el.appendChild(instance.$el)
}, 'noEventsDidMount')
