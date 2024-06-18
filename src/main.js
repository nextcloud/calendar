/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import 'vite/modulepreload-polyfill'

import 'core-js/stable/index.js'

import './css/calendar.scss'

import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import store from './store/index.js'
import { sync } from 'vuex-router-sync'
import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import AppointmentConfig from './models/appointmentConfig.js'
import ClickOutside from 'vue-click-outside'
import VTooltip from 'v-tooltip'
import VueShortKey from 'vue-shortkey'
import windowTitleService from './services/windowTitleService.js'
import { createPinia, PiniaVuePlugin } from 'pinia'
import useAppointmentConfigsStore from './store/appointmentConfigs.js'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

// register global components
Vue.directive('ClickOutside', ClickOutside)
Vue.use(VTooltip)
Vue.use(VueShortKey, { prevent: ['input', 'textarea'] })

sync(store, router)

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

// The nextcloud-vue package does currently rely on t and n
Vue.prototype.t = translate
Vue.prototype.n = translatePlural

windowTitleService(router, store)

export default new Vue({
	el: '#content',
	router,
	store,
	render: h => h(App),
	pinia,
})

const appointmentsConfigsStore = useAppointmentConfigsStore()
appointmentsConfigsStore.addInitialConfigs(loadState('calendar', 'appointmentConfigs', []).map(config => new AppointmentConfig(config)))
