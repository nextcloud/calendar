import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
import { createPinia, PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import App from './App.vue'
import AppointmentConfig from './models/appointmentConfig.js'
import router from './router.js'
import windowTitleService from './services/windowTitleService.js'
import useAppointmentConfigsStore from './store/appointmentConfigs.js'
import logger from './utils/logger.js'

/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import 'core-js/stable/index.js'
import '../css/calendar.scss'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

// CSP config for webpack dynamic chunk loading

__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

// The nextcloud-vue package does currently rely on t and n
Vue.prototype.t = translate
Vue.prototype.n = translatePlural

// Redirect Vue errors to Sentry
Vue.config.errorHandler = async function(error, vm, info) {
	logger.error(`[Vue error]: Error in ${info}: ${error}`, {
		error,
		vm,
		info,
	})
	window.onerror?.(error)
}

export default new Vue({
	el: '#content',
	router,
	render: (h) => h(App),
	pinia,
})

const appointmentsConfigsStore = useAppointmentConfigsStore()
appointmentsConfigsStore.addInitialConfigs(loadState('calendar', 'appointmentConfigs', []).map((config) => new AppointmentConfig(config)))

windowTitleService(router)
