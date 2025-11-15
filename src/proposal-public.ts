/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCSPNonce } from '@nextcloud/auth'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import ProposalPublic from './views/Proposal/ProposalPublic.vue'

__webpack_nonce__ = getCSPNonce()!

const pinia = createPinia()

window.addEventListener('DOMContentLoaded', () => {
	const app = createApp(ProposalPublic)
	app.use(pinia)
	app.mount('#calendar-content')
})
