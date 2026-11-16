/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { resolveReference } from '@/services/referenceService.ts'

vi.mock('@nextcloud/axios')
vi.mock('@nextcloud/router', () => ({
	generateOcsUrl: vi.fn((url) => `/ocs/v2.php/${url}`),
}))

const url = 'https://nextcloud.testing/index.php/apps/deck/card/34'

/**
 * @param reference The reference returned for url
 */
function mockResolve(reference: unknown) {
	vi.mocked(axios.get).mockResolvedValue({ data: { ocs: { data: { references: { [url]: reference } } } } })
}

describe('services/referenceService test suite', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('should resolve an accessible reference', async () => {
		const reference = { richObjectType: 'deck-card', richObject: {}, openGraphObject: {}, accessible: true }
		mockResolve(reference)

		await expect(resolveReference(url)).resolves.toEqual(reference)
		expect(axios.get).toHaveBeenCalledWith('/ocs/v2.php/references/resolve', { params: { reference: url } })
	})

	it.each([
		[null],
		[{ richObjectType: 'deck-card', richObject: {}, openGraphObject: {}, accessible: false }],
	])('should return null for an unresolvable reference %#', async (reference) => {
		mockResolve(reference)

		await expect(resolveReference(url)).resolves.toBeNull()
	})

	it('should return null when the request fails', async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error('500'))

		await expect(resolveReference(url)).resolves.toBeNull()
	})
})
