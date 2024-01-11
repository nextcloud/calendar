/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { registerWidget, NcCustomPickerRenderResult } from '@nextcloud/vue/dist/Functions/registerReference.js'
import { linkTo } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'
import { translate, translatePlural } from '@nextcloud/l10n'
import '../css/calendar.scss'

__webpack_nonce__ = btoa(getRequestToken()) // eslint-disable-line
__webpack_public_path__ = linkTo('calendar', 'js/') // eslint-disable-line

registerWidget('calendar_widget', async (el, { richObjectType, richObject, accessible, interactive }) => {
	const { default: Vue } = await import('vue')
	const { default: Calendar } = await import('./views/Calendar.vue')
	const { createPinia, PiniaVuePlugin } = await import('pinia')

	Vue.use(PiniaVuePlugin)
	const pinia = createPinia()

	Vue.prototype.$t = translate
	Vue.prototype.$n = translatePlural
	Vue.mixin({ methods: { t, n } })

	const Widget = Vue.extend(Calendar)
	const vueElement = new Widget({
		pinia,
		propsData: {
			isWidget: true,
			isPublic: richObject.isPublic,
			referenceToken: richObject?.token,
			url: richObject.url,
		},
	}).$mount(el)
	return new NcCustomPickerRenderResult(vueElement.$el, vueElement)
}, (el, renderResult) => {
	renderResult.object.$destroy()
}, true)
