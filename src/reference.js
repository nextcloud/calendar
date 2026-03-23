/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { translate, translatePlural } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
import { NcCustomPickerRenderResult, registerWidget } from '@nextcloud/vue/functions/registerReference'

import '../css/calendar.scss'

__webpack_nonce__ = btoa(getRequestToken())
__webpack_public_path__ = linkTo('calendar', 'js/') // eslint-disable-line

registerWidget('calendar_widget', async (el, { richObject }) => {
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
	app.config.globalProperties.$t = translate
	app.config.globalProperties.$n = translatePlural
	app.config.globalProperties.t = translate
	app.config.globalProperties.n = translatePlural
	app.use(pinia)
	app.mount(el)
	return new NcCustomPickerRenderResult(el, app)
}, (el, renderResult) => {
	renderResult.object.$destroy()
})
