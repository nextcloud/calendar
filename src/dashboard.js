/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
		const { createPinia, PiniaVuePlugin } = await import(/* webpackChunkName: "dashboard-lazy" */'pinia')

		Vue.use(PiniaVuePlugin)
		const pinia = createPinia()

		Vue.prototype.t = translate
		Vue.prototype.n = translatePlural
		Vue.prototype.OC = OC
		Vue.prototype.OCA = OCA

		const View = Vue.extend(Dashboard)
		new View({
			propsData: {},
			pinia,
		}).$mount(el)
	})
})
