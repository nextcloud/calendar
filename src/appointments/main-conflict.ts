/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'
import { createApp } from 'vue'
import Conflict from '@/views/Appointments/Conflict.vue'
import L10nMixin from '@/mixins/L10nMixin'

// CSP config for webpack dynamic chunk loading
__webpack_nonce__ = btoa(getRequestToken()!)

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
__webpack_public_path__ = linkTo('calendar', 'js/')

const link = loadState('calendar', 'appointment-link')
const booking = loadState<{
	link: string,
	confirmed: boolean,
	start: number,
	end: number,
}>('calendar', 'booking')

const app = createApp(Conflict, {
	link,
	confirmed: booking.confirmed,
	start: booking.start,
	end: booking.end,
})
app.mixin(L10nMixin)
app.mount('#appointment-conflict')
