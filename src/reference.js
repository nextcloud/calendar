import { getRequestToken } from '@nextcloud/auth'
import { translate, translatePlural } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { NcCustomPickerRenderResult, registerWidget } from '@nextcloud/vue/functions/registerReference'

import '../css/calendar.scss'

__webpack_nonce__ = btoa(getRequestToken())
__webpack_public_path__ = linkTo('calendar', 'js/') // eslint-disable-line

// eslint-disable-next-line no-unused-vars
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
