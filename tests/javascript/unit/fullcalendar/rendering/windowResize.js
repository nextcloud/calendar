/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import windowResize from "../../../../../src/fullcalendar/rendering/windowResize.js";

describe('fullcalendar/windowResize test suite', () => {

	it('should provide the correct height with header bar', () => {
		const window = {
			innerHeight: 1337
		}
		const header = {
			offsetHeight: 42
		}
		const view = {}

		expect(windowResize(window, header)(view)).toEqual(1295)
	})

	it('should provide the correct height without header bar', () => {
		const window = {
			innerHeight: 1337
		}
		const header = null
		const view = {}

		expect(windowResize(window, header)(view)).toEqual(1337)
	})
})
