/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import 'vite/modulepreload-polyfill'

import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import Vue from 'vue'

import Booking from '../views/Appointments/Booking.vue'

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

const config = loadState('calendar', 'config')
const userInfo = loadState('calendar', 'userInfo')
const visitorInfo = loadState('calendar', 'visitorInfo', {
	displayName: '',
	email: '',
})

export default new Vue({
	el: '#appointment-booking',
	render: h => h(Booking, {
		props: {
			config,
			userInfo,
			visitorInfo,
		},
	}),
})
