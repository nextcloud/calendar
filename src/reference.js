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
	const { createApp } = await import('vue')
	const { default: Calendar } = await import('./views/Calendar.vue')
	const { createPinia } = await import('pinia')

	const pinia = createPinia()

	const app = createApp(Calendar, {
		isWidget: true,
		isPublic: richObject.isPublic,
		referenceToken: richObject?.token,
		url: richObject.url,
	})

	app.use(pinia)
	app.config.globalProperties.$t = translate
	app.config.globalProperties.$n = translatePlural

	app.mixin({
		methods: {
			t: translate,
			n: translatePlural,
		},
	})

	const vueElement = app.mount(el)
	return new NcCustomPickerRenderResult(vueElement.$el, vueElement)
}, (el, renderResult) => {
	renderResult.object.$destroy()
}, true)

registerWidget('calendar_event', async (el, { richObject }) => {
	const { createApp } = await import('vue')
	const { default: EventReferenceWidget } = await import('./views/EventReferenceWidget.vue')

	const app = createApp(EventReferenceWidget, {
		richObject,
	})
	app.mount(el)
	return new NcCustomPickerRenderResult(el, app)
}, (el, renderResult) => {
	renderResult.object.$destroy()
})
