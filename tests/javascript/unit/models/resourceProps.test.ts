/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { formatRoomFeature } from '@/models/resourceProps'

describe('formatRoomFeature', () => {
	it.for([
		['PROJECTOR', 'Projector'],
		['projector', 'Projector'],
		['WHEELCHAIR-ACCESSIBLE', 'Wheelchair accessible'],
		['Espresso machine', 'Espresso machine'],
	])('should format %s', ([input, expected]) => {
		expect(formatRoomFeature(input)).toBe(expected)
	})
})
