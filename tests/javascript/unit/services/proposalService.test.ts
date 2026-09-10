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

	it.each([
		[undefined, 'Network Error'],
		[{ headers: { 'content-type': 'text/html' }, status: 502, statusText: 'Bad Gateway' }, '502 Bad Gateway'],
		[{ headers: { 'content-type': 'application/json' }, status: 400, statusText: 'Bad Request', data: { ocs: { meta: { message: 'Invalid proposal' } } } }, 'Invalid proposal'],
	])('handles Axios failures without retaining request configuration (%j)', async (response, message) => {
		const networkError = Object.assign(new Error('Network Error'), {
			isAxiosError: true,
			response,
			config: { headers: { Authorization: 'private-test-value' } },
		})
		vi.mocked(axios.post).mockRejectedValue(networkError)

		const request = proposalService.listProposals()

		await expect(request).rejects.toThrow('Failed to list proposals')
		await expect(request).rejects.toHaveProperty('cause.message', `Unexpected error from proposal service: ${message}`)
		await expect(request).rejects.toHaveProperty('cause', expect.not.objectContaining({ cause: networkError }))
		const serviceError = await request.catch((error: Error) => error)
		expect(serviceError.cause).not.toHaveProperty('cause')
		expect(serviceError.cause).not.toHaveProperty('config')
		expect(logger.error).toHaveBeenNthCalledWith(
			1,
			'Proposal service transmission error',
			response?.data ? { ocsError: response.data } : { message },
		)
		expect(logger.error).toHaveBeenNthCalledWith(2, 'Failed to list proposals:', { error: serviceError.cause })
	})
})
