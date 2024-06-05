/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getRequestToken } from '@nextcloud/auth'
import { loadState } from '@nextcloud/initial-state'
import { linkTo } from '@nextcloud/router'
import Vue from 'vue'
import { translate, translatePlural } from '@nextcloud/l10n'

import Overview from '../views/Appointments/Overview.vue'

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

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
