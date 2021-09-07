/**
 * @copyright Copyright (c) 2020 Georg Ehrke
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 *
 * @license AGPL-3.0-or-later
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
import Vue from 'vue'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import { translate as t } from '@nextcloud/l10n'

/**
 * Adds our standardized emptyContent component if list view is empty
 *
 * @param {object} data The destructuring object
 * @param {Node} data.el The HTML element
 */
export default function({ el }) {
	const EmptyContentClass = Vue.extend(EmptyContent)
	const instance = new EmptyContentClass({
		propsData: {
			icon: 'icon-calendar-dark',
		},
	})
	instance.$slots.default = [t('calendar', 'No events')]
	instance.$slots.desc = [t('calendar', 'Create a new event or change the visible time-range')]
	instance.$mount()
	el.appendChild(instance.$el)
}
