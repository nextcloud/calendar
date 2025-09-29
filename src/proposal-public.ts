/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCSPNonce } from '@nextcloud/auth'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import ProposalPublic from '@/views/Proposal/ProposalPublic.vue'

__webpack_nonce__ = getCSPNonce()!

const app = createApp(ProposalPublic)

const pinia = createPinia()
app.use(pinia)

window.addEventListener('DOMContentLoaded', () => {
	app.mount('#calendar-content')
})
