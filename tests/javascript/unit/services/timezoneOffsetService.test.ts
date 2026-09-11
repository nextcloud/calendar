/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getTimezoneOffset } from '@/services/timezoneOffsetService'
import logger from '@/utils/logger.js'

vi.mock('@/utils/logger.js', () => ({
	default: {
		error: vi.fn(),
	},
}))

describe('services/timezoneOffsetService test suite', () => {
	afterEach(() => {
		vi.clearAllMocks()
	})

	it('falls back to UTC for an invalid timezone', () => {
		const offset = getTimezoneOffset(new Date('2026-01-01T00:00:00Z'), 'Invalid/Timezone')

		expect(offset).toBe(0)
		expect(logger.error).toHaveBeenCalledOnce()
	})
})
