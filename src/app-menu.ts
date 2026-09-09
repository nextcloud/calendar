/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getCSPNonce } from '@nextcloud/auth'
import { subscribe } from '@nextcloud/event-bus'
import { translate, translatePlural } from '@nextcloud/l10n'
import { linkTo } from '@nextcloud/router'
import logger from '@/utils/logger.js'

declare module '@nextcloud/event-bus' {
	interface NextcloudEvents {
		'core:navigation:action': { id: string }
	}
}

__webpack_nonce__ = getCSPNonce()!
__webpack_public_path__ = linkTo('calendar', 'js/')

/** Id of the app menu action registered by `Application::registerNewEventAction` */
const NEW_EVENT_ACTION_ID = 'calendar:new-event'

/** The currently open dialog, if any */
let dialog: Promise<void> | undefined

subscribe('core:navigation:action', handleAppMenuActionClick)

/**
 * Handle clicks on app menu actions.
 *
 * @param action The action that was clicked
 * @param action.id The id of the clicked action
 */
function handleAppMenuActionClick(action: { id: string }): void {
	if (action.id !== NEW_EVENT_ACTION_ID || dialog !== undefined) {
		return
	}

	logger.debug('Opening the new event dialog')
	dialog = openNewEventDialog()
		.catch((error) => logger.error('Could not open the new event dialog', { error }))
		.then(() => {
			dialog = undefined
		})
}

/**
 * Mount the new event dialog, the promise resolves once it was closed again.
 *
 * This entry point is loaded on every page, so everything the editor needs
 * is only loaded when the dialog is actually requested.
 */
async function openNewEventDialog(): Promise<void> {
	const [{ createApp }, { createPinia }, { default: NewEventDialog }] = await Promise.all([
		import('vue'),
		import('pinia'),
		import('@/views/NewEventDialog.vue'),
	])

	const element = document.body.appendChild(document.createElement('div'))

	await new Promise<void>((resolve) => {
		const app = createApp(NewEventDialog, {
			onClose() {
				app.unmount()
				element.remove()
				resolve()
			},
		})

		// The calendar app and nextcloud-vue still rely on the global translation functions
		app.config.globalProperties.$t = translate
		app.config.globalProperties.$n = translatePlural
		app.config.globalProperties.t = translate
		app.config.globalProperties.n = translatePlural

		app.config.errorHandler = (error, _vm, info) => {
			logger.error(`[Vue error]: Error in ${info}: ${error}`, { error, info })
		}

		app.use(createPinia())
		app.mount(element)
	})
}
