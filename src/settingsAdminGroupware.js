/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import 'core-js/stable/index.js'

import Vue from 'vue'
import GroupwareAdminSettings from './views/GroupwareAdminSettings.vue'
import { getRequestToken } from '@nextcloud/auth'
import { linkTo } from '@nextcloud/router'
import { translate, translatePlural } from '@nextcloud/l10n'

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

Vue.prototype.$t = translate
Vue.prototype.$n = translatePlural

// The nextcloud-vue package does currently rely on t and n
Vue.prototype.t = translate
Vue.prototype.n = translatePlural

export default new Vue({
	el: '#calendar-settings-admin-groupware',
	render: h => h(GroupwareAdminSettings),
})
