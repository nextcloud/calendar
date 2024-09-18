/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import Vue from 'vue'

import Conflict from '../views/Appointments/Conflict.vue'

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

const link = loadState('calendar', 'appointment-link')
const booking = loadState('calendar', 'booking')

export default new Vue({
	el: '#appointment-conflict',
	render: h => h(Conflict, {
		props: {
			link,
			confirmed: booking.confirmed,
			start: booking.start,
			end: booking.end,
		},
	}),
})
