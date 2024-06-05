/**
 * SPDX-FileCopyrightText: 2021 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { randomId } from '../../../../src/utils/randomId'

describe('utils/randomId test suite', () => {
	it('should generate hex strings', () => {
		for (let i = 0; i < 10; i++) {
			expect(randomId()).toMatch(/^[a-f0-9]+$/)
		}
	})
})
