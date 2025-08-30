/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCSPNonce } from '@nextcloud/auth'
import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'

import ProposalPublic from './views/Proposal/ProposalPublic.vue'

__webpack_nonce__ = getCSPNonce()!

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

window.addEventListener('DOMContentLoaded', () => {
	new Vue({
		pinia,
		render: h => h(ProposalPublic),
	}).$mount('#calendar-content')
})
