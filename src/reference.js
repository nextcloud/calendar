/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import 'vite/modulepreload-polyfill'

import { registerWidget, NcCustomPickerRenderResult } from '@nextcloud/vue/dist/Functions/registerReference.js'
import { translate, translatePlural } from '@nextcloud/l10n'
import './css/calendar.scss'

registerWidget('calendar_widget', async (el, { richObjectType, richObject, accessible, interactive }) => {
	const { default: Vue } = await import('vue')
	const { default: Calendar } = await import('./views/Calendar.vue')
	const { default: store } = await import('./store/index.js')
	Vue.prototype.$t = translate
	Vue.prototype.$n = translatePlural
	Vue.mixin({ methods: { t, n } })

	const Widget = Vue.extend(Calendar)
	const vueElement = new Widget({
		store,
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
