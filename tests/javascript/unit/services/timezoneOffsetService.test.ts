/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from 'vitest'
import { getTimezoneOffset } from '@/services/timezoneOffsetService.ts'
import logger from '@/utils/logger.js'

vi.mock('@/utils/logger.js', () => ({
	default: {
		error: vi.fn(),
	},
}))

describe('timezoneOffsetService', () => {
	it('falls back to UTC for an invalid timezone', () => {
		const date = new Date('2026-07-11T00:00:00Z')

		const offset = getTimezoneOffset(date, 'Invalid/Timezone')

		expect(offset).toBe(0)
		expect(logger.error).toHaveBeenCalledWith('Failed to compute timezone offset', {
			error: expect.any(RangeError),
		})
	})
})
