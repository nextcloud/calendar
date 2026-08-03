/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CalendarBlankSvg from '@mdi/svg/svg/calendar-blank.svg'
import { getRequestToken } from '@nextcloud/auth'
import { translate as t } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
import { registerContactsMenuAction } from '@nextcloud/vue/functions/contactsMenu'

import 'core-js/stable/index.js'
import '../css/calendar.scss'

// CSP config for webpack dynamic chunk loading

__webpack_nonce__ = btoa(getRequestToken())

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
// eslint-disable-next-line
__webpack_public_path__ = linkTo('calendar', 'js/')

// Decode calendar icon (inline data url -> raw svg)
const CalendarBlankSvgRaw = atob(CalendarBlankSvg.split(',')[1])

registerContactsMenuAction({
	id: 'calendar-availability',
	displayName: () => t('calendar', 'Show availability'),
	iconSvg: () => CalendarBlankSvgRaw,
	enabled: (entry) => entry.isUser,
	callback: async (args) => {
		const { createApp } = await import('vue')
		const { default: ContactsMenuAvailability } = await import('./views/ContactsMenuAvailability.vue')
		const { createPinia } = await import('pinia')
		const { translatePlural } = await import('@nextcloud/l10n')

		const pinia = createPinia()

		// Append container element to the body to mount the vm at
		const el = document.createElement('div')
		document.body.appendChild(el)

		const app = createApp(ContactsMenuAvailability, {
			userId: args.uid,
			userDisplayName: args.fullName,
			userEmail: args.emailAddresses[0],
		})

		app.config.globalProperties.$t = t
		app.config.globalProperties.$n = translatePlural
		app.config.globalProperties.$destroy = () => {
			app.unmount()
			el.remove()
		}

		// nextcloud-vue components still access translation helpers as instance methods.
		app.mixin({
			methods: {
				t,
				n: translatePlural,
			},
		})

		app.use(pinia)
		app.mount(el)
	},
})
