/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { translate, translatePlural } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
import { createApp } from 'vue'
import Booking from '../views/Appointments/Booking.vue'

// CSP config for webpack dynamic chunk loading

__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

const config = loadState('calendar', 'config')
const userInfo = loadState('calendar', 'userInfo')
const visitorInfo = loadState('calendar', 'visitorInfo', {
	displayName: '',
	email: '',
})

const app = createApp(Booking, {
	config,
	userInfo,
	visitorInfo,
})

app.config.globalProperties.$t = translate
app.config.globalProperties.$n = translatePlural
app.config.globalProperties.t = translate
app.config.globalProperties.n = translatePlural

const bookingInstance = app.mount('#appointment-booking')

export default bookingInstance
