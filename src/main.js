/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 * @copyright Copyright (c) 2019 John Molakvoæ
 *
 * @author Georg Ehrke <oc.list@georgehrke.com>
 * @author John Molakvoæ <skjnldsv@protonmail.com>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import '@babel/polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import { getRequestToken } from 'nextcloud-auth'
import { linkTo } from 'nextcloud-router'

// TODO: remove and use in individual components

import { Multiselect } from 'nextcloud-vue'
import VueClipboard from 'vue-clipboard2'
import dateRangeFormatFilter from './filters/dateRangeFormat'
import VTooltip from 'v-tooltip'

Vue.config.devtools = true

Vue.use(VueClipboard)
Vue.filter('formatDateRage', dateRangeFormatFilter)
Vue.use(VTooltip)
Vue.component('Multiselect', Multiselect)

// CSP config for webpack dynamic chunk loading
// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

sync(store, router)

Vue.prototype.t = t
Vue.prototype.n = n
Vue.prototype.OC = OC
Vue.prototype.OCA = OCA

export default new Vue({
	el: '#content',
	router,
	store,
	render: h => h(App)
})
