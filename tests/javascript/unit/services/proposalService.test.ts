/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import axios from '@nextcloud/axios'
import { proposalService } from '@/services/proposalService'
import logger from '@/utils/logger.js'

vi.mock('@nextcloud/axios', () => ({
	default: {
		post: vi.fn(),
	},
	isAxiosError: (error: unknown) => typeof error === 'object'
		&& error !== null
		&& 'isAxiosError' in error
		&& error.isAxiosError === true,
}))

vi.mock('@nextcloud/router', () => ({
	generateOcsUrl: vi.fn((path: string) => path),
}))

vi.mock('@/utils/logger.js', () => ({
	default: {
		error: vi.fn(),
	},
}))

describe('services/proposalService test suite', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('preserves an Axios network error without a response', async () => {
		const networkError = Object.assign(new Error('Network Error'), { isAxiosError: true })
		vi.mocked(axios.post).mockRejectedValue(networkError)

		const request = proposalService.listProposals()

		await expect(request).rejects.toThrow('Failed to list proposals')
		await expect(request).rejects.toHaveProperty('cause.cause', networkError)
		expect(logger.error).toHaveBeenCalledWith('Proposal service transmission error', { error: networkError })
	})
})
