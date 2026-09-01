/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AutocompleteEntry } from '@/types/autocomplete'
import type { OcsEnvelope } from '@/types/ocs'

import { generateOcsUrl } from '@nextcloud/router'

export type AutocompleteResponse = OcsEnvelope<AutocompleteEntry[] | AutocompleteEntry>

export type AutocompleteOptions = {
	search: string
	itemType?: string
	itemId?: string
	sorter?: string
	shareTypes?: number[]
	limit?: number
}

/**
 * search for users, groups, contacts, ...
 *
 * @param search search options
 */
export async function autocomplete(search: AutocompleteOptions): Promise<AutocompleteEntry[]> {
	// construct query parameters
	const params = new URLSearchParams()
	params.set('search', search.search)
	if (search.itemType) {
		params.set('itemType', search.itemType)
	}
	if (search.itemId) {
		params.set('itemId', search.itemId)
	}
	if (search.sorter) {
		params.set('sorter', search.sorter)
	}
	for (const st of search.shareTypes ?? [0]) {
		params.append('shareTypes[]', String(st))
	}
	if (search.limit) {
		params.set('limit', String(search.limit))
	}
	// transceive
	const url = `${generateOcsUrl('/core/autocomplete/get')}?${params.toString()}`
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'OCS-APIREQUEST': 'true',
			Accept: 'application/json',
		},
		credentials: 'same-origin',
	})
	// handle protocol errors
	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(`Autocomplete error: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`)
	}
	// parse response
	const data = await response.json() as AutocompleteResponse
	// response sanity checks
	if (!data.ocs || !data.ocs.meta || !data.ocs.data || !data.ocs.meta.status) {
		throw new Error('Autocomplete error: malformed response')
	}
	if (data.ocs.meta.status !== 'ok') {
		throw new Error(`Autocomplete error: ${data.ocs.meta.message || 'unknown error'}`)
	}

	return Array.isArray(data.ocs.data) ? data.ocs.data as AutocompleteEntry[] : [data.ocs.data] as AutocompleteEntry[]
}
