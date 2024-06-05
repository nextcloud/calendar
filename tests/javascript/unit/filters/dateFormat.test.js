/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import dateFormat from "../../../../src/filters/dateFormat.js";

describe('format/dateFormat test suite', () => {

	it('should format an all-day date', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateFormat(date, true, 'de')).toMatchSnapshot()
	})

	it('should format a timed date', () => {
		const date = new Date(2019, 0, 1, 0, 0, 0, 0)
		expect(dateFormat(date, false, 'de')).toMatchSnapshot()
	})

})
