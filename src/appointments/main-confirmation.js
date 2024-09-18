/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'
import { translate, translatePlural } from '@nextcloud/l10n'
import Vue from 'vue'

import Confirmation from '../views/Appointments/Confirmation.vue'

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

const booking = loadState('calendar', 'booking')

export default new Vue({
	el: '#appointment-confirmation',
	render: h => h(Confirmation, {
		props: {
			booking,
		},
	}),
})
