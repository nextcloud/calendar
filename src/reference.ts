/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { linkTo } from '@nextcloud/router'
import { registerWidget } from '@nextcloud/vue/functions/reference'

import '../css/calendar.scss'

__webpack_nonce__ = btoa(getRequestToken()!)
__webpack_public_path__ = linkTo('calendar', 'js/')

const renderedWidgets = new Map<string, { unmount(): void }>()

// eslint-disable-next-line no-unused-vars
registerWidget('calendar_widget', async (el, { richObjectType, richObject, accessible, interactive }) => {
	const { createApp } = await import('vue')
	const { default: Calendar } = await import('./views/Calendar.vue')
	const { createPinia } = await import('pinia')
	const { default: L10nMixin } = await import('./mixins/L10nMixin.ts')
	const { NcCustomPickerRenderResult } = await import('@nextcloud/vue/functions/reference')

	const app = createApp(Calendar, {
		isWidget: true,
		isPublic: richObject.isPublic,
		referenceToken: richObject?.token,
		url: richObject.url,
	})

	const pinia = createPinia()
	app.use(pinia)

	app.mixin(L10nMixin)

	const vm = app.mount(el)

	const widgetId = Math.random().toString(16).slice(2)
	renderedWidgets.set(widgetId, app)
	el.setAttribute('data-widget-id', widgetId)

	return new NcCustomPickerRenderResult(vm.$el, app)
}, (el) => {
	const widgetId = el.getAttribute('data-widget-id')
	if (!widgetId) {
		return
	}

	renderedWidgets.get(widgetId)?.unmount()
	renderedWidgets.delete(widgetId)
})
