/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { getCSPNonce } from '@nextcloud/auth'

declare global {
	let __webpack_nonce__: ReturnType<typeof getCSPNonce>
	let __webpack_public_path__: string
}

export {}
