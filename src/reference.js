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
	const { default: store } = await import('./store/index.js')
	Vue.prototype.$t = translate
	Vue.prototype.$n = translatePlural
	Vue.mixin({ methods: { t, n } })

	const Widget = Vue.extend(Calendar)
	const vueElement = new Widget({
		store,
		propsData: {
			isWidget: true,
			referenceToken: richObject.token,
		},
	}).$mount(el)
	return new NcCustomPickerRenderResult(vueElement.$el, vueElement)
}, (el, renderResult) => {
	renderResult.object.$destroy()
}, true)
