/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { generateOcsUrl } from '@nextcloud/router'
import logger from '@/utils/logger.js'

export interface ResolvedReference {
	richObjectType: string
	richObject: unknown
	openGraphObject: Record<string, unknown>
	accessible: boolean
}

/**
 * Resolve a link to its rich reference.
 *
 * @param url The link to resolve
 * @return The resolved reference, or null if it can't be resolved or isn't accessible
 */
export async function resolveReference(url: string): Promise<ResolvedReference | null> {
	try {
		const response = await axios.get(generateOcsUrl('references/resolve'), {
			params: { reference: url },
		})
		const reference = response.data.ocs.data.references[url] as ResolvedReference | null
		return reference?.accessible ? reference : null
	} catch (error) {
		logger.warn('Failed to resolve reference', { url, error })
		return null
	}
}
