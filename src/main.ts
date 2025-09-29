import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'
import { createPinia } from 'pinia'
import { createApp }  from 'vue'
import App from './App.vue'
import AppointmentConfig from '@/models/appointmentConfig.js'
import router from '@/router.js'
import windowTitleService from '@/services/windowTitleService.js'
import useAppointmentConfigsStore from '@/store/appointmentConfigs.js'
import logger from '@/utils/logger.js'
import L10nMixin from '@/mixins/L10nMixin'

/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import 'core-js/stable/index.js'
import '../css/calendar.scss'

// CSP config for webpack dynamic chunk loading

__webpack_nonce__ = btoa(getRequestToken()!)

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
__webpack_public_path__ = linkTo('calendar', 'js/')

const app = createApp(App)
app.config.idPrefix = 'calendar'

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.mixin(L10nMixin)

// Redirect Vue errors to Sentry
app.config.errorHandler = function(error, vm, info): void {
	console.error(error)
	logger.error(`[Vue error]: Error in ${info}: ${error}`, {
		error,
		vm,
		info,
	})
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	window.onerror?.(error as any)
}

app.mount('#content')

const appointmentsConfigsStore = useAppointmentConfigsStore()
appointmentsConfigsStore.addInitialConfigs(loadState('calendar', 'appointmentConfigs', [])
	.map((config) => new AppointmentConfig(config)))

windowTitleService(router)
