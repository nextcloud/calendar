/**
 * @copyright 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @author 2021 Christoph Wurst <christoph@winzerhof-wurst.at>
 *
 * @license AGPL-3.0-or-later
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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
