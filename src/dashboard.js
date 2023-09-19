/**
 * @copyright Copyright (c) 2020 Julius Härtl <jus@bitgrid.net>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { generateFilePath } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'

// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath('calendar', '', 'js/')

document.addEventListener('DOMContentLoaded', function() {
	OCA.Dashboard.register('calendar', async (el) => {
		const { default: Vue } = await import(/* webpackChunkName: "dashboard-lazy" */'vue')
		const { translate, translatePlural } = await import(/* webpackChunkName: "dashboard-lazy" */'@nextcloud/l10n')
		const { default: Dashboard } = await import(/* webpackChunkName: "dashboard-lazy" */'./views/Dashboard.vue')
		const { default: store } = await import(/* webpackChunkName: "dashboard-lazy" */'./store/index.js')

		Vue.prototype.t = translate
		Vue.prototype.n = translatePlural
		Vue.prototype.OC = OC
		Vue.prototype.OCA = OCA

		const View = Vue.extend(Dashboard)
		new View({
			store,
			propsData: {},
		}).$mount(el)
	})
})
