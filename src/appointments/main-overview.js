/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import 'vite/modulepreload-polyfill'

import { loadState } from '@nextcloud/initial-state'
import Vue from 'vue'
import { translate, translatePlural } from '@nextcloud/l10n'

import Overview from '../views/Appointments/Overview.vue'

const configs = loadState('calendar', 'appointmentConfigs')
const userInfo = loadState('calendar', 'userInfo')

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

export default new Vue({
	el: '#appointments-overview',
	render: h => h(Overview, {
		props: {
			configs,
			userInfo,
		},
	}),
})
