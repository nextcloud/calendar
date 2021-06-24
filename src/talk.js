/*
 * @copyright Copyright (c) 2021 Jakob Röhrl <jakob.roehrl@web.de>
 *
 * @author Julius Härtl <jus@bitgrid.net>
 * @author Jakob Röhrl <jakob.roehrl@web.de>
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

import EventCreateDialog from './components/EventCreateDialog'
import { buildSelector } from './helpers/selector'

import { getRequestToken } from '@nextcloud/auth'
import { translate, translatePlural } from '@nextcloud/l10n'
import { generateUrl, generateFilePath } from '@nextcloud/router'

import Vue from 'vue'

// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath('calendar', '', 'js/')

Vue.prototype.t = translate
Vue.prototype.n = translatePlural
Vue.prototype.OC = OC

window.addEventListener('DOMContentLoaded', () => {
	if (!window.OCA?.Talk?.registerMessageAction) {
		return
	}

	window.OCA.Talk.registerMessageAction({
		label: t('calendar', 'Create an event'),
		icon: 'icon-calendar-dark',
		async callback({ message: { message, actorDisplayName }, metadata: { name: conversationName, token: conversationToken } }) {
			const shortenedMessageCandidate = message.replace(/^(.{255}[^\s]*).*/, '$1')
			const shortenedMessage = shortenedMessageCandidate === '' ? message.substr(0, 255) : shortenedMessageCandidate
			try {
				await buildSelector(EventCreateDialog, {
					title: shortenedMessage,
					description: message + '\n\n' + '['
						+ t('calendar', 'Message from {author} in {conversationName}', { author: actorDisplayName, conversationName })
						+ '](' + generateUrl('/call/' + conversationToken) + ')',
				})
			} catch (e) {
				console.debug('Event creation dialog was canceled')
			}
		},
	})
})
