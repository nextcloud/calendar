/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { generateUrl } from '@nextcloud/router'

/**
 * Returns a link to the email an event was created from (Nextcloud Mail app),
 * or null if the event was not created from an email.
 *
 * @param {object} eventComponent The event component of the calendar object instance
 * @return {string|null}
 */
export function getMailDeepLink(eventComponent) {
	const messageId = eventComponent?.getFirstPropertyFirstValue?.('X-NEXTCLOUD-MAIL-MESSAGE-ID')
	if (!messageId) {
		return null
	}

	// Path of the mail.deep_link.open route of the Mail app
	return generateUrl('/apps/mail/open/{messageId}', { messageId })
}
