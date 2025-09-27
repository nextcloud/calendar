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
__webpack_nonce__ = btoa(getRequestToken()!)

// Correct the root of the app for chunk loading
// OC.linkTo matches the apps folders
// OC.generateUrl ensure the index.php (or not)
// We do not want the index.php since we're loading files
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
		const { default: L10nMixin } = await import('./mixins/L10nMixin.ts')

		const app = createApp(ContactsMenuAvailability, {
			userId: args.uid,
			userDisplayName: args.fullName,
			userEmail: args.emailAddresses[0],
		})

		const pinia = createPinia()
		app.use(pinia)

		app.mixin(L10nMixin)

		// Append container element to the body to mount the vm at
		const el = document.createElement('div')
		document.body.appendChild(el)

		app.mount(el)
	},
})
