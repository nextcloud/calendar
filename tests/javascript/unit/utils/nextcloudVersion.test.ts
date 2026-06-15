/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { isAtLeastVersion } from '@/utils/nextcloudVersion.ts'

describe('utils/nextcloudVersion test suite', () => {
	const originalVersion = OC.config.version

	afterEach(() => {
		OC.config.version = originalVersion
	})

	it.each([
		['34.0.4.1', false],
		['34.0.5.0', true],
		['34.0.6.2', true],
		['34.1.0.0', true],
		['33.9.9.9', false],
		['35.0.0.0', true],
		['34.0.5', true],
		['34', false],
	])('should compare %s against 34.0.5', (version, expected) => {
		OC.config.version = version
		expect(isAtLeastVersion(34, 0, 5)).toBe(expected)
	})

	it('should default minor and patch to zero', () => {
		OC.config.version = '35.0.0.1'
		expect(isAtLeastVersion(35)).toBe(true)
		expect(isAtLeastVersion(36)).toBe(false)
	})
})
